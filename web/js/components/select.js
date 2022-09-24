System.register([], function (exports_1, context_1) {
    "use strict";
    var Select;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            Select = class Select {
                constructor(options) {
                    var _a;
                    this.element = options.dom;
                    this.setOptions(options.options);
                    this.select((_a = options.selected) !== null && _a !== void 0 ? _a : 0);
                    this.addEventListener = options.dom.addEventListener.bind(options.dom);
                    this.removeEventListener = options.dom.removeEventListener.bind(options.dom);
                }
                addEventListener(type, listener) { }
                removeEventListener(type, listener) { }
                select(id) {
                    if (this.options.length === 0)
                        return;
                    if (typeof id === "number") {
                        this.element.selectedIndex = id;
                    }
                    else {
                        let i = 0;
                        this.options.find((option, _i) => {
                            const is = typeof option === "string" ?
                                option === id :
                                option[1] === id;
                            if (is)
                                i = _i;
                            return is;
                        });
                        console.log(i);
                        this.element.selectedIndex = i;
                    }
                }
                setOptions(options) {
                    this.element.innerHTML = "";
                    this.options = options;
                    for (const option of options) {
                        const dom = document.createElement("option");
                        if (typeof option === "string") {
                            dom.innerHTML = option;
                            dom.value = option;
                        }
                        else {
                            dom.innerHTML = option[0];
                            dom.value = option[1];
                        }
                        this.element.append(dom);
                    }
                }
                get selectedIndex() {
                    return this.element.selectedIndex;
                }
                get selectedValue() {
                    const t = this.options[this.selectedIndex];
                    return typeof t === "string" ? t : t[1];
                }
            };
            exports_1("default", Select);
        }
    };
});
//# sourceMappingURL=select.js.map