import { apiService } from '../api/apiService.js';
import { domElements } from '../components/domElements.js';
import { state } from '../components/stateManager.js';
import { checkAuthentication } from '../components/auth.js';
import { initializeSocket } from '../components/socketManager.js';
import { renderSingleMessage } from '../components/renderManager.js';

(async function () {
  await window.socketIoReady;

  // ======================== XÁC THỰC NGƯỜI DÙNG ========================
  checkAuthentication();

  // Khởi tạo socket
  initializeSocket();

  // Sử dụng renderSingleMessage để hiển thị tin nhắn
  renderSingleMessage({
    user_id: 1,
    content_text: 'Hello World!',
    created_at: new Date().toISOString()
  }, true);
})();