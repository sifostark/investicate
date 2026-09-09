/* DESKTOP WORKSPACE AND APPLICATIONS - ES5 */
var DesktopController = (function() {
    var currentCaseId = null;
    var caseData = null;
    var caseCharacters = [];
    var caseEvidence = [];
    var caseManifest = null;

    function init() {
        currentCaseId = null;
        caseData = null;
        caseCharacters = [];
        caseEvidence = [];
        caseManifest = null;

        WindowManager.init();
        setDesktopStatus('SYSTEM // MAIN ENVIRONMENT');
        setCaseWallpaper(false);
        setupIcons();
        setupAudioControls();
        startClock();
    }

    function setupIcons() {
        var icons = document.querySelectorAll('.desktop-icon');

        for (var i = 0; i < icons.length; i++) {
            icons[i].onclick = null;
            icons[i].addEventListener('click', function() {
                AudioManager.playClick();
                launchApp(this.getAttribute('data-app'));
            });
        }
    }

    function setupAudioControls() {
        var slider = document.getElementById('background-volume');
        var muteButton = document.getElementById('background-mute');

        if (slider) {
            slider.value = Math.round(AudioManager.getVolume() * 100);
            slider.oninput = function() {
                AudioManager.setBackgroundVolume(this.value / 100);
            };
        }

        if (muteButton) {
            muteButton.onclick = function() {
                AudioManager.toggleMute();
            };
        }

        AudioManager.updateVolumeUI();
    }

    function startClock() {
        var clock = document.getElementById('system-clock');

        function pad(number) {
            return number < 10 ? '0' + number : '' + number;
        }

        function update() {
            if (!clock) {
                return;
            }

            var now = new Date();
            clock.innerText = pad(now.getHours()) + ':' + pad(now.getMinutes());
        }

        update();
        setInterval(update, 1000);
    }

    function setDesktopStatus(text) {
        var status = document.getElementById('desktop-status');
        if (status) {
            status.innerText = text;
        }
    }

    function setCaseWallpaper(active) {
        var wallpaper = document.querySelector('.desktop-wallpaper');

        if (!wallpaper) {
            return;
        }

        if (active) {
            wallpaper.className = 'desktop-wallpaper case001-wallpaper';
        } else {
            wallpaper.className = 'desktop-wallpaper';
        }
    }

    function launchApp(appId) {
        if (appId === 'cases') {
            openCases();
            return;
        }

        if (!currentCaseId) {
            openMainApp(appId);
        } else {
            openCaseApp(appId);
        }
    }

    function openCases() {
        var html =
            '<div class="app-section">' +
                '<div class="app-title">CASE DATABASE</div>' +
                '<div id="case-list">Loading case database...</div>' +
            '</div>';

        WindowManager.createWindow('cases', 'CASES // DATABASE', html, 650, 430);

        loadCases();
    }

    function loadCases() {
        fetch('/api/cases')
            .then(function(response) { return response.json(); })
            .then(function(cases) {
                var container = document.getElementById('case-list');

                if (!container) {
                    return;
                }

                if (!cases.length) {
                    container.innerHTML = '<div class="empty-state">NO CASES FOUND.</div>';
                    return;
                }

                var html = '';

                for (var i = 0; i < cases.length; i++) {
                    var c = cases[i];

                    html +=
                        '<div class="case-row">' +
                            '<div>' +
                                '<strong>' + escapeHtml(c.title) + '</strong>' +
                                '<div class="case-desc">' + escapeHtml(c.description) + '</div>' +
                            '</div>' +
                            '<div>' +
                                '<span class="case-status">' + escapeHtml(c.status) + '</span>' +
                                (c.status === 'UNLOCKED'
                                    ? '<button class="retro-small" onclick="DesktopController.openCase(\'' + c.id + '\')">OPEN</button>'
                                    : '<button class="retro-small disabled" disabled>LOCKED</button>') +
                            '</div>' +
                        '</div>';
                }

                container.innerHTML = html;
            })
            .catch(function() {
                var container = document.getElementById('case-list');
                if (container) {
                    container.innerHTML = '<div class="error-state">CASE DATABASE OFFLINE.</div>';
                }
            });
    }

    function openCase(caseId) {
        WindowManager.closeWindow('cases');
        AppManager.switchScreen('boot-screen');
        BootController.run('case');

        loadCaseData(caseId);
    }

    function loadCaseData(caseId) {
        Promise.all([
            fetch('/api/cases/' + caseId + '/case').then(function(r) { return r.json(); }),
            fetch('/api/cases/' + caseId + '/characters').then(function(r) { return r.json(); }),
            fetch('/api/cases/' + caseId + '/evidence').then(function(r) { return r.json(); }),
            fetch('/api/cases/' + caseId + '/manifest').then(function(r) { return r.json(); })
        ]).then(function(data) {
            currentCaseId = caseId;
            caseData = data[0];
            caseCharacters = data[1];
            caseEvidence = data[2];
            caseManifest = data[3];

            StorageManager.set('current_case', caseId);
            StorageManager.set('case_' + caseId + '_opened', true);
        }).catch(function() {
            currentCaseId = caseId;
            caseData = { id: caseId, title: caseId };
            caseCharacters = [];
            caseEvidence = [];
            caseManifest = {};
        });
    }

    function enterCaseEnvironment() {
        WindowManager.closeAll();
        setDesktopStatus((caseData ? caseData.title : 'CASE ENVIRONMENT') + ' // ACTIVE');
        setCaseWallpaper(true);
        setupIcons();
    }

    function returnToMainDesktop() {
        currentCaseId = null;
        caseData = null;
        caseCharacters = [];
        caseEvidence = [];
        caseManifest = null;

        WindowManager.closeAll();
        setDesktopStatus('SYSTEM // MAIN ENVIRONMENT');
        setCaseWallpaper(false);
        setupIcons();
    }

    function openMainApp(appId) {
        if (appId === 'terminal') {
            openTerminal(false);
        } else if (appId === 'documents') {
            openDocuments(false);
        } else if (appId === 'photos') {
            openPhotos(false);
        } else if (appId === 'audio') {
            openAudio(false);
        } else if (appId === 'browser') {
            openBrowser(false);
        } else if (appId === 'messages') {
            openMessages(false);
        } else if (appId === 'notes') {
            openNotes();
        } else if (appId === 'trash') {
            openTrash(false);
        }
    }

    function openCaseApp(appId) {
        if (appId === 'terminal') {
            openTerminal(true);
        } else if (appId === 'documents') {
            openDocuments(true);
        } else if (appId === 'photos') {
            openPhotos(true);
        } else if (appId === 'audio') {
            openAudio(true);
        } else if (appId === 'browser') {
            openBrowser(true);
        } else if (appId === 'messages') {
            openMessages(true);
        } else if (appId === 'notes') {
            openNotes();
        } else if (appId === 'trash') {
            openTrash(true);
        }
    }

    function getEvidence(appId) {
        var result = [];

        for (var i = 0; i < caseEvidence.length; i++) {
            if (caseEvidence[i].app === appId) {
                result.push(caseEvidence[i]);
            }
        }

        return result;
    }

    function openDocuments(inCase) {
        if (!inCase) {
            WindowManager.createWindow(
                'documents',
                'DOCUMENTS',
                '<div class="empty-state">NO INVESTIGATION FILES MOUNTED.<br><br>Open a case from CASES to mount its evidence.</div>',
                600, 400
            );
            return;
        }

        var docs = getEvidence('documents');
        var html = '<div class="file-list">';

        for (var i = 0; i < docs.length; i++) {
            html +=
                '<div class="file-row" onclick="DesktopController.viewEvidence(\'' + docs[i].id + '\')">' +
                    '<span>📄</span>' +
                    '<span>' + escapeHtml(docs[i].title) + '</span>' +
                '</div>';
        }

        html += '</div>';

        WindowManager.createWindow('documents', 'DOCUMENTS // CASE FILES', html, 650, 450);
    }

    function openPhotos(inCase) {
        if (!inCase) {
            WindowManager.createWindow(
                'photos',
                'PHOTOS',
                '<div class="empty-state">NO INVESTIGATION MEDIA MOUNTED.</div>',
                600, 400
            );
            return;
        }

        var photos = getEvidence('photos');
        var html = '<div class="photo-list">';

        for (var i = 0; i < photos.length; i++) {
            html +=
                '<div class="photo-card" onclick="DesktopController.viewEvidence(\'' + photos[i].id + '\')">' +
                    '<div class="photo-placeholder">IMAGE</div>' +
                    '<div>' + escapeHtml(photos[i].title) + '</div>' +
                '</div>';
        }

        html += '</div>';

        WindowManager.createWindow('photos', 'PHOTOS // EVIDENCE', html, 700, 470);
    }

    function openAudio(inCase) {
        if (!inCase) {
            WindowManager.createWindow(
                'audio',
                'AUDIO',
                '<div class="empty-state">NO RECORDINGS MOUNTED.</div>',
                600, 350
            );
            return;
        }

        var records = getEvidence('audio');
        var html = '<div class="file-list">';

        for (var i = 0; i < records.length; i++) {
            html +=
                '<div class="audio-card">' +
                    '<strong>' + escapeHtml(records[i].title) + '</strong>' +
                    '<div class="muted">Recovered timestamp: ' + escapeHtml(records[i].recorded_time || 'UNKNOWN') + '</div>' +
                    '<audio controls preload="none" src="' + escapeHtml(records[i].src) + '"></audio>' +
                    '<p>' + escapeHtml(records[i].caption || '') + '</p>' +
                '</div>';
        }

        html += '</div>';

        WindowManager.createWindow('audio', 'AUDIO // RECORDINGS', html, 650, 430);
    }

    function openMessages(inCase) {
        if (!inCase) {
            WindowManager.createWindow(
                'messages',
                'MESSAGES',
                '<div class="empty-state">NO INVESTIGATION MESSAGES MOUNTED.</div>',
                600, 400
            );
            return;
        }

        var threads = getEvidence('messages');
        var html = '<div class="message-thread">';

        for (var i = 0; i < threads.length; i++) {
            var msgs = threads[i].messages || [];

            for (var j = 0; j < msgs.length; j++) {
                html +=
                    '<div class="message">' +
                        '<div class="message-head">' +
                            '<strong>' + escapeHtml(msgs[j].from) + '</strong>' +
                            '<span>' + escapeHtml(msgs[j].time) + '</span>' +
                        '</div>' +
                        '<div>' + escapeHtml(msgs[j].text) + '</div>' +
                    '</div>';
            }
        }

        html += '</div>';

        WindowManager.createWindow('messages', 'MESSAGES // NIGHT SHIFT', html, 650, 440);
    }

    function openBrowser(inCase) {
        if (!inCase) {
            WindowManager.createWindow(
                'browser',
                'BROWSER',
                '<div class="browser-page"><h3>INTERNAL NETWORK</h3><p>MAIN NODE ONLINE.</p><p>No external internet connection is required for the investigation.</p></div>',
                650, 420
            );
            return;
        }

        var items = getEvidence('browser');
        var html = '<div class="browser-page">';

        for (var i = 0; i < items.length; i++) {
            html += '<h3>' + escapeHtml(items[i].title) + '</h3><pre>' + escapeHtml(items[i].content) + '</pre>';
        }

        html += '</div>';

        WindowManager.createWindow('browser', 'BROWSER // INTERNAL ARCHIVE', html, 700, 450);
    }

    function openTrash(inCase) {
        if (!inCase) {
            WindowManager.createWindow(
                'trash',
                'TRASH',
                '<div class="empty-state">TRASH IS EMPTY.</div>',
                550, 350
            );
            return;
        }

        var items = getEvidence('trash');
        var html = '<div class="file-list">';

        for (var i = 0; i < items.length; i++) {
            html +=
                '<div class="file-row" onclick="DesktopController.viewEvidence(\'' + items[i].id + '\')">' +
                    '<span>🗑️</span>' +
                    '<span>' + escapeHtml(items[i].title) + '</span>' +
                '</div>';
        }

        html += '</div>';

        WindowManager.createWindow('trash', 'TRASH // RECOVERED', html, 600, 380);
    }

    function openTerminal() {
        var html =
            '<div class="terminal-app">' +
                '<div id="terminal-output" class="terminal-output">' +
                    'INTERNET MYSTERY TERMINAL v1.0<br>' +
                    'Type "help" for available commands.<br><br>' +
                '</div>' +
                '<div class="terminal-line">' +
                    '<span>&gt;</span>' +
                    '<input id="terminal-input" type="text" autocomplete="off">' +
                '</div>' +
            '</div>';

        WindowManager.createWindow('terminal', 'TERMINAL', html, 700, 450);

        setTimeout(function() {
            var input = document.getElementById('terminal-input');

            if (!input) {
                return;
            }

            input.focus();

            input.onkeydown = function(e) {
                e = e || window.event;

                if (e.keyCode === 13) {
                    executeTerminal(this.value);
                    this.value = '';
                }
            };
        }, 50);
    }

    function executeTerminal(command) {
        var input = (command || '').replace(/^\s+|\s+$/g, '');
        var output = document.getElementById('terminal-output');

        if (!output) {
            return;
        }

        var safeCommand = escapeHtml(input);
        var result = '';

        if (input === 'help') {
            result =
                'help - show commands<br>' +
                'clear - clear terminal<br>' +
                'date - system date<br>' +
                'time - system time<br>' +
                'status - environment status<br>' +
                'about - system information';

            if (currentCaseId) {
                result += '<br>cat .sys_network.log - read hidden case log';
            }
        } else if (input === 'clear') {
            output.innerHTML = '';
            return;
        } else if (input === 'date') {
            result = new Date().toDateString();
        } else if (input === 'time') {
            result = new Date().toTimeString();
        } else if (input === 'status') {
            result = currentCaseId ? 'CASE ENVIRONMENT: ' + escapeHtml(currentCaseId) : 'MAIN ENVIRONMENT';
        } else if (input === 'about') {
            result = 'INTERNET MYSTERY // LOCAL INVESTIGATION SYSTEM';
        } else if (input === 'cat .sys_network.log' && currentCaseId) {
            var hidden = findEvidence('EV-09');

            if (hidden) {
                markEvidenceFound('EV-09');

                result =
                    '<span class="terminal-secret">' +
                    escapeHtml(hidden.content).replace(/\n/g, '<br>') +
                    '</span>';
            } else {
                result = 'cat: .sys_network.log: file not found';
            }
        } else {
            result = 'COMMAND NOT FOUND: ' + safeCommand;
        }

        output.innerHTML += '<div>&gt; ' + safeCommand + '</div>';
        output.innerHTML += '<div>' + result + '</div><br>';

        if (input === 'cat .sys_network.log') {
            checkCaseProgress();
        }
    }

    function openNotes() {
        var saved = StorageManager.get('notes', '');

        var html =
            '<div class="notes-app">' +
                '<div class="muted">Your notes are saved locally.</div>' +
                '<textarea id="case-notes">' + escapeHtml(saved) + '</textarea>' +
                '<button class="retro-small" onclick="DesktopController.saveNotes()">SAVE NOTES</button>' +
            '</div>';

        WindowManager.createWindow('notes', 'NOTES // INVESTIGATOR', html, 600, 430);
    }

    function saveNotes() {
        var notes = document.getElementById('case-notes');

        if (notes) {
            StorageManager.set('notes', notes.value);
        }
    }

    function viewEvidence(id) {
        var ev = findEvidence(id);

        if (!ev) {
            return;
        }

        markEvidenceFound(id);

        var html = '<div class="evidence-viewer">';

        if (ev.type === 'image') {
            html +=
                '<img class="evidence-image" src="' + escapeHtml(ev.src) + '" alt="' + escapeHtml(ev.title) + '">' +
                '<p>' + escapeHtml(ev.caption || '') + '</p>';
        } else if (ev.type === 'hex') {
            html +=
                '<h3>' + escapeHtml(ev.title) + '</h3>' +
                '<pre class="hex-block">' + escapeHtml(ev.content) + '</pre>' +
                '<p class="muted">This file may contain an encoded instruction.</p>' +
                '<button class="retro-small" onclick="DesktopController.decodeHex()">DECODE ASCII</button>' +
                '<div id="hex-result"></div>';
        } else {
            html +=
                '<h3>' + escapeHtml(ev.title) + '</h3>' +
                '<pre>' + escapeHtml(ev.content || '') + '</pre>';
        }

        html += '</div>';

        WindowManager.createWindow('evidence-' + id, 'EVIDENCE // ' + ev.title, html, 700, 480);
    }

    function decodeHex() {
        var ev = findEvidence('EV-03');
        var result = document.getElementById('hex-result');

        if (ev && result) {
            markEvidenceFound('EV-03');
            result.innerHTML =
                '<div class="decode-result">ASCII RESULT:<br><strong>' +
                escapeHtml(ev.decoded) +
                '</strong></div>';
        }

        checkCaseProgress();
    }

    function findEvidence(id) {
        for (var i = 0; i < caseEvidence.length; i++) {
            if (caseEvidence[i].id === id) {
                return caseEvidence[i];
            }
        }

        return null;
    }

    function markEvidenceFound(id) {
        var found = StorageManager.get('found_' + (currentCaseId || 'main'), []);

        if (found.indexOf(id) === -1) {
            found.push(id);
            StorageManager.set('found_' + (currentCaseId || 'main'), found);
        }
    }

    function checkCaseProgress() {
        if (!currentCaseId) {
            return;
        }

        var found = StorageManager.get('found_' + currentCaseId, []);

        if (found.indexOf('EV-09') !== -1) {
            showConclusionButton();
        }
    }

    function showConclusionButton() {
        var existing = document.getElementById('conclusion-button');

        if (existing) {
            return;
        }

        var btn = document.createElement('button');
        btn.id = 'conclusion-button';
        btn.className = 'floating-conclusion';
        btn.innerText = 'SUBMIT CONCLUSION';
        btn.onclick = openConclusion;
        document.getElementById('desktop-screen').appendChild(btn);
    }

    function openConclusion() {
        var found = StorageManager.get('found_' + currentCaseId, []);

        var html =
            '<div class="conclusion-app">' +
                '<h3>CASE CONCLUSION</h3>' +
                '<p>Select the person responsible.</p>' +
                '<label><input type="radio" name="culprit" value="Alex Mercer"> Alex Mercer</label><br>' +
                '<label><input type="radio" name="culprit" value="Nora Vale"> Nora Vale</label><br>' +
                '<label><input type="radio" name="culprit" value="Daniel Cross"> Daniel Cross</label>' +
                '<hr>' +
                '<p>Select the evidence you believe establishes the conclusion:</p>' +
                '<label><input type="checkbox" class="evidence-check" value="EV-01"> EV-01 — sign-out time</label><br>' +
                '<label><input type="checkbox" class="evidence-check" value="EV-03"> EV-03 — Hex artifact</label><br>' +
                '<label><input type="checkbox" class="evidence-check" value="EV-09"> EV-09 — hidden network log</label><br><br>' +
                '<button class="retro-small" onclick="DesktopController.submitConclusion()">SUBMIT</button>' +
                '<div id="conclusion-result"></div>' +
                '<div class="muted">Evidence discovered so far: ' + found.length + '</div>' +
            '</div>';

        WindowManager.createWindow('conclusion', 'CASE 001 // CONCLUSION', html, 650, 500);
    }

    function submitConclusion() {
        var radios = document.getElementsByName('culprit');
        var culprit = '';

        for (var i = 0; i < radios.length; i++) {
            if (radios[i].checked) {
                culprit = radios[i].value;
                break;
            }
        }

        var checks = document.querySelectorAll('.evidence-check');
        var evidenceIds = [];

        for (var j = 0; j < checks.length; j++) {
            if (checks[j].checked) {
                evidenceIds.push(checks[j].value);
            }
        }

        fetch('/api/cases/' + currentCaseId + '/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                culprit: culprit,
                evidence_ids: evidenceIds
            })
        })
        .then(function(response) { return response.json(); })
        .then(function(result) {
            var target = document.getElementById('conclusion-result');

            if (!target) {
                return;
            }

            if (result.correct) {
                target.innerHTML = '<div class="success-state">' + escapeHtml(result.message) + '<br>CASE 001 SOLVED.</div>';
                StorageManager.set('case_' + currentCaseId + '_solved', true);
            } else {
                target.innerHTML = '<div class="error-state">' + escapeHtml(result.message) + '</div>';
            }
        })
        .catch(function() {
            var target = document.getElementById('conclusion-result');

            if (target) {
                target.innerHTML = '<div class="error-state">SUBMISSION ERROR.</div>';
            }
        });
    }

    function escapeHtml(text) {
        text = String(text === undefined || text === null ? '' : text);

        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    return {
        init: init,
        openCase: openCase,
        enterCaseEnvironment: enterCaseEnvironment,
        returnToMainDesktop: returnToMainDesktop,
        viewEvidence: viewEvidence,
        decodeHex: decodeHex,
        saveNotes: saveNotes,
        submitConclusion: submitConclusion
    };
})();
