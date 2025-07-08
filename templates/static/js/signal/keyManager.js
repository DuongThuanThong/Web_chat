const keyManager = {
    // Hàm này sẽ gọi khi người user đăng nhập thành công
    async initializeKeys(){
        try{
            //1. Kiểm tra xem khóa có tổn tại trong IndexedDB của trình duyệt không
            const identityKeyPair = await signalStorage.getIdentityKeyPair();
            if (identityKeyPair && identityKeyPair.publicKey && identityKeyPair.privateKey) return;
            // 2. Tạo các bộ khóa cần thiết
            const registrationId = libsignal.KeyHelper.generateRegistrationId();
            const identity = await libsignal.KeyHelper.generateIdentityKeyPair();
            const preKeys = [];
            for(let i = 1; i <= 100; i++) {
                preKeys.push(await libsignal.KeyHelper.generatePreKey(i));
            }
            const signedPreKey = await libsignal.KeyHelper.generateSignedPreKey(identity, 1); // Tạo signed pre-key với ID là 1

            //3.Lưu toàn bộ khóa trên vào IndexedDB
            await Promise.all([
                signalStorage.putIdentityKeyPair(identity),
                signalStorage.putLocalRegistrationId(registrationId),
                ...preKeys.map(key=>signalStorage.storeSignedPreKey(key.keyId, key.keyPair)),
                signalStorage.storeSignedPreKey(signedPreKey.keyId, signedPreKey.keyPair)
            ])          

            //4. Đưa các khóa công khai gửi lên server
            const publicKeys = {
                identityKey: identity.pubKey,
                registrationId: registrationId,
                preKeys: preKeys.map(key => ({
                    keyId: key.keyId,
                    publicKey: key.pubKey,
                })),
                signedPreKey: {
                    keyId : signedPreKey.keyId,
                    publicKey: signedPreKey.keyPair.pubKey,
                    signature: signedPreKey.signature,
                }
            };

            //5. Chuyển đổi dạng ArrayBuffers thành dạng Base64
            publicKeys = BufferIntoBase64(publicKeys);
            
            //6. Đưa thông tin của các khóa công khai ấy vào database
            await apiService.fetch('/api/crypto/keys',{
                method: 'POST',
                body: JSON.stringify(publicKeys),
            });
        }catch(error){
            console.error('Lỗi ở quá trình tạo Signal Keys của (keyManager.js)',error);
        }
    },

    //Hàm chuyển đổi ArrayBuffer sang Base64
    BufferIntoBase64(keys){
        const bufferToBase64 = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));
        return{ 
            identityKey: bufferToBase64(keys.identityKey),
            registrationId: keys.registrationId,
            preKeys: keys.preKeys.map(key => ({
                keyId: key.keyId,
                publicKey: bufferToBase64(key.publicKey),
            })),
            signedPreKey: {
                keyId : keys.signedPreKey.keyId,
                publicKey: bufferToBase64(keys.signedPreKey.publicKey),
                signature: bufferToBase64(keys.signedPreKey.signature),
            }
        }
    }


};