import * as vscode from 'vscode';

class DarkwavesExtension {
  private statusBarItem!: vscode.StatusBarItem;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public activate(): void {
    console.log('Spacelaxy Darkwaves is now active!');
    
    const openThemeMenuCommand = vscode.commands.registerCommand(
      'darkwaves.openThemeMenu',
      () => this.showThemeMenu()
    );

    this.createStatusBarItem();
    this.context.subscriptions.push(openThemeMenuCommand);
  }

  private createStatusBarItem(): void {
    const config = vscode.workspace.getConfiguration('darkwaves');
    const showStatusBar = config.get('showStatusBar', true);
    const statusBarText = config.get('statusBarText', 'Darkwaves');

    if(showStatusBar) {
      this.statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100
      );
      
      this.statusBarItem.text = `$(sparkle-filled) ${statusBarText}`;
      this.statusBarItem.command = 'darkwaves.openThemeMenu';
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

    const currentTheme = vscode.workspace.getConfiguration().get('workbench.colorTheme') as string;
    
    const themesWithSelection = themes.map((theme: any) => {
      const isCurrentTheme = currentTheme === theme.label;
      return {
        ...theme,
        label: isCurrentTheme ? `$(check) ${theme.label} (Current)` : theme.label,
        description: isCurrentTheme ? 'Currently active theme' : undefined,
        picked: isCurrentTheme
      };
    });

    vscode.window.showQuickPick(themesWithSelection, {
      placeHolder: 'Choose a Darkwaves theme...',
    }).then((selectedItem: any) => {
      if(selectedItem) {
        const cleanThemeName = selectedItem.label.replace(/^\$\(check\)\s*/, '').replace(/\s*\(Current\)$/, '');
        this.changeTheme(cleanThemeName);
      }
    });
  }

  private async changeTheme(themeName: string): Promise<void> {
    try {
      await vscode.workspace
        .getConfiguration()
        .update(
          'workbench.colorTheme',
          themeName,
          vscode.ConfigurationTarget.Workspace
        );
      
      this.updateStatusBarText(themeName);
      
    } catch (error) {
      vscode.window.showErrorMessage(`Error changing theme: ${error}`);
    }
  }

  private updateStatusBarText(themeName: string): void {
    if(this.statusBarItem) {
      this.statusBarItem.text = `$(sparkle-filled) ${themeName}`;
    }
  }

  public deactivate(): void {
    if(this.statusBarItem) {
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
  if(extension) {
    extension.deactivate();
  }
}