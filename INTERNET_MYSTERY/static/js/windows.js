/* WINDOW MANAGER ENGINE - ES5 STYLE */
var WindowManager = (function() {
    var windows = {};
    var topZIndex = 100;
    var container = null;
    var taskbarContainer = null;

    function countWindows() {
        var count = 0;
        var id;
        for (id in windows) {
            if (windows.hasOwnProperty(id)) {
                count++;
            }
        }
        return count;
    }

    function init() {
        container = document.getElementById('windows-container');
        taskbarContainer = document.getElementById('taskbar-apps');
    }

    function createWindow(appId, title, contentHtml, width, height) {
        if (!container) {
            init();
        }

        if (windows[appId]) {
            focusWindow(appId);
            return;
        }

        width = width || 500;
        height = height || 350;

        var offset = countWindows() * 20;
        var left = Math.max(20, (window.innerWidth - width) / 2 + offset);
        var top = Math.max(20, (window.innerHeight - height - 40) / 2 + offset);

        var win = document.createElement('div');
        win.className = 'window focused';
        win.id = 'win-' + appId;
        win.style.width = width + 'px';
        win.style.height = height + 'px';
        win.style.left = left + 'px';
        win.style.top = top + 'px';
        win.style.zIndex = ++topZIndex;

        win.innerHTML =
            '<div class="window-header">' +
                '<span class="window-title">' + title + '</span>' +
                '<div class="window-controls">' +
                    '<button class="win-btn min" onclick="WindowManager.minimizeWindow(\'' + appId + '\')">_</button>' +
                    '<button class="win-btn max" onclick="WindowManager.maximizeWindow(\'' + appId + '\')">□</button>' +
                    '<button class="win-btn close" onclick="WindowManager.closeWindow(\'' + appId + '\')">X</button>' +
                '</div>' +
            '</div>' +
            '<div class="window-body">' + contentHtml + '</div>';

        container.appendChild(win);

        windows[appId] = {
            element: win,
            title: title,
            isMaximized: false,
            isMinimized: false,
            prevBounds: {
                left: left,
                top: top,
                width: width,
                height: height
            }
        };

        makeDraggable(win, win.querySelector('.window-header'));

        win.addEventListener('mousedown', function() {
            focusWindow(appId);
        });

        addTaskbarItem(appId, title);
        focusWindow(appId);
    }

    function focusWindow(appId) {
        var id;

        if (!windows[appId]) {
            return;
        }

        for (id in windows) {
            if (windows.hasOwnProperty(id)) {
                windows[id].element.classList.remove('focused');
                var tb = document.getElementById('tb-' + id);
                if (tb) {
                    tb.classList.remove('active');
                }
            }
        }

        var target = windows[appId];
        target.element.style.display = 'flex';
        target.element.classList.add('focused');
        target.element.style.zIndex = ++topZIndex;
        target.isMinimized = false;

        var taskItem = document.getElementById('tb-' + appId);
        if (taskItem) {
            taskItem.classList.add('active');
        }
    }

    function closeWindow(appId) {
        if (!windows[appId]) {
            return;
        }

        if (windows[appId].element.parentNode) {
            windows[appId].element.parentNode.removeChild(windows[appId].element);
        }

        delete windows[appId];
        removeTaskbarItem(appId);
    }

    function minimizeWindow(appId) {
        if (!windows[appId]) {
            return;
        }

        windows[appId].element.style.display = 'none';
        windows[appId].isMinimized = true;

        var taskItem = document.getElementById('tb-' + appId);
        if (taskItem) {
            taskItem.classList.remove('active');
        }
    }

    function maximizeWindow(appId) {
        var w = windows[appId];

        if (!w) {
            return;
        }

        if (w.isMaximized) {
            w.element.style.left = w.prevBounds.left + 'px';
            w.element.style.top = w.prevBounds.top + 'px';
            w.element.style.width = w.prevBounds.width + 'px';
            w.element.style.height = w.prevBounds.height + 'px';
            w.isMaximized = false;
        } else {
            w.prevBounds = {
                left: parseInt(w.element.style.left, 10),
                top: parseInt(w.element.style.top, 10),
                width: parseInt(w.element.style.width, 10),
                height: parseInt(w.element.style.height, 10)
            };

            w.element.style.left = '0px';
            w.element.style.top = '0px';
            w.element.style.width = '100%';
            w.element.style.height = (window.innerHeight - 36) + 'px';
            w.isMaximized = true;
        }
    }

    function addTaskbarItem(appId, title) {
        if (!taskbarContainer) {
            return;
        }

        var item = document.createElement('div');
        item.className = 'taskbar-item';
        item.id = 'tb-' + appId;
        item.innerText = title;

        item.onclick = function() {
            if (!windows[appId]) {
                return;
            }

            if (windows[appId].isMinimized || !windows[appId].element.classList.contains('focused')) {
                focusWindow(appId);
            } else {
                minimizeWindow(appId);
            }
        };

        taskbarContainer.appendChild(item);
    }

    function removeTaskbarItem(appId) {
        var item = document.getElementById('tb-' + appId);
        if (item && item.parentNode) {
            item.parentNode.removeChild(item);
        }
    }

    function closeAll() {
        var ids = [];
        var id;

        for (id in windows) {
            if (windows.hasOwnProperty(id)) {
                ids.push(id);
            }
        }

        for (var i = 0; i < ids.length; i++) {
            closeWindow(ids[i]);
        }
    }

    function makeDraggable(winEl, headerEl) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        headerEl.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();

            pos3 = e.clientX;
            pos4 = e.clientY;

            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();

            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            winEl.style.top = (winEl.offsetTop - pos2) + 'px';
            winEl.style.left = (winEl.offsetLeft - pos1) + 'px';
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    return {
        init: init,
        createWindow: createWindow,
        closeWindow: closeWindow,
        closeAll: closeAll,
        minimizeWindow: minimizeWindow,
        maximizeWindow: maximizeWindow,
        focusWindow: focusWindow
    };
})();
