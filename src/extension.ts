import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "tab-stopper.cursors-to-tab-stops",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const doc = editor.document;
      const selections = editor.selections;
      if (selections.length < 2) {
        vscode.window.showInformationMessage(
          "Set multiple cursors/selections first."
        );
        return;
      }

      const fullText = doc.getText();
      const sortedSelections = selections
        .slice()
        .sort((a, b) => doc.offsetAt(a.start) - doc.offsetAt(b.start));

      const firstOffset = doc.offsetAt(sortedSelections[0].start);
      const lastOffset = doc.offsetAt(
        sortedSelections[sortedSelections.length - 1].end
      );

      let snippet = "";
      let lastCursorOffset = firstOffset;

      sortedSelections.forEach((sel, i) => {
        const start = doc.offsetAt(sel.start);
        const end = doc.offsetAt(sel.end);
        const selectedText = doc.getText(sel);
        const escaped = selectedText.replace(/\$/g, "\\$").replace(/}/g, "\\}");

        const slice = fullText
          .slice(lastCursorOffset, start)
          .replace(/\$/g, "\\$")
          .replace(/}/g, "\\}");
        snippet += slice;
        const stop =
          selectedText.length > 0 ? `\${${i + 1}:${escaped}}` : `\${${i + 1}}`;
        snippet += stop;
        lastCursorOffset = end;
      });

      snippet += fullText.slice(lastCursorOffset, lastOffset);

      await editor.insertSnippet(
        new vscode.SnippetString(snippet),
        new vscode.Range(
          doc.positionAt(firstOffset),
          doc.positionAt(lastOffset)
        ),
        {
          undoStopBefore: true,
          undoStopAfter: true,
          keepWhitespace: true,
        }
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
