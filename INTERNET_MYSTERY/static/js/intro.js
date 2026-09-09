/* INTRO SCREEN LOGIC */
var IntroController = (function() {
    function start() {
        var screen = document.getElementById('intro-screen');
        var thumb = document.getElementById('intro-camera-thumb');
        if (screen) { screen.className = 'screen active camera-stage-1'; }
        if (thumb) { thumb.style.top = '0px'; }

        setTimeout(function() {
            var el = document.getElementById('intro-p2');
            if (el) { el.classList.add('visible'); }
            if (screen) { screen.className = 'screen active camera-stage-2'; }
            if (thumb) { thumb.style.top = '77px'; }
        }, 1000);

        setTimeout(function() {
            var el = document.getElementById('intro-warning');
            if (el) { el.classList.add('visible'); }
            if (screen) { screen.className = 'screen active camera-stage-3'; }
            if (thumb) { thumb.style.top = '154px'; }
        }, 2200);

        setTimeout(function() {
            var el = document.getElementById('intro-action');
            if (el) { el.classList.add('visible'); }
            if (screen) { screen.className = 'screen active camera-stage-4'; }
            if (thumb) { thumb.style.top = '231px'; }
        }, 3400);

        var btn = document.getElementById('btn-begin');

        if (btn) {
            btn.addEventListener('click', function() {
                StorageManager.set('intro_completed', true);
                AudioManager.playBegin();
                AppManager.switchScreen('boot-screen');
                BootController.run('main');
            });
        }
    }

    return {
        start: start
    };
})();
