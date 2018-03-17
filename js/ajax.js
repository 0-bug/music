function ajaxSearch() {
    if(rem.wd === ""){
        layer.msg('搜索内容不能为空', {anim:6});
        return false;
    }

    if(rem.loadPage == 1) {
        var tmpLoading = layer.msg('搜索中', {icon: 16,shade: 0.01});
    }

    $.ajax({
        type: mkPlayer.method,
        url: mkPlayer.api,
        data: "types=search&count=" + mkPlayer.loadcount + "&source=" + rem.source + "&pages=" + rem.loadPage + "&name=" + rem.wd,
        dataType : "jsonp",
        complete: function(XMLHttpRequest, textStatus) {
            if(tmpLoading) layer.close(tmpLoading);
        },
        success: function(jsonData){

            if(mkPlayer.debug) {
                console.debug("搜索结果数：" + jsonData.length);
            }

            if(rem.loadPage == 1)
            {
                if(jsonData.length === 0)
                {
                    layer.msg('没有找到相关歌曲', {anim:6});
                    return false;
                }
                musicList[0].item = [];
                rem.mainList.html('');
                addListhead();
            } else {
                $("#list-foot").remove();
            }

            if(jsonData.length === 0)
            {
                addListbar("nomore");
                return false;
            }

            var tempItem = [], no = musicList[0].item.length;

            for (var i = 0; i < jsonData.length; i++) {
                no ++;
                tempItem =  {
                    id: jsonData[i].id,
                    name: jsonData[i].name,
                    artist: jsonData[i].artist[0],
                    album: jsonData[i].album,
                    source: jsonData[i].source,
                    url_id: jsonData[i].url_id,
                    pic_id: jsonData[i].pic_id,
                    lyric_id: jsonData[i].lyric_id,
                    pic: null,
                    url: null
                };
                musicList[0].item.push(tempItem);
                addItem(no, tempItem.name, tempItem.artist, tempItem.album);
            }

            rem.dislist = 0;
            rem.loadPage ++;

            dataBox("list");
            refreshList();

            if(no < mkPlayer.loadcount) {
                addListbar("nomore");
            } else {
                addListbar("more");
            }

            if(rem.loadPage == 2) listToTop();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            layer.msg('搜索结果获取失败 - ' + XMLHttpRequest.status);
            console.error(XMLHttpRequest + textStatus + errorThrown);
        }
    });
}


function ajaxUrl(music, callback)
{
    if(music.url !== null && music.url !== "err" && music.url !== "") {
        callback(music);
        return true;
    }
    if(music.id === null) {
        music.url = "err";
        updateMinfo(music);
        callback(music);
        return true;
    }

    $.ajax({
        type: mkPlayer.method,
        url: mkPlayer.api,
        data: "types=url&id=" + music.id + "&source=" + music.source,
        dataType : "jsonp",
        success: function(jsonData){
            // 调试信息输出
            if(mkPlayer.debug) {
                console.debug("歌曲链接：" + jsonData.url);
            }
            if(music.source == "netease") {
                if(jsonData.url === "") {
                    jsonData.url = "https://music.163.com/song/media/outer/url?id=" + music.id + ".mp3";
                } else {
                    jsonData.url = jsonData.url.replace(/m7c.music./g, "m7.music.");
                    jsonData.url = jsonData.url.replace(/m8c.music./g, "m8.music.");
                }
            } else if(music.source == "baidu") {
                jsonData.url = jsonData.url.replace(/http:\/\/zhangmenshiting.qianqian.com/g, "https://gss0.bdstatic.com/y0s1hSulBw92lNKgpU_Z2jR7b2w6buu");
            }

            if(jsonData.url === "") {
                music.url = "err";
            } else {
                music.url = jsonData.url;
            }

            updateMinfo(music);

            callback(music);
            return true;
        },   //success
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            layer.msg('歌曲链接获取失败 - ' + XMLHttpRequest.status);
            console.error(XMLHttpRequest + textStatus + errorThrown);
        }
    });

}

function ajaxPic(music, callback)
{

    if(music.pic !== null && music.pic !== "err" && music.pic !== "") {
        callback(music);
        return true;
    }

    if(music.pic_id === null) {
        music.pic = "err";
        updateMinfo(music);
        callback(music);
        return true;
    }

    $.ajax({
        type: mkPlayer.method,
        url: mkPlayer.api,
        data: "types=pic&id=" + music.pic_id + "&source=" + music.source,
        dataType : "jsonp",
        success: function(jsonData){
            // 调试信息输出
            if(mkPlayer.debug) {
                console.log("歌曲封面：" + jsonData.url);
            }

            if(jsonData.url !== "") {
                music.pic = jsonData.url;
            } else {
                music.pic = "err";
            }

            updateMinfo(music);

            callback(music);
            return true;
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            layer.msg('歌曲封面获取失败 - ' + XMLHttpRequest.status);
            console.error(XMLHttpRequest + textStatus + errorThrown);
        }
    });

}

