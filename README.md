# Markdown Link Preview (for Claude Code, unofficial)

Opens Markdown files in VS Code's **preview** when you click a link to them. This also works for links in the **Claude Code** chat panel, the terminal, and Copilot. Without this extension, those links open the raw text editor.

> Unofficial community extension. It is not affiliated with or endorsed by
> Anthropic.

## Why

If you set Markdown files to open in the preview:

```json
"workbench.editorAssociations": { "*.md": "vscode.markdown.preview.editor" }
```

the Explorer follows this setting, but many link handlers do not. They open files with `window.showTextDocument`, which always uses the text editor and ignores VS Code's editor associations. The Claude Code extension's chat links work this way. This behavior was reported upstream:
[anthropics/claude-code#107977](https://github.com/anthropics/claude-code/issues/107977).

This extension watches for Markdown files opening in a text editor and immediately switches them to the Markdown preview.

## What it leaves alone

- Files with **unsaved changes**.
- **Diffs** and Git comparisons.
- Files that are not `.md` files on disk, including untitled or virtual documents.
- Files you deliberately switch back to text with **Reopen Editor With… → Text Editor**. They stay in the text editor until you close all their tabs.

## Install

Download the `.vsix` from the
[Releases](https://github.com/nullreferenceexception/vscode-claudecode-markdown-preview/releases)
page and install it:

```
code --install-extension vscode-claudecode-markdown-preview-0.1.0.vsix
```

You can also install it in VS Code by selecting *Extensions → … → Install from VSIX*. Reload the window afterwards.

To build it yourself:

```
npx @vscode/vsce package
```

## Settings

| Setting | Default | Description |
|---|---|---|
| `markdownLinkPreview.enabled` | `true` | Turn the extension on or off. |

## Limitations

- Links to specific lines open the preview at the top of the file. The preview cannot jump to a line.
- The text editor may appear briefly before the preview opens.

## Development

There are no dependencies. Run the tests with `node test/test.js`.

## License

[MIT](LICENSE)
