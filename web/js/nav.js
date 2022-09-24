var nav = document.getElementById("navigation")
var modeButton = document.getElementById("modeButton")
var navMenuButton = document.getElementById("navMenuButton")

if(window.innerWidth < 768){
    const classList = [...nav.classList]
    nav.className = classList.find(c => c == 'nav-down') ? classList.join(' ') : classList.join(' ') + ' nav-down'
}

document.addEventListener('scroll', (event) => {
    if(window.innerWidth > 768 ){
        const classList = [...nav.classList]
        if (window.scrollY > 50) {
            nav.className = classList.find(c => c == 'nav-down') ? classList.join(' ') : classList.join(' ') + ' nav-down'
        }
        else {
            nav.className = classList.filter(c => c != 'nav-down').join(' ')
        }
    } else {
        const classList = [...nav.classList]
        nav.className = classList.find(c => c == 'nav-down') ? classList.join(' ') : classList.join(' ') + ' nav-down'
    }
})


// modeButton.addEventListener('click', () => {
//     const buttonState = [...modeButton.classList][1]

//     const newState = buttonState == 'light-mode' ? 'dark-mode' : 'light-mode'
//     buttonState == 'light-mode' ? modeButton.childNodes[1].textContent = 'Light Mode' :  modeButton.childNodes[1].textContent = 'Dark Mode'    
//     const items = [...document.getElementsByClassName(buttonState)]
//     items.forEach(item => {
//         item.classList.replace(buttonState, newState)
//     });

//     if(nav.classList.contains('nav-bg-dark')){
//         nav.classList.remove('nav-bg-dark')
//     } else {
//         nav.classList.add('nav-bg-dark')
//     }
    
// })


navMenuButton.addEventListener('click', () => {
    const menuList = document.getElementsByClassName('nav-menu-options')[0]
    menuList.classList.contains('nav-menu-active') ? menuList.classList.remove('nav-menu-active') : menuList.classList.add('nav-menu-active')
})