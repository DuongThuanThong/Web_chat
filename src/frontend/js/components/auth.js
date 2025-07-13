import { domElements } from './domElements.js';

export function checkAuthentication() {
    const user = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");

    if (!user || !accessToken) {
        if (domElements.overlay) {
            domElements.overlay.style.display = "flex";
            setTimeout(() => domElements.overlay.classList.add("show"), 10);
        }
        setTimeout(() => {
            window.location.replace("/login.html");
        }, 2000);
    }
}