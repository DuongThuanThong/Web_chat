export function renderFooter() {
    const footer = document.createElement('footer');
    footer.innerHTML = '<p>&copy; 2025 WebChat. All rights reserved.</p>';
    document.body.appendChild(footer);
}
