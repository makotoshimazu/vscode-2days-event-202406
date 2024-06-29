import { exec } from "node:child_process";
import * as vscode from "vscode";

export class ProgateSubmitContentProvider
  implements vscode.TextDocumentContentProvider
{
  static scheme = "progate";
  static uri = vscode.Uri.parse("progate://progate-submit-result");

  private _onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();

  private _latestResult: SubmitResult | undefined;

  constructor() {}

  dispose() {
    this._onDidChangeEmitter.dispose();
  }

  get onDidChange(): vscode.Event<vscode.Uri> {
    return this._onDidChangeEmitter.event;
  }

  provideTextDocumentContent(uri: vscode.Uri): string {
    if (uri.toString() !== ProgateSubmitContentProvider.uri.toString()) {
      return "";
    }

    if (this._latestResult === undefined) {
      return "No result yet";
    }

    if (this._latestResult.result === "error") {
      return `Error: ${this._latestResult.message}`;
    }

    return `Success: ${this._latestResult.message}`;
  }

  async runProgateSubmit() {
    this._latestResult = await runProgateSubmit();
    this._onDidChangeEmitter.fire(ProgateSubmitContentProvider.uri);
  }
}

type SubmitResult =
  | {
      result: "error";
      message: string;
    }
  | {
      result: "success";
      message: string;
    };

const runProgateSubmit = async (): Promise<SubmitResult> => {
  if (!vscode.workspace.workspaceFolders) {
    return { result: "error", message: "No workspace is opened" };
  }

  const pathFolders = vscode.workspace.workspaceFolders?.filter((folder) =>
    /\/progate_path\//.test(folder.uri.fsPath)
  );

  if (pathFolders === undefined || pathFolders.length === 0) {
    return { result: "error", message: "No progate_path folder is found" };
  }

  const path = vscode.workspace.workspaceFolders[0].uri.fsPath;

  let promiseResolve: (value: SubmitResult) => void;

  const promise = new Promise<SubmitResult>(
    (resolve) => (promiseResolve = resolve)
  );

  exec("progate submit", { cwd: path }, (error, stdout, stderr) => {
    if (error) {
      promiseResolve({ result: "error", message: error.message });
    }
    promiseResolve({ result: "success", message: `${stdout}\n${stderr}` });
  });
  return promise;
};
