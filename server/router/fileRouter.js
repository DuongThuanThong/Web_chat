// File: server/router/fileRouter.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { saveMessage } = require('../../mysql/db.Messages');
const verifyToken = require('../middleware/verifyToken'); // Bảo vệ route bằng middleware xác thực

function createFileRouter(io) {
    const router = express.Router();
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => { cb(null, uploadsDir); },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '');
            cb(null, uniqueSuffix + '-' + safeOriginalName);
        }
    });

    const upload = multer({ storage: storage, limits: { fileSize: 100 * 1024 * 1024 } });

    // Middleware 'verifyToken' sẽ kiểm tra token trước khi xử lý upload
    router.post('/upload', verifyToken, upload.array('file', 10), async (req, res) => {
        const { forumId } = req.body;
        const userId = req.user.userId; // Lấy userId từ token đã được giải mã

        if (!forumId) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin forumId' });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có file nào được tải lên.' });
        }

        try {
            const uploadedFileMessages = [];
            for (const file of req.files) {
                const messageData = {
                    forumId: forumId,
                    userId: userId,
                    contentType: 'file',
                    contentText: file.originalname,
                    fileInfo: {
                        fileName: file.filename,
                        filePath: file.path,
                        fileSize: file.size,
                        fileMimeType: file.mimetype,
                    }
                };

                const savedResult = await saveMessage(messageData);

                if (savedResult && savedResult.success) {
                    uploadedFileMessages.push(savedResult.data);
                    // Phát tin nhắn real-time tới tất cả client trong phòng
                    const roomName = `forum_${forumId}`;
                    io.to(roomName).emit('newMessage', savedResult.data);
                }
            }

            res.status(201).json({
                success: true,
                message: 'Các tệp đã được tải lên và gửi thành công!',
                data: uploadedFileMessages
            });

        } catch (error) {
            console.error('Lỗi khi xử lý file upload:', error);
            res.status(500).json({ success: false, message: 'Lỗi server khi xử lý file.' });
        }
    });


    router.get('/download/:filename', (req, res) => {
        const { filename } = req.params;
        // Đường dẫn an toàn đến thư mục uploads
        const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
        const filePath = path.join(uploadsDir, filename);

        // Kiểm tra xem tệp có tồn tại trong thư mục uploads không để tránh lỗi bảo mật
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error("Lỗi truy cập file:", err);
                return res.status(404).send('Tệp không tồn tại.');
            }

            // Sử dụng res.download() của Express
            // Express sẽ tự động đặt header Content-Disposition
            // Điều này buộc trình duyệt phải tải tệp xuống.
            res.download(filePath, (errDownload) => {
                if (errDownload) {
                    console.error("Lỗi khi tải file:", errDownload);
                    // Không gửi response lỗi nếu header đã được gửi
                    if (!res.headersSent) {
                        res.status(500).send('Không thể tải tệp.');
                    }
                }
            });
        });
    });

    return router;
}

module.exports = createFileRouter;