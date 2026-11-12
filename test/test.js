// Tests for autopreview.js (no dependencies: `node test/test.js`).
const assert = require('assert');
const { criarEstado, registrarEvento, deveTrocar } = require('../autopreview.js');

const md = (uri, extra) => ({ tipo: 'texto', uri, scheme: 'file', caminho: uri, sujo: false, ...extra });
const preview = uri => ({ tipo: 'custom', uri, viewType: 'vscode.markdown.preview.editor' });
let s = criarEstado();
const T = 1000;

// A link opens a .md file in the text editor: swap it.
registrarEvento(s, { abertas: [md('a.md')], fechadas: [], abertasAgora: ['a.md'] }, T);
assert.strictEqual(deveTrocar(s, md('a.md'), T + 300), true);

// Not .md, not on disk (untitled, read-only virtual docs), unsaved, diff: leave alone.
assert.strictEqual(deveTrocar(s, md('a.txt'), T), false);
assert.strictEqual(deveTrocar(s, md('x.md', { scheme: 'untitled' }), T), false);
assert.strictEqual(deveTrocar(s, md('b.md', { sujo: true }), T), false);
assert.strictEqual(deveTrocar(s, { tipo: 'diff', uri: 'c.md', scheme: 'file', caminho: 'c.md' }, T), false);
assert.strictEqual(deveTrocar(s, md('README.MD'), T), true, 'extension is case-insensitive');

// User reopens as text: preview closes and text opens (either order, same or
// consecutive events) -> stays as text.
s = criarEstado();
registrarEvento(s, { abertas: [md('d.md')], fechadas: [preview('d.md')], abertasAgora: ['d.md'] }, T);
assert.strictEqual(deveTrocar(s, md('d.md'), T + 300), false, 'same event');
s = criarEstado();
registrarEvento(s, { abertas: [md('f.md')], fechadas: [], abertasAgora: ['f.md'] }, T);
registrarEvento(s, { abertas: [], fechadas: [preview('f.md')], abertasAgora: ['f.md'] }, T + 50);
assert.strictEqual(deveTrocar(s, md('f.md'), T + 300), false, 'text opened before the preview closed');
// ...and stays text while any tab of it is open.
registrarEvento(s, { abertas: [md('f.md')], fechadas: [], abertasAgora: ['f.md'] }, T + 5000);
assert.strictEqual(deveTrocar(s, md('f.md'), T + 5300), false);
// All its tabs closed: back to the normal rule.
registrarEvento(s, { abertas: [], fechadas: [md('f.md')], abertasAgora: [] }, T + 6000);
registrarEvento(s, { abertas: [md('f.md')], fechadas: [], abertasAgora: ['f.md'] }, T + 7000);
assert.strictEqual(deveTrocar(s, md('f.md'), T + 7300), true);

// A preview closed long ago isn't a switch back.
s = criarEstado();
registrarEvento(s, { abertas: [], fechadas: [preview('g.md')], abertasAgora: [] }, T);
registrarEvento(s, { abertas: [md('g.md')], fechadas: [], abertasAgora: ['g.md'] }, T + 60000);
assert.strictEqual(deveTrocar(s, md('g.md'), T + 60300), true);

console.log('OK: markdown link preview (swap, exceptions, switching back to text)');
