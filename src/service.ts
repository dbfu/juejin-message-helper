import axios, { AxiosInstance } from 'axios';

export const juejinBaseUrl = 'https://juejin.cn';
export interface Message {
  message: string;
  count: number;
  url: string;
}

export class Service {
  private request: AxiosInstance;
  private countFailCount = 0;
  private messageFailCount = 0;

  lastCollentAndDiggCount: number = 0;
  lastFanCount: number = 0;
  lastCommentCount: number = 0;
  lastNewsCount: number = 0;
  lastNoticeCount: number = 0;

  constructor(cookie: string) {
    this.request = axios.create({
      baseURL: juejinBaseUrl,
      headers: {
        cookie,
      },
    });
  }

  public async getLatestArticleCount(): Promise<string[]> {
    const url = '/content_api/v1/article/list_by_user?aid=2608&uuid=7056220463659533837&spider=0';
    try {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { data: { data, err_no } } = await this.request.post(
        url,
        {
          page_no: 1,
          page_size: 5,
        }
      );

      if (err_no !== 0) {
        // 失败三次就不再刷新了
        if (this.countFailCount === 3) {
          throw new Error();
        }
        this.countFailCount += 1;
        return await this.getLatestArticleCount();
      }

      // 取最新的文章数据
      const latestArticle = data[0];

      if (!latestArticle) {
        return [];
      }

      const { article_info: detail } = latestArticle;

      const {
        display_count,
        view_count,
        digg_count,
        comment_count,
        collect_count,
      } = detail;

      const texts = [
        `展现：${display_count}`,
        `观看：${view_count}`,
        `赞：${digg_count}`,
        `评论：${comment_count}`,
        `收藏：${collect_count}`,
      ];

      this.countFailCount = 0;
      return texts;
    } catch {
      // 失败三次就不再刷新了
      if (this.countFailCount === 3) {
        throw new Error();
      }
      this.countFailCount += 1;
      return await this.getLatestArticleCount();
    }
  }

  public async getMessages(): Promise<Message[] | undefined> {
    const url = '/interact_api/v1/message/count?aid=2608&uuid=7056220463659533837&spider=0';

    try {
      const { data: { data, err_no } } = await this.request.get(url);

      if (err_no !== 0) {
        // 失败三次就不再刷新了
        if (this.messageFailCount === 3) {
          throw new Error();
        }
        this.messageFailCount += 1;
        return await this.getMessages();
      }

      const { count } = data;

      const messages = [];
      let collentAndDiggCount = count["1"];
      let fanCount = count["2"];
      let commentCount = count["3"];
      let noticeCount = count["4"];
      let newsCount = count["7"];

      if (collentAndDiggCount !== this.lastCollentAndDiggCount && collentAndDiggCount > 0) {
        messages.push({
          message: `个新的赞和收藏`,
          url: '/notification/digg',
          count: collentAndDiggCount,
        });
      }

      if (fanCount !== this.lastFanCount && fanCount > 0) {
        messages.push({
          message: `个新的粉丝`,
          url: '/notification/follow',
          count: fanCount,
        });
      }

      if (commentCount !== this.lastCommentCount && commentCount > 0) {
        messages.push({
          message: `条新的评论`,
          url: '/notification',
          count: commentCount,
        });
      }

      if (newsCount !== this.lastNewsCount && newsCount > 0) {
        messages.push({
          message: `条新的私信`,
          url: '/notification/im',
          count: newsCount,
        });
      }

      if (noticeCount !== this.lastNoticeCount && noticeCount > 0) {
        messages.push({
          message: `条新的系统通知`,
          url: '/notification/system',
          count: noticeCount,
        });
      }

      this.lastCollentAndDiggCount = collentAndDiggCount;
      this.lastFanCount = fanCount;
      this.lastCommentCount = commentCount;
      this.lastNewsCount = newsCount;
      this.lastNoticeCount = noticeCount;

      this.messageFailCount = 0;

      return messages;
    } catch {
      // 失败三次就不再刷新了
      if (this.messageFailCount === 3) {
        throw new Error();
      }
    }
  }
}