function ajaxPlayList(lid, id, callback) {
    if(!lid) return false;


    if(musicList[id].isloading === true) {
        return true;
    }

    musicList[id].isloading = true;

    $.ajax({
        type: mkPlayer.method,
        url: mkPlayer.api,
        data: "types=playlist&id=" + lid,
        dataType : "jsonp",
        complete: function(XMLHttpRequest, textStatus) {
            musicList[id].isloading = false;
        },  // complete
        success: function(jsonData){
            var tempList = {
                id: lid,
                name: jsonData.playlist.name,
                cover: jsonData.playlist.coverImgUrl,
                creatorName: jsonData.playlist.creator.nickname,
                creatorAvatar: jsonData.playlist.creator.avatarUrl,
                item: []
            };

            if(jsonData.playlist.coverImgUrl !== '') {
                tempList.cover = jsonData.playlist.coverImgUrl + "?param=200y200";
            } else {
                tempList.cover = musicList[id].cover;
            }

            if(typeof jsonData.playlist.tracks !== undefined || jsonData.playlist.tracks.length !== 0) {
                for (var i = 0; i < jsonData.playlist.tracks.length; i++) {
                    tempList.item[i] =  {
                        id: jsonData.playlist.tracks[i].id,
                        name: jsonData.playlist.tracks[i].name,
                        artist: jsonData.playlist.tracks[i].ar[0].name,
                        album: jsonData.playlist.tracks[i].al.name,
                        source: "netease",
                        url_id: jsonData.playlist.tracks[i].id,
                        pic_id: null,
                        lyric_id: jsonData.playlist.tracks[i].id,
                        pic: jsonData.playlist.tracks[i].al.picUrl + "?param=300y300",
                        url: null
                    };
                }
            }
            if(musicList[id].creatorID) {
                tempList.creatorID = musicList[id].creatorID;
                if(musicList[id].creatorID === rem.uid) {
                    var tmpUlist = playerReaddata('ulist');
                    if(tmpUlist) {
                        for(i=0; i<tmpUlist.length; i++) {
                            if(tmpUlist[i].id == lid) {
                                tmpUlist[i] = tempList;
                                playerSavedata('ulist', tmpUlist);
                                break;
                            }
                        }
                    }
                }
            }

            musicList[id] = tempList;

            if(id == mkPlayer.defaultlist) loadList(id);
            if(callback) callback(id);

            $(".sheet-item[data-no='" + id + "'] .sheet-cover").attr('src', tempList.cover);
            $(".sheet-item[data-no='" + id + "'] .sheet-name").html(tempList.name);

            if(mkPlayer.debug) {
                console.debug("歌单 [" +tempList.name+ "] 中的音乐获取成功");
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            layer.msg('歌单读取失败 - ' + XMLHttpRequest.status);
            console.error(XMLHttpRequest + textStatus + errorThrown);
            $(".sheet-item[data-no='" + id + "'] .sheet-name").html('<span style="color: #EA8383">读取失败</span>');
        }
    });
}

function ajaxLyric(music, callback) {
    lyricTip('歌词加载中...');

    if(!music.lyric_id) callback('');
    $.ajax({
        type: mkPlayer.method,
        url: mkPlayer.api,
        data: "types=lyric&id=" + music.lyric_id + "&source=" + music.source,
        dataType : "jsonp",
        success: function(jsonData){

            if (mkPlayer.debug) {
                console.debug("歌词获取成功");
            }

            if (jsonData.lyric) {
                callback(jsonData.lyric, music.lyric_id);
            } else {
                callback('', music.lyric_id);
            }
        },   //success
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            layer.msg('歌词读取失败 - ' + XMLHttpRequest.status);
            console.error(XMLHttpRequest + textStatus + errorThrown);
            callback('', music.lyric_id);
        }
    });
}



function ajaxUserList(uid)
{
    var tmpLoading = layer.msg('加载中...', {icon: 16,shade: 0.01});
    $.ajax({
        type: mkPlayer.method,
        url: mkPlayer.api,
        data: "types=userlist&uid=" + uid,
        dataType : "jsonp",
        complete: function(XMLHttpRequest, textStatus) {
            if(tmpLoading) layer.close(tmpLoading);
        },
        success: function(jsonData){
            if(jsonData.code == "-1" || jsonData.code == 400){
                layer.msg('用户 uid 输入有误');
                return false;
            }

            if(jsonData.playlist.length === 0 || typeof(jsonData.playlist.length) === "undefined")
            {
                layer.msg('没找到用户 ' + uid + ' 的歌单');
                return false;
            }else{
                var tempList,userList = [];
                $("#sheet-bar").remove();
                rem.uid = uid;
                rem.uname = jsonData.playlist[0].creator.nickname;
                layer.msg('欢迎您 '+rem.uname);
                playerSavedata('uid', rem.uid);
                playerSavedata('uname', rem.uname);

                for (var i = 0; i < jsonData.playlist.length; i++)
                {

                    tempList = {
                        id: jsonData.playlist[i].id,
                        name: jsonData.playlist[i].name,
                        cover: jsonData.playlist[i].coverImgUrl  + "?param=200y200",
                        creatorID: uid,
                        creatorName: jsonData.playlist[i].creator.nickname,
                        creatorAvatar: jsonData.playlist[i].creator.avatarUrl,
                        item: []
                    };
                    addSheet(musicList.push(tempList) - 1, tempList.name, tempList.cover);
                    userList.push(tempList);
                }
                playerSavedata('ulist', userList);
                sheetBar();
            }

            if(mkPlayer.debug) {
                console.debug("用户歌单获取成功 [用户网易云ID：" + uid + "]");
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            layer.msg('歌单同步失败 - ' + XMLHttpRequest.status);
            console.error(XMLHttpRequest + textStatus + errorThrown);
        }
    });
    return true;
}