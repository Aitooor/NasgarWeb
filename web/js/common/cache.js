System.register([], function (exports_1, context_1) {
    "use strict";
    var custom_cached;
    var __moduleName = context_1 && context_1.id;
    function setCache(name, obj) {
        return custom_cached[name] = obj;
    }
    exports_1("setCache", setCache);
    function getCache(name, _default) {
        if (custom_cached[name])
            return custom_cached[name];
        return custom_cached[name] = _default;
    }
    exports_1("getCache", getCache);
    return {
        setters: [],
        execute: function () {
            if (!window.custom_cached)
                window.custom_cached = {};
            custom_cached = window.custom_cached;
        }
    };
});
//# sourceMappingURL=cache.js.map