# Markdown Link Preview (for Claude Code, unofficial)

Opens Markdown files in VS Code's **preview** when you click a link to them —
including links in the **Claude Code** chat panel, the terminal and Copilot,
which otherwise open the raw text editor.

> Unofficial community extension. Not affiliated with or endorsed by
> Anthropic.

## Why

If you set Markdown to open in the preview:

```json
"workbench.editorAssociations": { "*.md": "vscode.markdown.preview.editor" }
```

the Explorer respects it, but many link handlers don't. They open files with
`window.showTextDocument`, which always uses the text editor and skips VS
Code's editor associations. The Claude Code extension's chat links work this
way (reported upstream:
[anthropics/claude-code#107977](https://github.com/anthropics/claude-code/issues/107977)).

This extension watches for a `.md` file opening in a text editor and swaps
that tab to the Markdown preview right away.

## What it leaves alone

- Files with **unsaved changes**.
- **Diffs** and Git comparisons.
- Anything that isn't a `.md` file on disk (untitled or virtual documents).
- Files you deliberately switch back to text with **Reopen Editor With… →
  Text Editor**. They stay as text until you close all their tabs.

## Install

Download the `.vsix` from the
[Releases](https://github.com/nullreferenceexception/vscode-claudecode-markdown-preview/releases)
page and install it:

```
code --install-extension vscode-claudecode-markdown-preview-0.1.0.vsix
```

or in VS Code: *Extensions → … → Install from VSIX*. Reload the window
afterwards.

To build it yourself:

```
npx @vscode/vsce package
```

## Settings

| Setting | Default | |
|---|---|---|
| `markdownLinkPreview.enabled` | `true` | Turn the swap on or off. |

## Limitations

- A link to a specific line opens the preview at the top; the preview can't
  jump to a line.
- The text editor appears for a fraction of a second before the swap.

## Development

No dependencies. Run the tests with `node test/test.js`.

## License

[MIT](LICENSE)
