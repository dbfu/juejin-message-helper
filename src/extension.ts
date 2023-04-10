// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { MessageHelper } from './message-helper';

export async function activate(context: vscode.ExtensionContext) {
	let messageHelper = new MessageHelper();
	messageHelper.startListen();

	function refresh() {
		messageHelper.stopListen();
		messageHelper = new MessageHelper();
		messageHelper.startListen();
	}

	// 监听配置时候改变，如果改变则重新new一个对象，重新监听
	const disposable = vscode.workspace.onDidChangeConfiguration(event => {
		if (
			[
				'juejin-cookie',
				'juejin-refresh-time-span',
			].some(str => event.affectsConfiguration(str))
		) {
			refresh();
		}
	});

	const refreshDisposable = vscode.commands.registerCommand('juejin-helper.refresh', () => {
		refresh();
	});

	context.subscriptions.push(refreshDisposable);
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {

}
