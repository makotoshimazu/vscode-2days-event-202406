// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { exec } from "node:child_process";
import * as vscode from "vscode";
import { ProgateSubmitContentProvider } from "./provider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "progate-cli-extension" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const helloProgateDisposable = vscode.commands.registerCommand(
    "progate-cli-extension.helloProgate",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage(
        "Hello Progate from progate-cli-extension!"
      );
    }
  );

  const provider = new ProgateSubmitContentProvider();
  const providerRegistration =
    vscode.workspace.registerTextDocumentContentProvider(
      ProgateSubmitContentProvider.scheme,
      provider
    );

  const progateSubmitDisposable = vscode.commands.registerCommand(
    "progate-cli-extension.runProgateSubmit",
    async () => {
      vscode.window.showInformationMessage("Start running progate submit...");
      await provider.runProgateSubmit();
      const doc = await vscode.workspace.openTextDocument(
        ProgateSubmitContentProvider.uri
      );
      vscode.window.showTextDocument(doc);
    }
  );

  context.subscriptions.push(
    helloProgateDisposable,
    progateSubmitDisposable,
    providerRegistration
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
