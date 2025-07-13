# Tài liệu dự án WebChat

## Cấu trúc thư mục

### Backend (`src/api/`)
- **config.js**: Cấu hình chung cho backend.
- **middleware/**: Chứa các middleware để xử lý yêu cầu.
- **models/**: Các mô hình và truy vấn cơ sở dữ liệu.
- **routes/**: Xử lý các endpoint API.
- **services/**: Chứa logic nghiệp vụ.
- **utils/**: Các hàm tiện ích dùng chung.
- **server.js**: Điểm khởi đầu của server backend.
- **socket.js**: Xử lý giao tiếp thời gian thực với Socket.IO.

### Frontend (`src/client/`)
- **css/**: Chứa các file CSS.
- **images/**: Chứa hình ảnh tĩnh.
- **js/**: Chứa logic frontend.
  - **components/**: Các thành phần giao diện và tiện ích.
    - `domElements.js`: Quản lý các phần tử DOM.
    - `stateManager.js`: Quản lý trạng thái toàn cục.
    - `auth.js`: Xử lý xác thực người dùng.
    - `socketManager.js`: Quản lý logic socket.
    - `renderManager.js`: Quản lý các hàm render giao diện.
  - **pages/**: Logic cho từng trang cụ thể.
    - `chat.js`: Logic cho trang chat.
  - **router.js**: Quản lý điều hướng frontend.
- **index.html**: Điểm khởi đầu của frontend.

## Hướng dẫn sử dụng
1. Cài đặt các phụ thuộc:
   ```bash
   npm install
   ```
2. Chạy backend:
   ```bash
   npm run dev:be
   ```
3. Chạy frontend:
   ```bash
   npm run dev:fe
   ```