import { state } from './stateManager.js';

export function initializeSocket() {
    state.socket = io();

    state.socket.on('connect', () => {
        console.log('Socket connected:', state.socket.id);
    });

    state.socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    // Add more socket event listeners here
}
