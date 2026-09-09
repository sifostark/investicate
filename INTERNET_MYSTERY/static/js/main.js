/* APPLICATION BOOTSTRAP */
var AppManager = (function() {
    function switchScreen(id) {
        var screens = document.querySelectorAll('.screen');

        for (var i = 0; i < screens.length; i++) {
            screens[i].classList.remove('active');
        }

        var target = document.getElementById(id);
        if (target) {
            target.classList.add('active');
        }
    }

    return {
        switchScreen: switchScreen
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    IntroController.start();
    AudioManager.init();
});
