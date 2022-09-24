System.register(["../../common/html.js"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var html_js_1, DefaultElementList_Options, Events, ElementList;
    var __moduleName = context_1 && context_1.id;
    function getFromProperty(obj, propStr) {
        const props = propStr.split(".");
        let last = obj;
        for (const prop of props) {
            if (typeof last === "undefined")
                throw new ReferenceError(`Property doesn't exists.`);
            last = last[prop];
        }
        return last;
    }
    return {
        setters: [
            function (html_js_1_1) {
                html_js_1 = html_js_1_1;
            }
        ],
        execute: function () {
            DefaultElementList_Options = {
                idTarget: "uuid",
            };
            (function (Events) {
                Events["Refresh"] = "refresh";
                Events["Render"] = "render";
                Events["TemplateClick"] = "template_click";
            })(Events || (Events = {}));
            ElementList = class ElementList {
                constructor(parent, url, options = DefaultElementList_Options) {
                    this.parent = parent;
                    this.url = url;
                    this.data = [];
                    this.cache = {};
                    this.template = null;
                    this.isLoading = false;
                    this._customFunctions = {};
                    this.Events = Events;
                    this._pipes = [];
                    this._onclickEvent = null;
                    this.orderByFunction = (a, b) => { return 0; };
                    this._execPipes = (method, ...args) => {
                        for (const pipe of this._pipes) {
                            pipe(method, ...args);
                        }
                    };
                    this._options = Object.assign({}, DefaultElementList_Options, options);
                }
                setOrderByFunction(fn) {
                    this.orderByFunction = fn;
                    return this;
                }
                setTemplate(template) {
                    if (typeof template === "string") {
                        const temp = document.createElement("div");
                        temp.innerHTML = template;
                        this.template = temp.firstElementChild;
                    }
                    else {
                        this.template = template.cloneNode(true);
                    }
                    return this;
                }
                getTemplate() {
                    return this.template;
                }
                getData() {
                    return this.data.slice(0);
                }
                getCache() {
                    return Object.assign({}, this.cache);
                }
                setCustomFunctions(fn) {
                    this._customFunctions = fn;
                    return this;
                }
                on(name, listener) {
                    return this;
                }
                setOnClick(listener) {
                    this._onclickEvent = listener;
                    return this;
                }
                _generateCtx(data, elm, template) {
                    return {
                        data,
                        template: template,
                        element: elm,
                        list: this,
                        parent: this.parent,
                        custom: this._customFunctions,
                        usePipe: this.__usePipe.bind(this),
                    };
                }
                _setEventsOnElement(elm, data) {
                    const selectedElements = html_js_1.queryAll("*[data-slot-events]", elm);
                    for (const element of selectedElements) {
                        const events = element.dataset.slotEvents.split(/\s*,\s*/);
                        element.removeAttribute("data-slot-events");
                        const ctx = this._generateCtx(data, element, elm);
                        for (const fn in ctx.custom) {
                            ctx.custom[fn] = ctx.custom[fn].bind(ctx);
                        }
                        for (const event of events) {
                            const fn_ = element.dataset[`on${event}`];
                            if (typeof fn_ === "string") {
                                element.removeAttribute(`data-on${event}`);
                                const fn = new Function(fn_).bind(ctx, ctx);
                                element.addEventListener(event, () => fn());
                            }
                        }
                    }
                    return elm;
                }
                _renderElement(data) {
                    if (this.template === null) {
                        throw new ReferenceError("`template` is not defined.");
                    }
                    const elm = this.template.cloneNode(true);
                    const _tmpParent = document.createElement("div");
                    _tmpParent.appendChild(elm);
                    const allElementsWithSlot = html_js_1.queryAll("*[slot]", _tmpParent);
                    for (const elmWithSlot of allElementsWithSlot) {
                        const slot = elmWithSlot.getAttribute("slot");
                        const hasSlotFormatter = elmWithSlot.hasAttribute("data-slot-formatter");
                        const slotFormatter = elmWithSlot.dataset.slotFormatter;
                        const hasSlotAttribute = elmWithSlot.hasAttribute("data-slot-attribute");
                        const slotAttribute = elmWithSlot.dataset.slotAttribute;
                        elmWithSlot.removeAttribute("slot");
                        if (hasSlotFormatter)
                            elmWithSlot.removeAttribute("data-slot-formatter");
                        if (hasSlotAttribute)
                            elmWithSlot.removeAttribute("data-slot-attribute");
                        const prop = getFromProperty(data, slot);
                        const formatted = hasSlotFormatter
                            ? this._customFunctions[slotFormatter](prop)
                            : prop;
                        if (hasSlotAttribute) {
                            elmWithSlot.setAttribute(slotAttribute, formatted);
                        }
                        else if (elmWithSlot instanceof HTMLInputElement) {
                            elmWithSlot.value = formatted;
                        }
                        else {
                            elmWithSlot.innerHTML = formatted;
                        }
                    }
                    this._setEventsOnElement(elm, data);
                    elm.addEventListener("click", () => {
                        if (this._onclickEvent !== null)
                            this._onclickEvent(this, elm, data);
                    });
                    return elm;
                }
                _render() {
                    if (this.template === null) {
                        throw new ReferenceError("`template` is not defined.");
                    }
                    const elms = [];
                    for (const oneData of this.data.sort(this.orderByFunction)) {
                        elms.push(this._renderElement(oneData));
                    }
                    return elms;
                }
                refresh() {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (this.isLoading)
                            return this.data;
                        this.isLoading = true;
                        this.parent.classList.remove("no-data");
                        this.parent.classList.add("loading");
                        this.parent.innerHTML = "Loading...";
                        yield this.refreshData();
                        const elements = this._render();
                        if (elements.length === 0) {
                            this.parent.innerHTML = "No data";
                            this.parent.classList.add("no-data");
                        }
                        else {
                            this.parent.innerHTML = "";
                            this.parent.append(...elements);
                        }
                        this.parent.classList.remove("loading");
                        this.isLoading = false;
                        return this.data;
                    });
                }
                refreshData() {
                    return __awaiter(this, void 0, void 0, function* () {
                        const response = yield fetch(this.url, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            cache: "no-cache",
                        });
                        if (!response.ok) {
                            alert(`Error fetching data to '${this.url}'.`);
                            return null;
                        }
                        const json = yield response.json();
                        this.data = json;
                        this.cache = this.data.reduce((prev, acc) => {
                            prev[acc[this._options.idTarget]] = acc;
                            return prev;
                        }, {});
                        return this.data;
                    });
                }
                __usePipe(method, ...args) {
                    if (!method.startsWith("custom:") && method.length < 8)
                        return;
                    this._execPipes(method, ...args);
                }
                clearPipes() {
                    this._pipes = [];
                }
                pipe(fn) {
                    this._pipes.push(fn);
                    return this;
                }
            };
            exports_1("ElementList", ElementList);
            ElementList.Events = Events;
            exports_1("default", ElementList);
        }
    };
});
//# sourceMappingURL=list.js.map