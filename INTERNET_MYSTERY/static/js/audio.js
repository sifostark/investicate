/* INTERNET MYSTERY // AUDIO MANAGER - ES5 */
var AudioManager = (function() {
    var clickSound = null;
    var beginSound = null;
    var backgroundSound = null;
    var backgroundVolume = 0.35;
    var muted = false;

    function createAudio(src, loop) {
        var audio = new Audio();
        audio.src = src;
        audio.preload = 'auto';
        audio.loop = !!loop;
        return audio;
    }

    function init() {
        clickSound = createAudio('/static/audio/Keyboard-Button-Click-Sound Effect(M4A_128K).mp3', false);
        beginSound = createAudio('/static/audio/when pressing begin.mp3', false);
        backgroundSound = createAudio('/static/audio/background.mp3', true);

        var savedVolume = parseFloat(localStorage.getItem('im_background_volume'));
        if (!isNaN(savedVolume)) {
            backgroundVolume = Math.max(0, Math.min(1, savedVolume));
        }

        muted = localStorage.getItem('im_background_muted') === '1';
        applyBackgroundVolume();
    }

    function safePlay(audio) {
        if (!audio) {
            return;
        }

        try {
            audio.currentTime = 0;
            var promise = audio.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function() {});
            }
        } catch (e) {}
    }

    function playClick() {
        safePlay(clickSound);
    }

    function playBegin() {
        safePlay(beginSound);
    }

    function startBackground() {
        if (!backgroundSound) {
            return;
        }

        applyBackgroundVolume();

        try {
            var promise = backgroundSound.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function() {});
            }
        } catch (e) {}
    }

    function stopBackground() {
        if (!backgroundSound) {
            return;
        }

        try {
            backgroundSound.pause();
            backgroundSound.currentTime = 0;
        } catch (e) {}
    }

    function applyBackgroundVolume() {
        if (!backgroundSound) {
            return;
        }

        backgroundSound.volume = muted ? 0 : backgroundVolume;
    }

    function setBackgroundVolume(value) {
        value = parseFloat(value);

        if (isNaN(value)) {
            return;
        }

        backgroundVolume = Math.max(0, Math.min(1, value));
        muted = false;

        try {
            localStorage.setItem('im_background_volume', String(backgroundVolume));
            localStorage.setItem('im_background_muted', '0');
        } catch (e) {}

        applyBackgroundVolume();
        updateVolumeUI();
    }

    function toggleMute() {
        muted = !muted;

        try {
            localStorage.setItem('im_background_muted', muted ? '1' : '0');
        } catch (e) {}

        applyBackgroundVolume();
        updateVolumeUI();
    }

    function getVolume() {
        return backgroundVolume;
    }

    function isMuted() {
        return muted;
    }

    function updateVolumeUI() {
        var slider = document.getElementById('background-volume');
        var muteButton = document.getElementById('background-mute');

        if (slider) {
            slider.value = Math.round(backgroundVolume * 100);
        }

        if (muteButton) {
            muteButton.innerText = muted ? 'UNMUTE' : 'MUTE';
        }
    }

    return {
        init: init,
        playClick: playClick,
        playBegin: playBegin,
        startBackground: startBackground,
        stopBackground: stopBackground,
        setBackgroundVolume: setBackgroundVolume,
        toggleMute: toggleMute,
        getVolume: getVolume,
        isMuted: isMuted,
        updateVolumeUI: updateVolumeUI
    };
})();
