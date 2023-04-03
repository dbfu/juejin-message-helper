// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';
import { Service } from './service';
import { MessageHelper } from './message-helper';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

// 5分钟
const timeSpan = 60 * 1000;
let count = timeSpan;

let showMessageTimer: NodeJS.Timeout;

const juejinBaseUrl = 'https://juejin.cn';
// const cookie = '_ga=GA1.2.2081123168.1605835712; __tea_cookie_tokens_2608=%7B%22web_id%22%3A%227056220463659533837%22%2C%22ssid%22%3A%22b2c9a14c-b066-4e4f-87b0-477236144b23%22%2C%22user_unique_id%22%3A%227056220463659533837%22%2C%22timestamp%22%3A1642904364886%7D; uid_tt=ab43e2530318327bae0c89d49da6ed29; uid_tt_ss=ab43e2530318327bae0c89d49da6ed29; sid_tt=c6523f020461d075d79797b3c88dcd98; sessionid=c6523f020461d075d79797b3c88dcd98; sessionid_ss=c6523f020461d075d79797b3c88dcd98; sid_guard=c6523f020461d075d79797b3c88dcd98|1657592041|31536000|Wed,+12-Jul-2023+02:14:01+GMT; sid_ucp_v1=1.0.0-KGI2YzZiYWE5OWFlNjJiMTNlNDNmMzcyODQ3YzU0YWQ4MDIzZTgxMWIKFwiIt5C__fW9BBDpsbOWBhiwFDgCQO8HGgJsZiIgYzY1MjNmMDIwNDYxZDA3NWQ3OTc5N2IzYzg4ZGNkOTg; ssid_ucp_v1=1.0.0-KGI2YzZiYWE5OWFlNjJiMTNlNDNmMzcyODQ3YzU0YWQ4MDIzZTgxMWIKFwiIt5C__fW9BBDpsbOWBhiwFDgCQO8HGgJsZiIgYzY1MjNmMDIwNDYxZDA3NWQ3OTc5N2IzYzg4ZGNkOTg; passport_csrf_token=762108862c43f79d917621fd06457ef0; passport_csrf_token_default=762108862c43f79d917621fd06457ef0; store-region=cn-sh; store-region-src=uid; csrf_session_id=6a9ae02fe3d8b501bdfa38f6b92db14d; _gid=GA1.2.301701039.1680411766; _tea_utm_cache_2608={"utm_source":"search"}';

let lastCollentAndDigg: number;
let lastFan: number;
let lastComment: number;
let lastNotice: number;
let lastNews: number;

let hasShow = false;

const messages: { message: string, url: string, count: number }[] = [];

// const request = axios.create({
// 	baseURL: juejinBaseUrl,
// 	headers: {
// 		Cookie: cookie,
// 	},
// });

async function showMessage() {
	const curMessage = messages.pop();

	if (!curMessage) {
		hasShow = false;
		return;
	}

	const { message, url, count } = curMessage;

	hasShow = true;

	const result = await vscode.window.showInformationMessage(`掘金消息助手：您有${count}${message}`, ...['查看', '关闭']);
	if (result === '查看') {
		await vscode.env.openExternal(vscode.Uri.parse(`${juejinBaseUrl}${url}`));
	}
	showMessage();
}

export async function activate(context: vscode.ExtensionContext) {

	let messageHelper = new MessageHelper();
	messageHelper.startListen();

	const disposable = vscode.workspace.onDidChangeConfiguration(event => {
		if (
			[
				'juejin-cookie',
				'juejin-refresh-time-span',
			].some(str => event.affectsConfiguration(str))
		) {
			messageHelper.stopListen();
			messageHelper = new MessageHelper();
			messageHelper.startListen();
		}
	});

	context.subscriptions.push(disposable);

	return;

	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10);
	const timerStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10);

	const cookie = vscode.workspace.getConfiguration().get('juejin-cookie') as string;

	if (!cookie) {
		vscode.window.showErrorMessage('请先配置cookie！');
		return;
	}

	const service = new Service(cookie);

	async function showMessageStatusBar() {
		const texts = await service.getLatestArticleCount();

		if (!texts?.length) {
			statusBarItem.text = '接口调用失败，请稍后刷新重试。';
		} else {
			statusBarItem.text = texts.join('\t');
		}

		timerStatusBarItem.text = `下次刷新：${count / 1000}`;
		statusBarItem.show();
		timerStatusBarItem.show();
	}

	async function listenMessage() {
		// const url = '/interact_api/v1/message/count?aid=2608&uuid=7056220463659533837&spider=0';
		// const { data: { data } } = await request.get(url);
		// const { count } = data;

		// let collentAndDigg = count["1"];
		// let fan = count["2"];
		// let comment = count["3"];
		// let notice = count["4"];
		// let news = count["7"];

		// if (collentAndDigg !== lastCollentAndDigg && collentAndDigg > 0) {
		// 	messages.push({
		// 		message: `个新的赞和收藏`,
		// 		url: '/notification/digg',
		// 		count: collentAndDigg,
		// 	});
		// }

		// if (fan !== lastFan && fan > 0) {
		// 	messages.push({
		// 		message: `新的粉丝`,
		// 		url: '/notification/follow',
		// 		count: fan,
		// 	});
		// }

		// if (comment !== lastComment && comment > 0) {
		// 	messages.push({
		// 		message: `条新的评论`,
		// 		url: '/notification',
		// 		count: comment,
		// 	});
		// }

		// if (news !== lastNews && news > 0) {
		// 	messages.push({
		// 		message: `条新的私信`,
		// 		url: '/notification/im',
		// 		count: news,
		// 	});
		// }

		// if (notice !== lastNotice && notice > 0) {
		// 	messages.push({
		// 		message: `条新的系统通知`,
		// 		url: '/notification/system',
		// 		count: notice,
		// 	});
		// }

		// if (!hasShow) {
		// 	showMessage();
		// }

		// lastCollentAndDigg = collentAndDigg;
		// lastFan = fan;
		// lastComment = comment;
		// lastNotice = notice;
		// lastNews = news;

	}

	showMessageStatusBar();

	await listenMessage();

	showMessageTimer = globalThis.setInterval(() => {
		if (count === 0) {
			count = timeSpan;
			showMessageStatusBar();
		} else {
			count -= 1000;
		}
		timerStatusBarItem.text = `下次刷新：${count / 1000}`;
	}, 1000);

	setInterval(() => {
		listenMessage();
	}, 5000);
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (showMessageTimer) {
		globalThis.clearInterval(showMessageTimer);
	}
}
