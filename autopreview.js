// Decides when a Markdown tab should be swapped to the Markdown preview.
//
// `workbench.editorAssociations` ("*.md" -> preview) is only honoured by
// VS Code's generic open command (the Explorer uses it). File links in the
// Claude Code chat panel, the terminal and Copilot call showTextDocument,
// which always opens the text editor. The extension swaps such a tab to the
// preview right after it opens.
//
// Left alone: anything that isn't a .md file on disk, tabs with unsaved
// changes, diffs, and files the user deliberately reopens as text
// ("Reopen Editor With… > Text Editor" closes the preview and opens the text
// editor, in either order) — those stay as text until all their tabs close.
//
// Pure: the extension maps VS Code tabs to plain objects
// { tipo: 'texto' | 'custom' | 'diff' | 'outro', uri, scheme, caminho, sujo, viewType }.
const PREVIEW = 'vscode.markdown.preview.editor';
const SWITCH_BACK_WINDOW_MS = 1500;

function criarEstado() {
  return { manterTexto: new Set(), previewFechado: new Map(), textoAberto: new Map() };
}

function registrarEvento(estado, { abertas = [], fechadas = [], abertasAgora = [] }, agora) {
  for (const t of fechadas) if (t.tipo === 'custom' && t.viewType === PREVIEW) estado.previewFechado.set(t.uri, agora);
  for (const t of abertas) {
    if (t.tipo !== 'texto') continue;
    estado.textoAberto.set(t.uri, agora);
    const closed = estado.previewFechado.get(t.uri);
    if (closed != null && Math.abs(agora - closed) <= SWITCH_BACK_WINDOW_MS) estado.manterTexto.add(t.uri);
  }
  // Preview closed just AFTER the text editor opened (reverse order): also a switch back.
  for (const t of fechadas) {
    if (t.tipo !== 'custom' || t.viewType !== PREVIEW) continue;
    const opened = estado.textoAberto.get(t.uri);
    if (opened != null && Math.abs(agora - opened) <= SWITCH_BACK_WINDOW_MS) estado.manterTexto.add(t.uri);
  }
  const stillOpen = new Set(abertasAgora);
  for (const uri of [...estado.manterTexto]) if (!stillOpen.has(uri)) estado.manterTexto.delete(uri);
}

function deveTrocar(estado, aba, agora) {
  if (!aba || aba.tipo !== 'texto' || aba.scheme !== 'file' || aba.sujo) return false;
  if (!/\.md$/i.test(aba.caminho || aba.uri)) return false;
  if (estado.manterTexto.has(aba.uri)) return false;
  const closed = estado.previewFechado.get(aba.uri);
  return !(closed != null && Math.abs(agora - closed) <= SWITCH_BACK_WINDOW_MS);
}

module.exports = { PREVIEW, criarEstado, registrarEvento, deveTrocar };
