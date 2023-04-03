import { StatusBarAlignment, Uri, env, window, workspace } from 'vscode';
import { Message, Service, juejinBaseUrl } from './service';

export class MessageHelper {
  private statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 10);
  private timerStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 10);
  private timeSpan: number;
  private texts: string[] = [];
  private count: number = 0;
  private service: Service | null = null;
  private hasShow = false;

  private countTimer: NodeJS.Timeout | null = null;
  private messageTimer: NodeJS.Timeout | null = null;

  private messages: Message[] = [];

  constructor() {
    const cookie = workspace.getConfiguration().get('juejin-cookie') as string;
    this.timeSpan = (workspace.getConfiguration().get('juejin-refresh-time-span') as number) * 1000;

    if (!cookie) {
      window.showErrorMessage('请先配置cookie！');
      return;
    }

    this.service = new Service(cookie);
  }

  public startListen() {
    this.refreshCountText();

    this.countTimer = globalThis.setInterval(async () => {
      if (this.count === 0) {
        this.count = this.timeSpan;
        this.refreshCountText();
      } else {
        this.count -= 1000;
      }
      this.timerStatusBarItem.text = `下次刷新：${this.count / 1000}`;
    }, 1000);

    this.listenMessage();

    this.messageTimer = globalThis.setInterval(() => {
      this.listenMessage();
    }, 5000);

  }

  public stopListen() {
    if (this.countTimer) {
      globalThis.clearInterval(this.countTimer);
    }

    if (this.messageTimer) {
      globalThis.clearInterval(this.messageTimer);
    }

    this.statusBarItem.dispose();
    this.timerStatusBarItem.dispose();
  }

  private async listenMessage() {
    try {
      const messages = await this.service?.getMessages() || [];
      this.messages.push(...messages);
      if (!this.hasShow) {
        this.showMessage();
      }
    } catch {
      if (this.messageTimer) {
        globalThis.clearInterval(this.messageTimer);
      }
      window.showWarningMessage('请检查cookie是否配置错误');
    }
  }

  private async showMessage() {
    const curMessage = this.messages.pop();

    if (!curMessage) {
      this.hasShow = false;
      return;
    }

    const { message, url, count } = curMessage;

    this.hasShow = true;

    const result = await window.showErrorMessage(`掘金消息助手：您有${count}${message}`, ...['查看', '关闭']);
    if (result === '查看') {
      await env.openExternal(Uri.parse(`${juejinBaseUrl}${url}`));
    }

    this.hasShow = false;
    this.showMessage();
  }

  private async refreshCountText() {
    try {
      this.texts = await this.service?.getLatestArticleCount() || [];
      if (!this.texts?.length) {
        this.statusBarItem.text = '接口调用失败，请稍后刷新重试。';
      } else {
        this.statusBarItem.text = this.texts.join('\t');
      }

      this.timerStatusBarItem.text = `下次刷新：${this.count / 1000}`;
      this.statusBarItem.show();
      this.timerStatusBarItem.show();
    } catch {
      if (this.countTimer) {
        globalThis.clearInterval(this.countTimer);
      }
      window.showWarningMessage('请检查cookie是否配置错误');
    }
  }
}