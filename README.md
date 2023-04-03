# 效果展示
vscode底部展示，定时请求接口刷新文章数据。
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/35e51a89d8504582ab63a8c31740a07b~tplv-k3u1fbpfcp-watermark.image?)
如果有消息通知，会主动推送消息，这里用报错提示是有原因的，下面会有讲解。点击查看会跳到对应的掘金官网消息页面。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7a92843473e74668b8ea7b8d1ee8a62f~tplv-k3u1fbpfcp-watermark.image?)


# 使用介绍

从掘金官网把cookie复制出来，设置到juejin-cookie上。

## 在官网中找到这个接口
https://api.juejin.cn/interact_api/v1/message/count?aid=2608&uuid=7056220463659533837&spider=0
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/09147dca4dd14a7dbd9b085eeff31497~tplv-k3u1fbpfcp-watermark.image?)
## 复制下面的cookie

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d3ec6ee1ed0b48ddbeaabe041c85115d~tplv-k3u1fbpfcp-watermark.image?)
## 在vscode中设置刚复制cookie

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/579b17230ad349448a28de1c68818526~tplv-k3u1fbpfcp-watermark.image?)

## 下面还有一个参数可以设置刷新频率

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/026549b6b49242dd85bb1cb608121880~tplv-k3u1fbpfcp-watermark.image?)