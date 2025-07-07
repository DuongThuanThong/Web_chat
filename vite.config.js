import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Chỉ định thư mục gốc của frontend
  root: resolve(__dirname, 'templates/web'),
  
  // Cấu hình cho server phát triển của Vite
  server: {
    port: 5500, 
    https: {
      // Cho Vite sử dụng chứng chỉ SSL bạn đã tạo
      key: resolve(__dirname, 'server/certs/server.key'),
      cert: resolve(__dirname, 'server/certs/server.cert')
    },
    // Proxy các yêu cầu API đến backend của bạn
    proxy: {
      '/api': {
        target: 'https://localhost:5000', // Địa chỉ BE_server
        changeOrigin: true,
        secure: false, // Bỏ qua kiểm tra chứng chỉ tự ký
      },
       '/socket.io': {
        target: 'wss://localhost:5000', // Proxy cho WebSocket
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    }
  },

  // Cấu hình cho việc build ra sản phẩm cuối cùng
  build: {
    // Thư mục đầu ra sẽ là 'dist' bên trong 'templates/web'
    outDir: resolve(__dirname, 'templates/web/dist'),
    rollupOptions: {
      // Chỉ định file index.html là điểm bắt đầu
      input: {
        main: resolve(__dirname, 'templates/web/index.html')
      }
    }
  }
});