import * as vscode from "vscode";

class DarkwavesExtension {
  private statusBarItem!: vscode.StatusBarItem;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public activate(): void {
    console.log("Spacelaxy Darkwaves is now active!");
    
    const openThemeMenuCommand = vscode.commands.registerCommand(
      "darkwaves.openThemeMenu",
      () => this.showThemeMenu()
    );

    this.createStatusBarItem();

    this.context.subscriptions.push(openThemeMenuCommand);
  }

  private createStatusBarItem(): void {
    const config = vscode.workspace.getConfiguration("darkwaves");
    const showStatusBar = config.get("showStatusBar", true);
    const statusBarText = config.get("statusBarText", "Darkwaves");

    if (showStatusBar) {
      this.statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100
      );
      
      this.statusBarItem.text = `$(sparkle-filled) ${statusBarText}`;
      this.statusBarItem.tooltip = "Click to open Darkwaves theme menu";
      this.statusBarItem.command = "darkwaves.openThemeMenu";
      this.statusBarItem.show();

      this.context.subscriptions.push(this.statusBarItem);
    }
  }

  private showThemeMenu(): void {
    const packageJson = require('../package.json');
    const themes = packageJson.contributes.themes.map((theme: any) => ({
      label: theme.label,
      path: theme.path
    }));

    vscode.window.showQuickPick(themes, {
      placeHolder: "Escolha um tema Darkwaves...",
      onDidSelectItem: (item: any) => {
        this.changeTheme(item.label);
      },
    });
  }

  private async changeTheme(themeName: string): Promise<void> {
    try {
      await vscode.workspace
        .getConfiguration()
        .update(
          "workbench.colorTheme",
          themeName,
          vscode.ConfigurationTarget.Workspace
        );
    } catch (error) {
      vscode.window.showErrorMessage(`Erro ao alterar tema: ${error}`);
    }
  }

  public deactivate(): void {
    if (this.statusBarItem) {
      this.statusBarItem.dispose();
    }
  }
}

let extension: DarkwavesExtension;

export function activate(context: vscode.ExtensionContext): void {
  extension = new DarkwavesExtension(context);
  extension.activate();
}

export function deactivate(): void {
  if (extension) {
    extension.deactivate();
  }
}