/* STORAGE MANAGER - ES5 COMPATIBLE */
var StorageManager = {
    files: {
        documents: [],
        photos: [],
        records: [],
        messages: [],
        trash: [],
        progress: {}
    },

    set: function(key, value) {
        this.files[key] = value;
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('game_' + key, JSON.stringify(value));
            } catch (e) {}
        }
    },

    get: function(key, defaultValue) {
        if (this.files[key] !== undefined) {
            return this.files[key];
        }

        if (typeof localStorage !== 'undefined') {
            var item = localStorage.getItem('game_' + key);
            if (item !== null) {
                try {
                    return JSON.parse(item);
                } catch (e) {
                    return item;
                }
            }
        }

        return defaultValue !== undefined ? defaultValue : null;
    },

    clearAll: function() {
        this.files = {
            documents: [],
            photos: [],
            records: [],
            messages: [],
            trash: [],
            progress: {}
        };

        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
        }
    },

    resetGame: function() {
        this.clearAll();
        window.location.reload();
    }
};
