
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i) ? true : false;
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i) ? true : false;
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) ? true : false;
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
    }
};

$(function(){
    if(mkPlayer.debug) {
        console.warn('播放器调试模式已开启，正常使用时请在 js/player.js 中按说明关闭调试模式');
    }

    rem.isMobile = isMobile.any();
    rem.webTitle = document.title;
    rem.errCount = 0;

    initProgress();
    initAudio();


    if(rem.isMobile) {
        rem.sheetList = $("#sheet");
        rem.mainList = $("#main-list");
    } else {
        $("#main-list,#sheet").mCustomScrollbar({
            theme:"minimal",
            advanced:{
                updateOnContentResize: true
            }
        });

        rem.sheetList = $("#sheet .mCSB_container");
        rem.mainList = $("#main-list .mCSB_container");
    }

    addListhead();
    addListbar("loading");

    $(".btn").click(function(){
        switch($(this).data("action")) {
            case "player":
                dataBox("player");
            break;
            case "search":
                searchBox();
            break;

            case "playing":
                loadList(1);
            break;

            case "sheet":
                dataBox("sheet");
            break;
        }
    });


    $(".music-list").on("dblclick",".list-item", function() {
        var num = parseInt($(this).data("no"));
        if(isNaN(num)) return false;
        listClick(num);
    });

    $(".music-list").on("click",".list-item", function() {
        if(rem.isMobile) {
            var num = parseInt($(this).data("no"));
            if(isNaN(num)) return false;
            listClick(num);
        }
    });

    $(".music-list").on("click",".list-mobile-menu", function() {
        var num = parseInt($(this).parent().data("no"));
        musicInfo(rem.dislist, num);
        return false;
    });


    $(".music-list").on("mousemove",".list-item", function() {
        var num = parseInt($(this).data("no"));
        if(isNaN(num)) return false;

        if(!$(this).data("loadmenu")) {
            var target = $(this).find(".music-name");
            var html = '<span class="music-name-cult">' +
            target.html() +
            '</span>' +
            '<div class="list-menu" data-no="' + num + '">' +
                '<span class="list-icon icon-play" data-function="play" title="点击播放这首歌"></span>' +
                '<span class="list-icon icon-download" data-function="download" title="点击下载这首歌"></span>' +
                '<span class="list-icon icon-share" data-function="share" title="点击分享这首歌"></span>' +
            '</div>';
            target.html(html);
            $(this).data("loadmenu", true);
        }
    });

    $(".music-list").on("click",".icon-play,.icon-download,.icon-share", function() {
        var num = parseInt($(this).parent().data("no"));
        if(isNaN(num)) return false;
        switch($(this).data("function")) {
            case "play":
                listClick(num);
            break;
            case "download":
                ajaxUrl(musicList[rem.dislist].item[num], download);
            break;
            case "share":

                ajaxUrl(musicList[rem.dislist].item[num], ajaxShare);
            break;
        }
        return true;
    });

    $(".music-list").on("click",".list-loadmore", function() {
        $(".list-loadmore").removeClass('list-loadmore');
        $(".list-loadmore").html('加载中...');
        ajaxSearch();
    });

    $("#sheet").on("click",".sheet-cover,.sheet-name", function() {
        var num = parseInt($(this).parent().data("no"));
        if(musicList[num].item.length === 0 && musicList[num].creatorID) {
            layer.msg('列表读取中...', {icon: 16,shade: 0.01,time: 500});
            ajaxPlayList(musicList[num].id, num, loadList);
            return true;
        }
        loadList(num);
    });

    $("#sheet").on("click",".login-in", function() {
        layer.prompt(
        {
            title: '请输入您的网易云 UID',
            btn: ['确定', '取消', '帮助'],
            btn3: function(index, layero){
                layer.open({
                    title: '如何获取您的网易云UID？'
                    ,shade: 0.6
                    ,anim: 0
                    ,content:
                    '1、首先<a href="http://music.163.com/" target="_blank">点我(http://music.163.com/)</a>打开网易云音乐官网<br>' +
                    '2、然后点击页面右上角的“登录”，登录您的账号<br>' +
                    '3、点击您的头像，进入个人中心<br>' +
                    '4、此时<span style="color:red">浏览器地址栏</span> <span style="color: green">/user/home?id=</span> 后面的<span style="color:red">数字</span>就是您的网易云 UID'
                });
            }
        },
        function(val, index){
            if(isNaN(val)) {
                layer.msg('uid 只能是数字',{anim: 6});
                return false;
            }
            layer.close(index);
            ajaxUserList(val);
        });
    });
    $("#sheet").on("click",".login-refresh", function() {
        playerSavedata('ulist', '');
        layer.msg('刷新歌单');
        clearUserlist();
    });

    $("#sheet").on("click",".login-out", function() {
        playerSavedata('uid', '');
        playerSavedata('ulist', '');
        layer.msg('已退出');
        clearUserlist();
    });

    $("#music-info").click(function(){
        if(rem.playid === undefined) {
            layer.msg('请先播放歌曲');
            return false;
        }

        musicInfo(rem.playlist, rem.playid);
    });

    $(".btn-play").click(function(){
        pause();
    });

    $(".btn-order").click(function(){
        orderChange();
    });

    $(".btn-prev").click(function(){
        prevMusic();
    });


    $(".btn-next").click(function(){
        nextMusic();
    });

    $(".btn-quiet").click(function(){
        var oldVol;
        if($(this).is('.btn-state-quiet')) {
            oldVol = $(this).data("volume");
            oldVol = oldVol? oldVol: (rem.isMobile? 1: mkPlayer.volume);
            $(this).removeClass("btn-state-quiet");
        } else {
            oldVol = volume_bar.percent;
            $(this).addClass("btn-state-quiet");
            $(this).data("volume", oldVol);
            oldVol = 0;
        }
        playerSavedata('volume', oldVol);
        volume_bar.goto(oldVol);
        if(rem.audio[0] !== undefined) rem.audio[0].volume = oldVol;
    });

    if((mkPlayer.coverbg === true && !rem.isMobile) || (mkPlayer.mcoverbg === true && rem.isMobile)) {

        if(rem.isMobile) {
            $('#blur-img').html('<div class="blured-img" id="mobile-blur"></div><div class="blur-mask mobile-mask"></div>');
        } else {

            $('#blur-img').backgroundBlur({
                blurAmount : 50,
                imageClass : 'blured-img',
                overlayClass : 'blur-mask',
                endOpacity : 1
            });
        }

        $('.blur-mask').fadeIn(1000);
    }

    $('img').error(function(){
        $(this).attr('src', 'images/player_cover.png');
    });

    initList();
});

