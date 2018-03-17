
var lyricArea = $("#lyric");
function lyricTip(str) {
    lyricArea.html("<li class='lyric-tip'>"+str+"</li>");
}

function lyricCallback(str, id) {
    if(id !== musicList[rem.playlist].item[rem.playid].id) return;

    rem.lyric = parseLyric(str);

    if(rem.lyric === '') {
        lyricTip('没有歌词');
        return false;
    }

    lyricArea.html('');
    lyricArea.scrollTop(0);

    rem.lastLyric = -1;

    var i = 0;
    for(var k in rem.lyric){
        var txt = rem.lyric[k];
        if(!txt) txt = "&nbsp;";
        var li = $("<li data-no='"+i+"' class='lrc-item'>"+txt+"</li>");
        lyricArea.append(li);
        i++;
    }
}


function refreshLyric(time) {
    if(rem.lyric === '') return false;

    time = parseInt(time);
    var i = 0;
    for(var k in rem.lyric){
        if(k >= time) break;
        i = k;
    }

    scrollLyric(i);
}


function scrollLyric(time) {
    if(rem.lyric === '') return false;

    time = parseInt(time);

    if(rem.lyric === undefined || rem.lyric[time] === undefined) return false;

    if(rem.lastLyric == time) return true;
    var i = 0;
    for(var k in rem.lyric){
        if(k == time) break;
        i ++;
    }
    rem.lastLyric = time;
    $(".lplaying").removeClass("lplaying");
    $(".lrc-item[data-no='" + i + "']").addClass("lplaying");

    var scroll = (lyricArea.children().height() * i) - ($(".lyric").height() / 2);
    lyricArea.stop().animate({scrollTop: scroll}, 1000);

}

function parseLyric(lrc) {
    if(lrc === '') return '';
    var lyrics = lrc.split("\n");
    var lrcObj = {};
    for(var i=0;i<lyrics.length;i++){
        var lyric = decodeURIComponent(lyrics[i]);
        var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
        var timeRegExpArr = lyric.match(timeReg);
        if(!timeRegExpArr)continue;
        var clause = lyric.replace(timeReg,'');
        for(var k = 0,h = timeRegExpArr.length;k < h;k++) {
            var t = timeRegExpArr[k];
            var min = Number(String(t.match(/\[\d*/i)).slice(1)),
                sec = Number(String(t.match(/\:\d*/i)).slice(1));
            var time = min * 60 + sec;
            lrcObj[time] = clause;
        }
    }
    return lrcObj;
}
