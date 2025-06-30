const cryptoService = {
// ================Khóa chính của User ==================
    // Tạo cặp khóa ECC cho người dùng
    async generateUserKeys() {
        return await window.crypto.subtle.generateKey(
            {
                name: "ECDH",
                namedCurve: "P-256"
            },
            true,['deriveKey']
        );
    },

    // Xuất khóa ra định dạng JWK (JSON Web Key)
    async exportKeyToJWK(key) {
        return await window.crypto.subtle.exportKey("jwk", key);
    },

    // Nhập Private Key từ Jwk đã lưu
    async importPrivateKeyFromJWK(jwk) {
        return await window.crypto.subtle.importKey(
            "jwk",jwk,
            {
                name: "ECDH",
                namedCurve: "P-256"
            },
            true,['deriveKey']
        );
    },

    // Nhập Public Key từ JWk nhận từ người khác
    async importPublicKeyFromJWK(jwk) {
        return await window.crypto.subtle.importKey(
            "jwk", jwk,
            {
                name: "ECDH",
                namedCurve: "P-256"
            },
            true, [] // Public nên không cần quyền deriveKey
        );
    },

// ================Khóa phiên===================
    // Tạo khóa phiên AES từ khóa chính của mình và khóa công khai của người khác
    async derveSharedKey (myPrivateKey, theirPublicKey) {
        return await window.crypto.subtle.deriveKey(
            {name: "ECDH",public: theirPublicKey},
            myPrivateKey,
            {
                name: "AES-GCM",
                length: 256 // Độ dài khóa AES
            },
            true, // Cho phép xuất khóa
            ["encrypt", "decrypt"] // Quyền sử dụng khóa
        );
    },

// ====================Mã hóa và Giải mã TEXT===================
    async encryptMessage(sharedKey, data) {
        const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Tạo một vector khởi tạo
        const encodedData = new TextEncoder().encode(data); // Mã hóa dữ liệu thành Uint8Array
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",iv: iv
            },
            sharedKey,
            encodedData
        );

        // Gộp iv và encryptedData để gửi đi
        const ivAndencryptedData = new Uint8Array(iv.length + encryptedData.byteLength);
        ivAndencryptedData.set(iv);
        ivAndencryptedData.set(new Uint8Array(encryptedData), iv.length);

        // Chuyển sang đổi chuỗi Base64 để gửi sang JSON
        return btoa(String.fromCharCode.apply(null, ivAndencryptedData));
    },

    // Giải mã tin nhắn đã nhận 
    async decryptMessage(sharedKey, base64_encryptedData) {
        try {
            // Chuyển đổi Base64 về Uint8Array
            const encryptedData = Uint8Array.from(atob(base64_encryptedData).split('').map(c => c.charCodeAt(0)));
            const iv = encryptedData.slice(0, 12); // Tách iv
            const data = encryptedData.slice(12); // Tách dữ liệu đã mã hóa

            const decrypted = await window.crypto.subtle.decrypt(
                {
                    name: "AES-GCM", iv: iv
                },
                sharedKey,
                data
            );
            return new TextDecoder().decode(decrypted); // Chuyển đổi Uint8Array về chuỗi
        }catch (error) {
            console.error("Lỗi giải mã encryption.js", error);
            return "Không thể giải mã dữ liệu"
        }
    },

// ====================Mã hóa và Giải mã FILE===================

    // Mã hóa ArrayBuffer (dành cho file)
    async encryptArrayBuffer(sharedKey, data){
        const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Tạo một vector khởi tạo
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM", iv: iv
            },
            sharedKey,
            data
        );
        
        const ivAndEncryptedData = new Uint8Array(iv.byteLength + encryptedData.byteLength);
        ivAndEncryptedData.set(iv);
        ivAndEncryptedData.set(new Uint8Array(encryptedData), iv.byteLength);

        return ivAndEncryptedData.buffer;
    },

    async decryFileBuffer(sharedKey, data){
        try{
            const ivAndEncryptedData = new Uint8Array(data);
            const iv = ivAndEncryptedData.slice(0, 12); // Lấy vector khởi tạo từ đầu dữ liệu
            const encryptedData = data.slice(12); // Lấy phần dữ liệu đã mã hóa

            const decryptedBuffer = await window.crypto.subtle.decrypt(
                {
                    name: "AES-GCM", iv: iv
                },
                sharedKey,
                encryptedData
            );
            return decryptedBuffer;
        } catch (error) {
            console.error('Lỗi khi giải mã dữ liệu:', error);
            return null;
        }
    }
};
