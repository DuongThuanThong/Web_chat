export function renderHeader() {
    const header = document.createElement('header');
    header.innerHTML = '<h1>Welcome to WebChat</h1>';
    document.body.prepend(header);
}
