System.register([], function (exports_1, context_1) {
    "use strict";
    var tabs, menubtn, mobile, nav;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            tabs = [...document.querySelectorAll("div.login")];
            tabs.forEach(tab => {
                tab.addEventListener("click", () => {
                    tab.classList.toggle("active");
                });
            });
            menubtn = document.querySelector("button.menu");
            mobile = document.querySelector(".mobile");
            if (menubtn && mobile) {
                menubtn.addEventListener("click", () => {
                    mobile.classList.toggle("active");
                });
            }
            nav = document.querySelector("nav");
            if (nav) {
                document.addEventListener("scroll", () => {
                    let top = window.pageYOffset || document.documentElement.scrollTop;
                    if (top > 150) {
                        nav.classList.add("scrolled");
                    }
                    else {
                        nav.classList.remove("scrolled");
                    }
                });
            }
            exports_1("default", {});
        }
    };
});
//# sourceMappingURL=nav.js.map