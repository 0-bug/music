<?php
$netease_cookie = '';
define('HTTPS', false);
define('DEBUG', false);
if(!defined('DEBUG') || DEBUG !== true) error_reporting(0);

require_once('plugns/Meting.php');

use Metowolf\Meting;

$source = getParam('source', 'netease');
$API = new Meting($source);

$API->format(true);

if($source == 'kugou' || $source == 'baidu') {
    define('NO_HTTPS', true);        //
} elseif(($source == 'netease') && $netease_cookie) {
    $API->cookie($netease_cookie);
}

switch(getParam('types'))
{
    case 'url':
        $id = getParam('id');

        $data = $API->url($id);

        echojson($data);
        break;

    case 'pic':
        $id = getParam('id');

        $data = $API->pic($id);

        echojson($data);
        break;

    case 'lyric':
        $id = getParam('id');

        $data = $API->lyric($id);

        echojson($data);
        break;

    case 'download':
        $fileurl = getParam('url');

        header('location:$fileurl');
        exit();
        break;

    case 'userlist':
        $uid = getParam('uid');

        $url= 'http://music.163.com/api/user/playlist/?offset=0&limit=1001&uid='.$uid;
        $data = file_get_contents($url);

        echojson($data);
        break;

    case 'playlist':
        $id = getParam('id');

        $data = $API->format(false)->playlist($id);

        echojson($data);
        break;

    case 'search':
        $s = getParam('name');
        $limit = getParam('count', 20);
        $pages = getParam('pages', 1);

        $data = $API->search($s, [
            'page' => $pages,
            'limit' => $limit
        ]);

        echojson($data);
        break;

    default:
        echo '<!doctype html><html><head><meta charset="utf-8"><title>信息</title><style>* {font-family: microsoft yahei}</style></head><body> <h2>MKOnlinePlayer</h2><h3>Github: https://github.com/mengkunsoft/MKOnlineMusicPlayer</h3><br>';
        if(!defined('DEBUG') || DEBUG !== true) {
            echo '<p>Api 调试模式已关闭</p>';
        } else {
            echo '<p><font color="red">您已开启 Api 调试功能，正常使用时请在 api.php 中关闭该选项！</font></p><br>';

            echo '<p>PHP 版本：'.phpversion().' （本程序要求 PHP 5.4+）</p><br>';

            echo '<p>服务器函数检查</p>';
            echo '<p>curl_exec: '.checkfunc('curl_exec',true).' （用于获取音乐数据）</p>';
            echo '<p>file_get_contents: '.checkfunc('file_get_contents',true).' （用于获取音乐数据）</p>';
            echo '<p>json_decode: '.checkfunc('json_decode',true).' （用于后台数据格式化）</p>';
            echo '<p>hex2bin: '.checkfunc('hex2bin',true).' （用于数据解析）</p>';
            echo '<p>openssl_encrypt: '.checkfunc('openssl_encrypt',true).' （用于数据解析）</p>';
        }

        echo '</body></html>';
}

function checkfunc($f,$m = false) {
	if (function_exists($f)) {
		return '<font color="green">可用</font>';
	} else {
		if ($m == false) {
			return '<font color="black">不支持</font>';
		} else {
			return '<font color="red">不支持</font>';
		}
	}
}

function getParam($key, $default='')
{
    return trim($key && is_string($key) ? (isset($_POST[$key]) ? $_POST[$key] : (isset($_GET[$key]) ? $_GET[$key] : $default)) : $default);
}

function echojson($data)
{
    header('Content-type: application/json');
    $callback = getParam('callback');

    if(defined('HTTPS') && HTTPS === true && !defined('NO_HTTPS')) {
        $data = str_replace('http:\/\/', 'https:\/\/', $data);
        $data = str_replace('http://', 'https://', $data);
    }

    if($callback)
    {
        die(htmlspecialchars($callback).'('.$data.')');
    } else {
        die($data);
    }
}