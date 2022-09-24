System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function query(str, parent = document) {
        return parent.querySelector(str);
    }
    exports_1("query", query);
    function queryAll(str, parent = document) {
        return Array.from(parent.querySelectorAll(str));
    }
    exports_1("queryAll", queryAll);
    function createElement(tag) {
        return document.createElement(tag);
    }
    exports_1("createElement", createElement);
    function middlewareEvents(element) {
        const original_a = element.addEventListener;
        const original_r = element.removeEventListener;
        let eventNames = [];
        const events = {};
        element.addEventListener = function (...args) {
            const name = args[0];
            const listener = args[1];
            if (events[name] == null)
                events[name] = [];
            if (!events[name].includes(listener))
                events[name].push(listener);
            eventNames = Object.keys(events);
            original_a.call(element, ...args);
        };
        element.removeEventListener = function (...args) {
            const name = args[0];
            const listener = args[1];
            if (events[name] == null)
                events[name] = [];
            events[name].filter((_) => _ !== listener);
            if (events[name].length === 0)
                events[name] = undefined;
            eventNames = Object.keys(events);
            original_r.call(element, ...args);
        };
        return {
            removeAll() {
                for (const ev of eventNames)
                    for (const fn of events[ev]) {
                        element.removeEventListener(ev, fn);
                    }
            },
            add: element.addEventListener,
            rem: element.removeEventListener,
            get eventNames() {
                return eventNames.slice(0);
            },
            get events() {
                return events;
            },
        };
    }
    exports_1("middlewareEvents", middlewareEvents);
    function structureCopy(element) {
        const me = {
            dom: element,
            elm: element.nodeName.toLowerCase(),
            classes: element.classList,
            attrs: {},
            events: middlewareEvents(element),
            hasChilds: element.hasChildNodes(),
            childs: [],
            _: {},
            addChild() { },
        };
        me.setAttr = function (name, value = "true") {
            me.attrs[name] = value;
            me.dom.setAttribute(name, value);
            return me;
        };
        me.remAttr = function (name) {
            delete me.attrs[name];
            me.dom.removeAttribute(name);
            return me;
        };
        me.addChild = function (child) {
            if (child.nodeName === "#text") {
                throw new TypeError("Child is a text");
            }
            const tag = child.nodeName.toLowerCase();
            const name = child.dataset.name || null;
            const prop = name || tag;
            const sameTags = Object.keys(me._).filter((_) => _.match(new RegExp(`^${prop}\d*$`)) !== null);
            const structure = structureCopy(child);
            me._[prop + (sameTags.length || "")] = structure;
            me.childs.push(structure);
            me.dom.appendChild(structure.dom);
            return structure;
        };
        const attributeNames = element.getAttributeNames();
        for (const attr of attributeNames) {
            me.attrs[attr] = element.getAttribute(attr);
        }
        if (me.hasChilds) {
            const childs = Array.from(element.childNodes);
            for (const child of childs) {
                try {
                    me.addChild(child);
                }
                catch (_a) { }
            }
        }
        return me;
    }
    exports_1("structureCopy", structureCopy);
    function getElementFromString(str) {
        const element = document.createElement("div");
        element.innerHTML = str;
        return element.firstElementChild;
    }
    exports_1("getElementFromString", getElementFromString);
    function getElementFromJSON(json) {
        const element = createElement(json.elm);
        if (json.classes) {
            for (const cls of json.classes)
                if (cls !== "")
                    element.classList.add(cls);
        }
        if (json.attrs) {
            for (const attr in json.attrs)
                element.setAttribute(attr, json.attrs[attr]);
        }
        if (json.childs) {
            for (const child of json.childs) {
                if (typeof child === "string") {
                    element.appendChild(document.createTextNode(child));
                }
                else {
                    element.appendChild(getElementFromJSON(child).dom);
                }
            }
        }
        return structureCopy(element);
    }
    exports_1("getElementFromJSON", getElementFromJSON);
    function getAbsolutePosition(element) {
        const arr = [];
        let last = element;
        while (true) {
            console.log([last]);
            if (last == null)
                break;
            const pos = getTranslateValues(last);
            arr.push({
                x: last.offsetLeft + last.scrollLeft + pos.translate.x,
                y: last.offsetTop - last.scrollTop - pos.translate.y,
            });
            last = last.offsetParent;
        }
        return arr.reduce((prev, curr) => {
            return { x: prev.x + curr.x, y: prev.x + curr.y };
        }, { x: 0, y: 0 });
    }
    exports_1("getAbsolutePosition", getAbsolutePosition);
    function getTranslateValues(element) {
        const style = window.getComputedStyle(element);
        const matrix = style["transform"] || style.webkitTransform || style.mozTransform;
        if (matrix === "none" || typeof matrix === "undefined") {
            return {
                translate: { x: 0, y: 0, z: 0 },
                rotate: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 }
            };
        }
        const matrixType = matrix.includes("3d") ? "3d" : "2d";
        const matrixValues = matrix
            .match(/matrix.*\((.+)\)/)[1]
            .split(", ")
            .map(parseFloat);
        let translate = { x: 0, y: 0, z: 0 };
        if (matrixType === "2d") {
            translate = {
                x: matrixValues[4],
                y: matrixValues[5],
                z: 0,
            };
        }
        else if (matrixType === "3d") {
            translate = {
                x: matrixValues[12],
                y: matrixValues[13],
                z: matrixValues[14],
            };
        }
        let rotate = { x: 0, y: 0, z: 0 };
        if (matrixType === "2d") {
            rotate = {
                x: matrixValues[1],
                y: matrixValues[2],
                z: 0,
            };
        }
        else if (matrixType === "3d") {
            rotate = {
                x: matrixValues[4],
                y: matrixValues[5],
                z: matrixValues[6],
            };
        }
        let scale = { x: 0, y: 0, z: 0 };
        if (matrixType === "2d") {
            scale = {
                x: matrixValues[0],
                y: matrixValues[3],
                z: 0,
            };
        }
        else if (matrixType === "3d") {
            scale = {
                x: matrixValues[0],
                y: matrixValues[5],
                z: matrixValues[10],
            };
        }
        return {
            translate,
            rotate,
            scale,
        };
    }
    exports_1("getTranslateValues", getTranslateValues);
    return {
        setters: [],
        execute: function () {
        }
    };
});
//# sourceMappingURL=html.js.map