
var mkPlayer = {
    api: "api.php",
    loadcount: 20,
    method: "POST",
    defaultlist: 3,
    autoplay: false,
    coverbg: true,
    mcoverbg: true,
    dotshine: true,
    mdotshine: false,
    volume: 0.6,
    version: "v2.41",
    debug: false
};

var rem = [];


function audioErr() {

    if(rem.playlist === undefined) return true;

    if(rem.errCount > 10) {
        layer.msg('似乎出了点问题~播放已停止');
        rem.errCount = 0;
    } else {
        rem.errCount++;
        layer.msg('当前歌曲播放失败，自动播放下一首');
        nextMusic();
    }
}

function pause() {
    if(rem.paused === false) {
        rem.audio[0].pause();
    } else {
        if(rem.playlist === undefined) {
            rem.playlist = rem.dislist;

            musicList[1].item = musicList[rem.playlist].item;
            playerSavedata('playing', musicList[1].item);

            listClick(0);
        }
        rem.audio[0].play();
    }
}

function orderChange() {
    var orderDiv = $(".btn-order");
    orderDiv.removeClass();
    switch(rem.order) {
        case 1:
            orderDiv.addClass("player-btn btn-order btn-order-list");
            orderDiv.attr("title", "列表循环");
            layer.msg("列表循环");
            rem.order = 2;
            break;

        case 3:
            orderDiv.addClass("player-btn btn-order btn-order-single");
            orderDiv.attr("title", "单曲循环");
            layer.msg("单曲循环");
            rem.order = 1;
            break;

        // case 2:
        default:
            orderDiv.addClass("player-btn btn-order btn-order-random");
            orderDiv.attr("title", "随机播放");
            layer.msg("随机播放");
            rem.order = 3;
    }
}

function audioPlay() {
    rem.paused = false;
    refreshList();
    $(".btn-play").addClass("btn-state-paused");

    if((mkPlayer.dotshine === true && !rem.isMobile) || (mkPlayer.mdotshine === true && rem.isMobile)) {
        $("#music-progress .mkpgb-dot").addClass("dot-move");
    }

    var music = musicList[rem.playlist].item[rem.playid];
    var msg = " 正在播放: " + music.name + " - " + music.artist;
    if (rem.titflash !== undefined )
    {
        clearInterval(rem.titflash);
    }
    titleFlash(msg);
}
function titleFlash(msg) {

    var tit = function() {
        msg = msg.substring(1,msg.length)+ msg.substring(0,1);
        document.title = msg;
    };
    rem.titflash = setInterval(function(){tit()}, 300);
}
function audioPause() {
    rem.paused = true;

    $(".list-playing").removeClass("list-playing");

    $(".btn-play").removeClass("btn-state-paused");

    $("#music-progress .dot-move").removeClass("dot-move");

    if (rem.titflash !== undefined )
    {
        clearInterval(rem.titflash);
    }
    document.title = rem.webTitle;
}

function prevMusic() {
    playList(rem.playid - 1);
}

function nextMusic() {
    switch (rem.order ? rem.order : 1) {
        case 1,2:
            playList(rem.playid + 1);
        break;
        case 3:
            if (musicList[1] && musicList[1].item.length) {
                var id = parseInt(Math.random() * musicList[1].item.length);
                playList(id);
            }
        break;
        default:
            playList(rem.playid + 1);
        break;
    }
}
function autoNextMusic() {
    if(rem.order && rem.order === 1) {
        playList(rem.playid);
    } else {
        nextMusic();
    }
}

function updateProgress(){
    if(rem.paused !== false) return true;
	music_bar.goto(rem.audio[0].currentTime / rem.audio[0].duration);
	scrollLyric(rem.audio[0].currentTime);
}

function listClick(no) {
    var tmpid = no;

    if(mkPlayer.debug) {
        console.log("点播了列表中的第 " + (no + 1) + " 首歌 " + musicList[rem.dislist].item[no].name);
    }

    if(rem.dislist === 0) {

        if(rem.playlist === undefined) {
            rem.playlist = 1;
            rem.playid = musicList[1].item.length - 1;
        }


        var tmpMusic = musicList[0].item[no];



        for(var i=0; i<musicList[1].item.length; i++) {
            if(musicList[1].item[i].id == tmpMusic.id && musicList[1].item[i].source == tmpMusic.source) {
                tmpid = i;
                playList(tmpid);
                return true;
            }
        }


        musicList[1].item.splice(rem.playid + 1, 0, tmpMusic);
        tmpid = rem.playid + 1;

        playerSavedata('playing', musicList[1].item);
    } else {

        if((rem.dislist !== rem.playlist && rem.dislist !== 1) || rem.playlist === undefined) {
            rem.playlist = rem.dislist;
            musicList[1].item = musicList[rem.playlist].item;

            playerSavedata('playing', musicList[1].item);
            refreshSheet();
        }
    }

    playList(tmpid);

    return true;
}

