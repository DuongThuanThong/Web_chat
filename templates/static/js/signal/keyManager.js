const libsignal = require('./libsignal-protocol.js');

const keyManager = {
    // Hàm này sẽ gọi khi người user đăng nhập thành công
    async initializeKeys(){
        //1. Kiểm tra xem khóa có tổn tại trong IndexedDB của trình duyệt không
        const identityKeyPair = await signalStorage.getIdentityKeyPair();
        if (identityKeyPair && identityKeyPair.publicKey && identityKeyPair.privateKey) return;

        try{
            //2. Tạo các bộ khóa
            const [identity, regId, preKey, signedPreKeys] = await Promise.all([
                libsignal.KeyHelper.generateIdentityKeyPair(),
                libsignal.KeyHelper.generateRegistrationId(),
                libsignal.KeyHelper.generatePreKeys(0, 100), // Tạo 100 pre-key, bắt đầu từ ID 0
                libsignal.KeyHelper.generateSignedPreKey(identity, 1) // Tạo signed pre-key với ID là 1
            ])
        }

        //3.Lưu toàn bộ khóa trên vào IndexedDB
        
    }
}