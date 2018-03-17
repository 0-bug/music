About 
========
 这是一款开源的基于 `Meting` 的在线音乐播放器。具有音乐搜索、播放、下载、歌词同步显示、个人网易云音乐播放列表同步等功能。

前端界面参照 QQ 音乐网页版进行布局，同时采用了流行的响应式设计，无论是在PC端还是在手机端，均能给您带来原生 app 般的使用体验。

### 界面欣赏
-----
![主界面(电脑端)](http://music.fall-star.cn/images/Interfaces.png)

![播放列表界面(电脑端)](http://music.fall-star.cn/images/pc.jpg)

![歌曲搜索与播放](http://music.fall-star.cn/images/search.jpg)


### PC端相关链接
-----
**在线演示** [http://music.fall-star.cn](http://music.fall-star.cn)

**GitHub** [https://github.com/0-bug/music](https://github.com/0-bug/music.git)

#### 关于源代码运行环境
php 5.4+, curl_exec, file_get_contents, json_decode, openssl_encrypt

### APP
**安卓** [http://music.fall-star.cn/music.apk](http://music.fall-star.cn/music.apk)

**iOS** [http://music.fall-star.cn/music.ipa](http://music.fall-star.cn/music.ipa)

#### 兼容性
本播放器设计支持 IE9及以上的现代浏览器。并且已在 Chrome、firefox、IE11 等浏览器测试使用正常。


### 注意事项
-----
#### 关于手机端
理论上兼容所有手机,在ios上为越狱应用。如有bug,请 email : w3ctech@qq.com

关于App登陆时会有广告，原因是因为在打包的时候，未实名认证的原因。预计下个版本修复该问题。


#### 歌曲
播放器中的歌曲来自各大音乐平台，歌曲版权归各大平台享有。请支持正版音乐。


### 开发文档
1.pc端          从 网页版 到 插件的实现  懒人式听歌

2.手机端       实现QQ音乐的部分ui功能,以及QQ音乐的歌曲锁屏功能,后台运行功能,手机端显示歌词功能

-----
#### 播放列表DIY教程
本播放器支持后台自定义播放列表。打开 `js/musicList.js`，按照里面的说明对应修改即可。

#### 播放器DIY教程
除了自定义播放列表，本播放器还支持一些 DIY 设定，比如修改 api.php 文件的默认路径、修改搜索框的默认搜索内容等。具体请打开 `js/player.js` 查看

#### rem 变量表
程序中的rem数组用于存储全局变量，具体的成员(部分)及作用见下表：

| 变量名    | 用途   |
| ----------- | ----------- |
| rem.audio | audio dom |
| rem.playlist | 当前正在播放的播放列表编号 |
| rem.playid | 正在播放的这首歌在播放列表中的编号 |
| rem.dislist | 当前显示的列表的列表编号 |
| rem.loadPage | 搜索功能已加载的页码 |
| rem.wd | 当前的搜索词 |
| rem.source | 当前选定的音乐源 |
| rem.uid | 当前已同步的用户的网易云 ID |
| rem.uname | 已登录用户的用户名 |
| rem.sheetList | 歌单容器操作对象 |
| rem.mainList | 歌曲列表容器操作对象 |
| rem.isMobile | 是否是手机浏览 |


#### 采用的开源模块
- **Jquery**：js主流开发框架 [http://jquery.com/](http://jquery.com/)
- **Meting**：一个高效的多平台音乐 API 框架 [https://github.com/metowolf/Meting](https://github.com/metowolf/Meting)
- **layer**：一款强大的web弹层组件 [http://layer.layui.com/](http://layer.layui.com/)
- **mCustomScrollbar**：jQuery自定义滚动条样式插件 [http://manos.malihu.gr/jquery-custom-content-scroller/](http://manos.malihu.gr/jquery-custom-content-scroller/)
- **background-blur**：跨浏览器磨砂效果背景图片模糊特效插件 [https://msurguy.github.io/background-blur/](https://msurguy.github.io/background-blur/)
- **Let's Kill IE6**：消灭IE [http://overtrue.me](http://overtrue.me)