function musicInfo(list, index) {
    var music = musicList[list].item[index];
    var tempStr = '<span class="info-title">歌名：</span>' + music.name +
    '<br><span class="info-title">歌手：</span>' + music.artist +
    '<br><span class="info-title">专辑：</span>' + music.album;

    if(list == rem.playlist && index == rem.playid) {
        tempStr += '<br><span class="info-title">时长：</span>' + formatTime(rem.audio[0].duration);
    }

    tempStr += '<br><span class="info-title">操作：</span>' +
    '<span class="info-btn" onclick="thisDownload(this)" data-list="' + list + '" data-index="' + index + '">下载</span>' +
    '<span style="margin-left: 10px" class="info-btn" onclick="thisShare(this)" data-list="' + list + '" data-index="' + index + '">外链</span>';

    layer.open({
        type: 0,
        shade: false,
        title: false,
        btn: false,
        content: tempStr
    });

    if(mkPlayer.debug) {
        console.info('id: "' + music.id + '",\n' +
        'name: "' + music.name + '",\n' +
        'artist: "' + music.artist + '",\n' +
        'album: "' + music.album + '",\n' +
        'source: "' + music.source + '",\n' +
        'url_id: "' + music.url_id + '",\n' +
        'pic_id: "' + music.pic_id + '",\n' +
        'lyric_id: "' + music.lyric_id + '",\n' +
        'pic: "' + music.pic + '",\n' +
        'url: ""');
    }
}


function searchBox() {
    var tmpHtml = '<form onSubmit="return searchSubmit()"><div id="search-area">' +
    '    <div class="search-group">' +
    '        <input type="text" name="wd" id="search-wd" placeholder="搜索歌手、歌名、专辑" autofocus required>' +
    '        <button class="search-submit" type="submit">搜 索</button>' +
    '    </div>' +
    '    <div class="radio-group" id="music-source">' +
    '       <label><input type="radio" name="source" value="netease" checked=""> 网易云</label>' +
    '       <label><input type="radio" name="source" value="tencent"> QQ</label>' +
    '       <label><input type="radio" name="source" value="xiami"> 虾米</label>' +
    '       <label><input type="radio" name="source" value="kugou"> 酷狗</label>' +
    '       <label><input type="radio" name="source" value="baidu"> 百度</label>' +
    '   </div>' +
    '</div></form>';
    layer.open({
        type: 1,
        shade: false,
        title: false,
        shade: 0.5,
        shadeClose: true,
        content: tmpHtml,
        cancel: function(){
        }
    });

    $("#search-wd").focus().val(rem.wd);
    $("#music-source input[name='source'][value='" + rem.source + "']").prop("checked", "checked");
}

