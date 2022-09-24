System.register(["../components/toasts.js", "./nav.js"], function (exports_1, context_1) {
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
    var toasts_js_1, openOrg;
    var __moduleName = context_1 && context_1.id;
    function copyText(txt, { silent = false } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let copied = false;
            if (window.copy) {
                window.copy(txt);
                copied = true;
            }
            else if (!navigator.clipboard) {
                var textArea = document.createElement("textarea");
                textArea.value = txt;
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.position = "fixed";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    var successful = document.execCommand("copy");
                    var msg = successful ? "successful" : "unsuccessful";
                    copied = true;
                }
                catch (err) {
                    console.error("Fallback error copying: ", err);
                }
                document.body.removeChild(textArea);
            }
            else {
                try {
                    yield navigator.clipboard.writeText(txt);
                    copied = true;
                }
                catch (err) {
                    console.log("Error copying: ", err);
                }
            }
            if (!silent && copied) {
                yield toasts_js_1.default.all((toast) => __awaiter(this, void 0, void 0, function* () {
                    if (toast.data.fired === "copy")
                        return yield toast.close();
                    return;
                }));
                new toasts_js_1.default({
                    title: "Copied to clipboard",
                    body: "Text copied: <i> " + txt + " </i>",
                    data: {
                        fired: "copy",
                    },
                }).show();
            }
        });
    }
    function antiSpacesSplit(str, separator, limit) {
        return str.split(separator, limit).map((s) => {
            return s.replace("^s+|s+$", "");
        });
    }
    return {
        setters: [
            function (toasts_js_1_1) {
                toasts_js_1 = toasts_js_1_1;
            },
            function (_1) {
            }
        ],
        execute: function () {
            globalThis.Toasts = toasts_js_1.default;
            document.querySelectorAll("[data-commons-onclick]").forEach((_elm) => __awaiter(void 0, void 0, void 0, function* () {
                const elm = _elm;
                elm.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
                    const dataAttr = elm.dataset.commonsOnclick;
                    const dataParts = antiSpacesSplit(dataAttr, ",");
                    if (dataParts[0] === "copy") {
                        yield copyText(dataParts[1]);
                    }
                    else if (dataParts[0] === "link") {
                        window.open(dataParts[1], dataParts[2] || "_self");
                    }
                }));
            }));
            if ("serviceWorker" in navigator) {
                navigator.serviceWorker.register("/sw.js");
            }
            globalThis.copyText = copyText;
            globalThis.copyToClipboard = copyText;
            openOrg = window.open;
            globalThis.open = function (url, target = "_self") {
                return openOrg(url, target);
            };
        }
    };
});
//# sourceMappingURL=common.js.map