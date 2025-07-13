import { domElements } from './domElements.js';

export function renderSingleMessage(msg, isLocal) {
    const messageDiv = document.createElement('div');
    const isSentByMe = parseInt(msg.user_id) === parseInt(state.user.id);
    messageDiv.className = `message ${isSentByMe ? 'sent' : 'received'}`;

    const messageTime = new Date(msg.created_at).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    let messageBubbleContent = '';
    if (msg.content_text) {
        messageBubbleContent = `<div class="message-bubble">${msg.content_text.replace(/\n/g, '<br>')}</div>`;
    }

    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="message-time">${messageTime}</span>
        </div>
        ${messageBubbleContent}
    `;

    domElements.messagesArea.appendChild(messageDiv);
}
