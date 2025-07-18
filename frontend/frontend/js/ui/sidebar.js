export function renderSidebar() {
    const sidebar = document.createElement('aside');
    sidebar.innerHTML = '<nav><ul><li>Home</li><li>Chat</li><li>Profile</li></ul></nav>';
    document.body.appendChild(sidebar);
}
