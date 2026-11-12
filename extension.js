// Markdown links open in the preview, even from the Claude Code chat panel,
// the terminal or Copilot (which otherwise ignore workbench.editorAssociations).
// Setting: markdownLinkPreview.enabled.
const vscode = require('vscode');
const ap = require('./autopreview.js');

// Wait briefly before swapping: "Reopen Editor With… > Text Editor" closes the
// preview right after opening the text editor, and that has to be seen first.
const SWAP_DELAY_MS = 300;

function activate(context) {
  const state = ap.criarEstado();
  const toPlain = tab => {
    const i = tab.input;
    if (i instanceof vscode.TabInputText) return { tipo: 'texto', uri: i.uri.toString(), scheme: i.uri.scheme, caminho: i.uri.path, sujo: tab.isDirty };
    if (i instanceof vscode.TabInputTextDiff) return { tipo: 'diff', uri: i.modified.toString() };
    if (i instanceof vscode.TabInputCustom) return { tipo: 'custom', uri: i.uri.toString(), viewType: i.viewType };
    return { tipo: 'outro', uri: '' };
  };
  const allTabs = () => vscode.window.tabGroups.all.flatMap(g => g.tabs);

  context.subscriptions.push(vscode.window.tabGroups.onDidChangeTabs(ev => {
    if (!vscode.workspace.getConfiguration('markdownLinkPreview').get('enabled', true)) return;
    ap.registrarEvento(state, {
      abertas: ev.opened.map(toPlain),
      fechadas: ev.closed.map(toPlain),
      abertasAgora: allTabs().map(toPlain).map(t => t.uri),
    }, Date.now());
    for (const opened of ev.opened) {
      const target = toPlain(opened);
      if (target.tipo !== 'texto') continue;
      setTimeout(() => {
        const tab = allTabs().find(t => t.input instanceof vscode.TabInputText && t.input.uri.toString() === target.uri && t.group === opened.group);
        if (!tab || !ap.deveTrocar(state, toPlain(tab), Date.now())) return;
        vscode.commands.executeCommand('vscode.openWith', tab.input.uri, ap.PREVIEW,
          { viewColumn: tab.group.viewColumn, preserveFocus: !tab.isActive, preview: tab.isPreview })
          .then(() => vscode.window.tabGroups.close(tab).then(undefined, () => {}), () => {});
      }, SWAP_DELAY_MS);
    }
  }));
}

function deactivate() {}

module.exports = { activate, deactivate };
