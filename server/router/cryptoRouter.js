const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken'); // Middleware để xác thực token
const { setPublicKey, getPublicKey, getUserById, getSignalKeyBundle, saveSignalKeys } = require('../../mysql/dbUser');
const { getForumMembers } = require('../../mysql/db.Forums');
//  Cập nhật public key cho user
router.post('/crypto/public-key', verifyToken, async (req, res) => {
    const userId = req.user.userId; // Lấy userId từ token đã được giải mã
    const { publicKey } = req.body;
    if (!publicKey) {
        return res.status(400).json({ success: false, message: 'Thiếu public key (crytoRouter.js)' });
    }
    try {
       await setPublicKey(userId, publicKey);
        res.status(200).json({ success: true, message: 'Public key đã được cập nhật thành công.' });
    }
    catch (error) {
        console.error('Lỗi khi cập nhật public key:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật public key.' });
    }
});

// Lấy public key của user theo userId
router.get('/getpublickey/:userId', verifyToken, async (req, res) => {
    const {userId} = req.params; // Lấy userId từ tham số URL
    try {
        const publicKey = await getPublicKey(userId);
        if (!publicKey) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy public key cho user này.' });
        }
        else {
            res.status(200).json({ success: true, publicKey: publicKey });
        }
    } catch (error) {
        console.error('Lỗi khi lấy public key:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy public key.' });
    }
});

router.get('/forums/:forumId/members/details', verifyToken, async (req, res) => {
    const { forumId } = req.params; // Lấy forumId từ tham số URL
    try {
        const members = await getForumMembers(forumId);
        const memberDetails = await Promise.all(members.map(async (member) => {
            const userDetails = await getUserById(member.id);
            return {
                id: userDetails.id,
                Name: userDetails.Name,
                avatar: userDetails.avatar,
                publicKey: userDetails.public_key // Lấy public key từ thông tin người dùng
            };
        }));
        res.status(200).json({ success: true, members: memberDetails });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin thành viên của forum:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin thành viên của forum.' });
    }   
});
router.post('/crypto/keys', verifyToken, async(req, res)=>{
    const userId = req.user.userId;
    const keys= req.body;
    
    if (!keys.identityKey || ! keys.registrationId || ! keys.preKeys || ! keys.signedPreKey) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin khóa.' });
    }

    try{
        // Gọi hàm lưu các khóa này vào CSDL
        const saveKeys = await saveSignalKeys(userId, keys)
        if  (saveKeys){
            res.status(200).json({ success: true, message: 'Đã đăng ký khóa thành công.' });
        } else {
            res.status(500).json({ success: false, message: 'Không thể cập nhật khóa trong CSDL.' });
        }
    }catch(error){
         console.error('Lỗi khi lưu khóa Signal:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lưu khóa.' });
    }

});


// Lấy pre-key bundle của user khác để bắt đầu phiên chat
router.post('/crypto/keys/:userId', verifyToken, async(req, res)=>{
    const targetUserId = req.params.userId;
    try {
        const bundle = await getSignalKeyBundle(targetUserId);
        
        if (!bundle){
             return res.status(404).json({ success: false, message: 'Không tìm thấy pre-key bundle cho người dùng này.' });
        }

        res.status(200).json({ success: true, data: bundle });
    }
    catch(error){
        console.error('Lỗi khi lấy pre-key bundle:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy bundle.' });
   }
});
module.exports = router;


