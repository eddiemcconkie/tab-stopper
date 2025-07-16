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

      let snippetMid = "";
      let lastCursorOffset = firstOffset;

      sortedSelections.forEach((sel, i) => {
        const start = doc.offsetAt(sel.start);
        const end = doc.offsetAt(sel.end);
        const selectedText = doc.getText(sel);
        const escaped = selectedText.replace(/\$/g, "\\$").replace(/}/g, "\\}");

        snippetMid += fullText.slice(lastCursorOffset, start);
        snippetMid +=
          selectedText.length > 0 ? `\${${i + 1}:${escaped}}` : `\${${i + 1}}`;
        lastCursorOffset = end;
      });

      snippetMid += fullText.slice(lastCursorOffset, lastOffset);

      await editor.insertSnippet(
        new vscode.SnippetString(snippetMid),
        new vscode.Range(
          doc.positionAt(firstOffset),
          doc.positionAt(lastOffset)
        )
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
