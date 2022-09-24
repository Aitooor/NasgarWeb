const tabs = [...document.querySelectorAll("div.login")];

tabs.forEach(tab => {
	tab.addEventListener("click", () => {
		tab.classList.toggle("active");
	});
})

const menubtn = document.querySelector("button.menu");
const mobile = document.querySelector(".mobile");

if(menubtn && mobile) {
	menubtn.addEventListener("click", () => {
		mobile.classList.toggle("active");
	});
}

const nav = document.querySelector("nav");

if(nav) {
	document.addEventListener("scroll", () => {
		let top = window.pageYOffset || document.documentElement.scrollTop;
		if (top > 150) {
			nav.classList.add("scrolled");
		} else {
			nav.classList.remove("scrolled");
		}
	});
}

export default {};
