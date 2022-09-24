System.register([], function (exports_1, context_1) {
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
    var ToastMain, TotalToasts, allToasts, maxToasts, Toast;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            ToastMain = document.querySelector("div.toasts");
            TotalToasts = 0;
            allToasts = [];
            maxToasts = 5;
            Toast = class Toast {
                constructor(options) {
                    options = Object.assign({
                        title: "Tittle",
                        body: "Body",
                        actions: null,
                        data: {},
                    }, options);
                    const dom = this._create();
                    dom.f.setTitle(options.title);
                    dom.f.setBody(options.body);
                    if (options === null || options === void 0 ? void 0 : options.actions) {
                        for (const action of options.actions) {
                            dom.f.addAction(action);
                        }
                    }
                    else {
                        dom.f.addAction({
                            color: "danger",
                            html: "Close",
                            action: "close",
                            actionArgs: "@me",
                        });
                    }
                    this.dom = dom;
                    this.data = options.data;
                    this._init();
                    allToasts.push(this);
                    if (allToasts.length >= maxToasts) {
                        while (allToasts.length >= maxToasts)
                            allToasts.shift().close();
                    }
                }
                _init() {
                    var _a, _b, _c, _d;
                    const actions = [
                        ...this.dom.parts.actions.querySelectorAll('button[class*="action-"]'),
                    ];
                    for (const actionD of actions) {
                        const action = (_b = (_a = actionD.dataset.action) === null || _a === void 0 ? void 0 : _a.toLowerCase) === null || _b === void 0 ? void 0 : _b.call(_a);
                        const actionArgs = (_d = (_c = actionD.dataset.actionParams) === null || _c === void 0 ? void 0 : _c.split) === null || _d === void 0 ? void 0 : _d.call(_c, ",");
                        actionD.addEventListener("click", () => {
                            if (action === "close") {
                                if (actionArgs[0] === "@me") {
                                    this.close();
                                }
                            }
                            else if (action === "link") {
                                window.open(...actionArgs);
                            }
                        });
                    }
                }
                show(msToClose = 5000) {
                    ToastMain.append(this.dom.main);
                    if (msToClose >= 1) {
                        setTimeout(() => {
                            this.close();
                        }, msToClose);
                    }
                }
                close() {
                    this.dom.main.style.animationDuration = ".2s";
                    this.dom.main.style.animationName = "ToastOut";
                    this.dom.main.addEventListener("animationend", () => {
                        ToastMain.removeChild(this.dom.main);
                    });
                }
                _create(id = null) {
                    const main = document.createElement("div");
                    const header = document.createElement("div");
                    const body = document.createElement("div");
                    const actions = document.createElement("div");
                    main.className = "toast";
                    header.className = "toast-header";
                    body.className = "toast-body";
                    actions.className = "toast-actions";
                    main.append(header);
                    main.append(body);
                    main.append(actions);
                    main.dataset["toastId"] = id = id || "Toast-" + ++TotalToasts;
                    return {
                        main,
                        parts: { main, header, body, actions },
                        f: {
                            setTitle(newTitle) {
                                header.innerHTML = newTitle;
                            },
                            setBody(newBody) {
                                body.innerHTML = newBody;
                            },
                            addAction({ isOutline = false, color = "primary", action = null, actionArgs = [], html = "", } = {}) {
                                const button = document.createElement("button");
                                let g = "action-";
                                if (isOutline)
                                    g += "out-";
                                g += color;
                                button.className = g;
                                action =
                                    typeof action !== "function"
                                        ? action.toLowerCase()
                                        : action;
                                button.dataset.action = `${action}`;
                                if (action === "link") {
                                    button.title = "link: " + actionArgs;
                                }
                                if (typeof actionArgs === "string") {
                                    button.dataset.actionParams = actionArgs
                                        .replace(/^\s+/, "")
                                        .replace(/\s+$/, "");
                                }
                                else if (actionArgs instanceof Array) {
                                    button.dataset.actionParams = actionArgs.join(",");
                                }
                                else {
                                    button.dataset.actionParams = "";
                                }
                                const btn_append = (_html) => {
                                    if (typeof _html === "string") {
                                        button.innerHTML = _html;
                                    }
                                    else if (_html instanceof HTMLElement) {
                                        button.append(_html);
                                    }
                                    else if (_html instanceof Array) {
                                        for (const _htmlElement of _html)
                                            btn_append(_htmlElement);
                                    }
                                };
                                btn_append(html);
                                actions.append(button);
                                return button;
                            },
                        },
                    };
                }
                static all(callback) {
                    return __awaiter(this, void 0, void 0, function* () {
                        for (let _ of allToasts)
                            yield (callback === null || callback === void 0 ? void 0 : callback(_, [...allToasts]));
                    });
                }
            };
            window.addEventListener("resize", () => {
                const w = window.innerWidth;
                if (w <= 600) {
                    maxToasts = 3;
                }
                else {
                    maxToasts = 5;
                }
            });
            exports_1("default", Toast);
        }
    };
});
//# sourceMappingURL=toasts.js.map