function searchSubmit() {
    var wd = $("#search-wd").val();
    if(!wd) {
        layer.msg('搜索内容不能为空', {anim:6, offset: 't'});
        $("#search-wd").focus();
        return false;
    }
    rem.source = $("#music-source input[name='source']:checked").val();

    layer.closeAll('page');

    rem.loadPage = 1;
    rem.wd = wd;
    ajaxSearch();
    return false;
}

function thisDownload(obj) {
    ajaxUrl(musicList[$(obj).data("list")].item[$(obj).data("index")], download);
}


function thisShare(obj) {
    ajaxUrl(musicList[$(obj).data("list")].item[$(obj).data("index")], ajaxShare);
}


function download(music) {
    if(music.url == 'err' || music.url == "" || music.url == null) {
        layer.msg('这首歌不支持下载');
        return;
    }
    openDownloadDialog(music.url, music.name + ' - ' + music.artist);
}


function openDownloadDialog(url, saveName)
{
    if(typeof url == 'object' && url instanceof Blob)
    {
        url = URL.createObjectURL(url);
    }
    var aLink = document.createElement('a');
    aLink.href = url;
    aLink.target = "_blank";
    aLink.download = saveName || '';
    var event;
    if(window.MouseEvent) event = new MouseEvent('click');
    else
    {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    aLink.dispatchEvent(event);
}

function ajaxShare(music) {
    if(music.url == 'err' || music.url == "" || music.url == null) {
        layer.msg('这首歌不支持外链获取');
        return;
    }

    var tmpHtml = '<p>' + music.artist + ' - ' + music.name + ' 的外链地址为：</p>' +
    '<input class="share-url" onmouseover="this.focus();this.select()" value="' + music.url + '">' +
    '<p class="share-tips">* 获取到的音乐外链有效期较短，请按需使用。</p>';

    layer.open({
        title: '歌曲外链分享'
        ,content: tmpHtml
    });
}

function changeCover(music) {
    var img = music.pic;
    var animate = false,imgload = false;

    if(!img) {
        ajaxPic(music, changeCover);
        img == "err";
    }

    if(img == "err") {
        img = "images/player_cover.png";
    } else {
        if(mkPlayer.mcoverbg === true && rem.isMobile)
        {
            $("#music-cover").load(function(){
                $("#mobile-blur").css('background-image', 'url("' + img + '")');
            });
        }
        else if(mkPlayer.coverbg === true && !rem.isMobile)
        {
            $("#music-cover").load(function(){
                if(animate) {
                    $("#blur-img").backgroundBlur(img);
                    $("#blur-img").animate({opacity:"1"}, 2000);
                } else {
                    imgload = true;
                }

            });

            $("#blur-img").animate({opacity: "0.2"}, 1000, function(){
                if(imgload) {
                    $("#blur-img").backgroundBlur(img);
                    $("#blur-img").animate({opacity:"1"}, 2000);
                } else {
                    animate = true;
                }
            });
        }
    }

    $("#music-cover").attr("src", img);
    $(".sheet-item[data-no='1'] .sheet-cover").attr('src', img);
}


function loadList(list) {
    if(musicList[list].isloading === true) {
        layer.msg('列表读取中...', {icon: 16,shade: 0.01,time: 500});
        return true;
    }

    rem.dislist = list;

    dataBox("list");

    if(mkPlayer.debug) {
        if(musicList[list].id) {
            console.log('加载播放列表 ' + list + ' - ' + musicList[list].name + '\n' +
            'id: ' + musicList[list].id + ',\n' +
            'name: "' + musicList[list].name + '",\n' +
            'cover: "' + musicList[list].cover + '",\n' +
            'item: []');
        } else {
            console.log('加载播放列表 ' + list + ' - ' + musicList[list].name);
        }
    }

    rem.mainList.html('');
    addListhead();

    if(musicList[list].item.length == 0) {
        addListbar("nodata");
    } else {

        for(var i=0; i<musicList[list].item.length; i++) {
            var tmpMusic = musicList[list].item[i];

            addItem(i + 1, tmpMusic.name, tmpMusic.artist, tmpMusic.album);


            if(list == 1 || list == 2) tmpMusic.url = "";
        }

        if(list == 1 || list == 2) {
            addListbar("clear");
        }

        if(rem.playlist === undefined) {
            if(mkPlayer.autoplay == true) pause();
        } else {
            refreshList();
        }

        listToTop();
    }
}

function listToTop() {
    if(rem.isMobile) {
        $("#main-list").animate({scrollTop: 0}, 200);
    } else {
        $("#main-list").mCustomScrollbar("scrollTo", 0, "top");
    }
}

function addListhead() {
    var html = '<div class="list-item list-head">' +
    '    <span class="music-album">' +
    '        专辑' +
    '    </span>' +
    '    <span class="auth-name">' +
    '        歌手' +
    '    </span>' +
    '    <span class="music-name">' +
    '        歌曲' +
    '    </span>' +
    '</div>';
    rem.mainList.append(html);
}

function addItem(no, name, auth, album) {
    var html = '<div class="list-item" data-no="' + (no - 1) + '">' +
    '    <span class="list-num">' + no + '</span>' +
    '    <span class="list-mobile-menu"></span>' +
    '    <span class="music-album">' + album + '</span>' +
    '    <span class="auth-name">' + auth + '</span>' +
    '    <span class="music-name">' + name + '</span>' +
    '</div>';
    rem.mainList.append(html);
}


function addListbar(types) {
    var html
    switch(types) {
        case "more":
            html = '<div class="list-item text-center list-loadmore list-clickable" title="点击加载更多数据" id="list-foot">点击加载更多...</div>';
        break;

        case "nomore":
            html = '<div class="list-item text-center" id="list-foot">全都加载完了</div>';
        break;

        case "loading":
            html = '<div class="list-item text-center" id="list-foot">播放列表加载中...</div>';
        break;

        case "nodata":
            html = '<div class="list-item text-center" id="list-foot">可能是个假列表，什么也没有</div>';
        break;

        case "clear":
            html = '<div class="list-item text-center list-clickable" id="list-foot" onclick="clearDislist();">清空列表</div>';
        break;
    }
    rem.mainList.append(html);
}

function formatTime(time){
	var hour,minute,second;
	hour = String(parseInt(time/3600,10));
	if(hour.length == 1) hour='0' + hour;

	minute=String(parseInt((time%3600)/60,10));
	if(minute.length == 1) minute='0'+minute;

	second=String(parseInt(time%60,10));
	if(second.length == 1) second='0'+second;

	if(hour > 0) {
	    return hour + ":" + minute + ":" + second;
	} else {
	    return minute + ":" + second;
	}
}

function urlEncode(String) {
    return encodeURIComponent(String).replace(/'/g,"%27").replace(/"/g,"%22");
}


function updateMinfo(music) {

    if(!music.id) return false;

    for(var i=0; i<musicList.length; i++) {
        for(var j=0; j<musicList[i].item.length; j++) {
            if(musicList[i].item[j].id == music.id && musicList[i].item[j].source == music.source) {
                musicList[i].item[j] == music;
                j = musicList[i].item.length;
            }
        }
    }
}

function refreshList() {

    if(rem.playlist === undefined) return true;

    $(".list-playing").removeClass("list-playing");

    if(rem.paused !== true) {
        for(var i=0; i<musicList[rem.dislist].item.length; i++) {
            if((musicList[rem.dislist].item[i].id !== undefined) &&
              (musicList[rem.dislist].item[i].id == musicList[1].item[rem.playid].id) &&
              (musicList[rem.dislist].item[i].source == musicList[1].item[rem.playid].source)) {
                $(".list-item[data-no='" + i + "']").addClass("list-playing");

                return true;
            }
        }
    }

}

function addSheet(no, name, cover) {
    if(!cover) cover = "images/player_cover.png";
    if(!name) name = "读取中...";

    var html = '<div class="sheet-item" data-no="' + no + '">' +
    '    <img class="sheet-cover" src="' +cover+ '">' +
    '    <p class="sheet-name">' +name+ '</p>' +
    '</div>';
    rem.sheetList.append(html);
}

function clearSheet() {
    rem.sheetList.html('');
}


function sheetBar() {
    var barHtml;
    if(playerReaddata('uid')) {
        barHtml = '已同步 ' + rem.uname + ' 的歌单 <span class="login-btn login-refresh">[刷新]</span> <span class="login-btn login-out">[退出]</span>';
    } else {
        barHtml = '我的歌单 <span class="login-btn login-in">[点击同步]</span>';
    }
    barHtml = '<span id="sheet-bar"><div class="clear-fix"></div>' +
    '<div id="user-login" class="sheet-title-bar">' + barHtml +
    '</div></span>';
    rem.sheetList.append(barHtml);
}


function dataBox(choose) {
    $('.btn-box .active').removeClass('active');
    switch(choose) {
        case "list":
            if($(".btn[data-action='player']").css('display') !== 'none') {
                $("#player").hide();
            } else if ($("#player").css('display') == 'none') {
                $("#player").fadeIn();
            }
            $("#main-list").fadeIn();
            $("#sheet").fadeOut();
            if(rem.dislist == 1 || rem.dislist == rem.playlist) {
                $(".btn[data-action='playing']").addClass('active');
            } else if(rem.dislist == 0) {
                $(".btn[data-action='search']").addClass('active');
            }
        break;

        case "sheet":
            if($(".btn[data-action='player']").css('display') !== 'none') {
                $("#player").hide();
            } else if ($("#player").css('display') == 'none') {
                $("#player").fadeIn();
            }
            $("#sheet").fadeIn();
            $("#main-list").fadeOut();
            $(".btn[data-action='sheet']").addClass('active');
        break;

        case "player":
            $("#player").fadeIn();
            $("#sheet").fadeOut();
            $("#main-list").fadeOut();
            $(".btn[data-action='player']").addClass('active');
        break;
    }
}

function addHis(music) {
    if(rem.playlist == 2) return true;

    if(musicList[2].item.length > 300) musicList[2].item.length = 299;

    if(music.id !== undefined && music.id !== '') {

        for(var i=0; i<musicList[2].item.length; i++) {
            if(musicList[2].item[i].id == music.id && musicList[2].item[i].source == music.source) {
                musicList[2].item.splice(i, 1);
                i = musicList[2].item.length;
            }
        }
    }

    musicList[2].item.unshift(music);

    playerSavedata('his', musicList[2].item);
}


function initList() {
    if(playerReaddata('uid')) {
        rem.uid = playerReaddata('uid');
        rem.uname = playerReaddata('uname');
        var tmp_ulist = playerReaddata('ulist');

        if(tmp_ulist) musicList.push.apply(musicList, tmp_ulist);
    }

    for(var i=1; i<musicList.length; i++) {

        if(i == 1) {
            var tmp_item = playerReaddata('playing');
            if(tmp_item) {
                musicList[1].item = tmp_item;
                mkPlayer.defaultlist = 1;
            }

        } else if(i == 2) {

            var tmp_item = playerReaddata('his');
            if(tmp_item) {
                musicList[2].item = tmp_item;
            }

        }else if(!musicList[i].creatorID && (musicList[i].item == undefined || (i>2 && musicList[i].item.length == 0))) {
            musicList[i].item = [];
            if(musicList[i].id) {

                ajaxPlayList(musicList[i].id, i);
            } else {
                if(!musicList[i].name) musicList[i].name = '未命名';
            }
        }

        addSheet(i, musicList[i].name, musicList[i].cover);
    }

    if(playerReaddata('uid') && !tmp_ulist) {
        ajaxUserList(rem.uid);
        return true;
    }

    if(mkPlayer.defaultlist >= musicList.length) mkPlayer.defaultlist = 1;  // 超出范围，显示正在播放列表

    if(musicList[mkPlayer.defaultlist].isloading !== true)  loadList(mkPlayer.defaultlist);

    sheetBar();
}

function clearUserlist() {
    if(!rem.uid) return false;

    for(var i=1; i<musicList.length; i++) {
        if(musicList[i].creatorID !== undefined && musicList[i].creatorID == rem.uid) break;
    }

    musicList.splice(i, musicList.length - i);
    musicList.length = i;

    clearSheet();
    initList();
}

function clearDislist() {
    musicList[rem.dislist].item.length = 0;
    if(rem.dislist == 1) {
        playerSavedata('playing', '');
        $(".sheet-item[data-no='1'] .sheet-cover").attr('src', 'images/player_cover.png');
    } else if(rem.dislist == 2) {
        playerSavedata('his', '');
    }
    layer.msg('列表已被清空');
    dataBox("sheet");
}

function refreshSheet() {
    if(mkPlayer.debug) {
        console.log("开始播放列表 " + musicList[rem.playlist].name + " 中的歌曲");
    }

    $(".sheet-playing").removeClass("sheet-playing");

    $(".sheet-item[data-no='" + rem.playlist + "']").addClass("sheet-playing");
}

function playerSavedata(key, data) {
    key = 'mkPlayer2_' + key;
    data = JSON.stringify(data);
    if (window.localStorage) {
        localStorage.setItem(key, data);
    }
}

function playerReaddata(key) {
    if(!window.localStorage) return '';
    key = 'mkPlayer2_' + key;
    return JSON.parse(localStorage.getItem(key));
}
