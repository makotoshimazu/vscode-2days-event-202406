import { exec } from "node:child_process";
import path from "node:path";
import * as vscode from "vscode";

export class ProgateSubmitProvider {
  async runProgateSubmit() {
    const result = await runProgateSubmit();
    if (result.result === "error") {
      vscode.window.showErrorMessage(result.message);
    }
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
  let baseDir;
  if (!vscode.workspace.workspaceFolders) {
    const activeFileUri = vscode.window.activeTextEditor?.document.uri;
    if (!activeFileUri) {
      return { result: "error", message: "no workspace and no active editor." };
    }
    if (activeFileUri.scheme !== "file") {
      return { result: "error", message: "not a file scheme." };
    }
    baseDir = path.dirname(activeFileUri.fsPath);
  } else {
    const pathFolders = vscode.workspace.workspaceFolders?.filter((folder) =>
      /\/progate_path\//.test(folder.uri.fsPath)
    );

    if (pathFolders === undefined || pathFolders.length === 0) {
      return {
        result: "error",
        message: "No progate_path workspace is opened",
      };
    }
    baseDir = pathFolders[0].uri.fsPath;
  }

  let promiseResolve: (value: SubmitResult) => void;

  const promise = new Promise<SubmitResult>(
    (resolve) => (promiseResolve = resolve)
  );

  const TERMINAL_NAME_PREFIX = "Progate Submit";
  vscode.window.terminals.forEach((terminal) => {
    if (terminal.name.startsWith(TERMINAL_NAME_PREFIX)) {
      terminal.dispose();
    }
  });

  const terminal = vscode.window.createTerminal({
    name: `${TERMINAL_NAME_PREFIX} - ${new Date().toString()}`,
    cwd: baseDir,
  });

  terminal.sendText("progate submit");
  terminal.show();
  promiseResolve!({ result: "success", message: "ok" });

  return promise;
};