function playList(id) {

    if(rem.playlist === undefined) {
        pause();
        return true;
    }

    if(musicList[1].item.length <= 0) return true;

    if(id >= musicList[1].item.length) id = 0;
    if(id < 0) id = musicList[1].item.length - 1;


    rem.playid = id;

    if(musicList[1].item[id].url === null || musicList[1].item[id].url === "") {
        ajaxUrl(musicList[1].item[id], play);
    } else {
        play(musicList[1].item[id]);
    }
}

function initAudio() {
    rem.audio = $('<audio></audio>').appendTo('body');

    rem.audio[0].volume = volume_bar.percent;
    rem.audio[0].addEventListener('timeupdate', updateProgress);
    rem.audio[0].addEventListener('play', audioPlay);
    rem.audio[0].addEventListener('pause', audioPause);
    $(rem.audio[0]).on('ended', autoNextMusic);
    rem.audio[0].addEventListener('error', audioErr);
}


function play(music) {
    if(mkPlayer.debug) {
        console.log('开始播放 - ' + music.name);

        console.info('id: "' + music.id + '",\n' +
        'name: "' + music.name + '",\n' +
        'artist: "' + music.artist + '",\n' +
        'album: "' + music.album + '",\n' +
        'source: "' + music.source + '",\n' +
        'url_id: "' + music.url_id + '",\n' +
        'pic_id: "' + music.pic_id + '",\n' +
        'lyric_id: "' + music.lyric_id + '",\n' +
        'pic: "' + music.pic + '",\n' +
        'url: "' + music.url + '"');
    }

    if(music.url == "err") {
        audioErr();
        return false;
    }

    addHis(music);
    if(rem.dislist == 2 && rem.playlist !== 2) {
        loadList(2);
    } else {
        refreshList();
    }

    try {
        rem.audio[0].pause();
        rem.audio.attr('src', music.url);
        rem.audio[0].play();
    } catch(e) {
        audioErr();
        return;
    }

    rem.errCount = 0;
    music_bar.goto(0);
    changeCover(music);
    ajaxLyric(music, lyricCallback);
    music_bar.lock(false);
}


function mBcallback(newVal) {
    var newTime = rem.audio[0].duration * newVal;
    rem.audio[0].currentTime = newTime;
    refreshLyric(newTime);
}

function vBcallback(newVal) {
    if(rem.audio[0] !== undefined) {
        rem.audio[0].volume = newVal;
    }

    if($(".btn-quiet").is('.btn-state-quiet')) {
        $(".btn-quiet").removeClass("btn-state-quiet");
    }

    if(newVal === 0) $(".btn-quiet").addClass("btn-state-quiet");

    playerSavedata('volume', newVal);
}

var initProgress = function(){
    music_bar = new mkpgb("#music-progress", 0, mBcallback);
    music_bar.lock(true);
    var tmp_vol = playerReaddata('volume');
    tmp_vol = (tmp_vol != null)? tmp_vol: (rem.isMobile? 1: mkPlayer.volume);
    if(tmp_vol < 0) tmp_vol = 0;
    if(tmp_vol > 1) tmp_vol = 1;
    if(tmp_vol == 0) $(".btn-quiet").addClass("btn-state-quiet");
    volume_bar = new mkpgb("#volume-progress", tmp_vol, vBcallback);
};

mkpgb = function(bar, percent, callback){
    this.bar = bar;
    this.percent = percent;
    this.callback = callback;
    this.locked = false;
    this.init();
};

mkpgb.prototype = {
    init : function(){
        var mk = this,mdown = false;
        $(mk.bar).html('<div class="mkpgb-bar"></div><div class="mkpgb-cur"></div><div class="mkpgb-dot"></div>');
        mk.minLength = $(mk.bar).offset().left;
        mk.maxLength = $(mk.bar).width() + mk.minLength;
        $(window).resize(function(){
            mk.minLength = $(mk.bar).offset().left;
            mk.maxLength = $(mk.bar).width() + mk.minLength;
        });
        $(mk.bar + " .mkpgb-dot").mousedown(function(e){
            e.preventDefault();
        });
        $(mk.bar).mousedown(function(e){
            if(!mk.locked) mdown = true;
            barMove(e);
        });
        $("html").mousemove(function(e){
            barMove(e);
        });
        $("html").mouseup(function(e){
            mdown = false;
        });

        function barMove(e) {
            if(!mdown) return;
            var percent = 0;
            if(e.clientX < mk.minLength){
                percent = 0;
            }else if(e.clientX > mk.maxLength){
                percent = 1;
            }else{
                percent = (e.clientX - mk.minLength) / (mk.maxLength - mk.minLength);
            }
            mk.callback(percent);
            mk.goto(percent);
            return true;
        }

        mk.goto(mk.percent);

        return true;
    },
    goto : function(percent) {
        if(percent > 1) percent = 1;
        if(percent < 0) percent = 0;
        this.percent = percent;
        $(this.bar + " .mkpgb-dot").css("left", (percent*100) +"%");
        $(this.bar + " .mkpgb-cur").css("width", (percent*100)+"%");
        return true;
    },
    lock : function(islock) {
        if(islock) {
            this.locked = true;
            $(this.bar).addClass("mkpgb-locked");
        } else {
            this.locked = false;
            $(this.bar).removeClass("mkpgb-locked");
        }
        return true;
    }
};
