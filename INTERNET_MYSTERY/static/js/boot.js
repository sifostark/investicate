/* BOOT SEQUENCE */
var BootController = (function() {
    var mainLogs = [
        "INITIALIZING...",
        "LOADING ENVIRONMENT...",
        "CHECKING FILE SYSTEM...",
        "LOADING USER PROFILE...",
        "MOUNTING APPLICATIONS...",
        "LOADING CASE DATABASE...",
        "SYSTEM READY."
    ];

    function run(mode) {
        var logs = mainLogs;

        if (mode === 'case') {
            logs = [
                "CASE VOLUME DETECTED...",
                "VERIFYING CASE MANIFEST...",
                "MOUNTING EVIDENCE VOLUME...",
                "RESTORING ARCHIVE MATERIAL...",
                "LOADING COMMUNICATIONS...",
                "LOADING MEDIA...",
                "CASE ENVIRONMENT READY."
            ];
        }

        var logContainer = document.getElementById('boot-log');
        if (!logContainer) {
            return;
        }

        logContainer.innerHTML = '';

        var index = 0;

        function printNextLine() {
            if (index < logs.length) {
                var line = document.createElement('div');
                line.className = 'boot-line';
                line.innerText = logs[index];
                logContainer.appendChild(line);
                index++;

                setTimeout(printNextLine, 280 + Math.floor(Math.random() * 160));
            } else {
                setTimeout(function() {
                    AppManager.switchScreen('desktop-screen');
                    AudioManager.startBackground();

                    if (mode === 'case') {
                        DesktopController.enterCaseEnvironment();
                    } else {
                        DesktopController.init();
                    }
                }, 500);
            }
        }

        printNextLine();
    }

    return {
        run: run
    };
})();
