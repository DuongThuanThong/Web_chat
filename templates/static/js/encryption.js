
const cryptoService = {
// ==================QUẢN LÝ KHÓA====================
    // Tạo khóa định danh cho mỗi user
    async generateUserKey(){
        return await crypto.subtle.generateKey(
            {name: "ECDH", namedCurve: "P-256"},
            true,["deriveKey"]
    )},

    // Tạo khóa đối xứng
    //Dùng làm khóa chung cho mỗi nhóm chat.
    async generateSymmetricKey() {
        return await window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true, ["encrypt", "decrypt"]
        );
    },
// ================ MÃ HÓA & GIẢI MÃ TIN NHẮN BẰNG KHÓA NHÓM (AES-GCM) ==================
    //Mã hóa tin nhắn bằng khóa đối xứng cửa nhóm
    async encryptMessage(symmetricKey, data) {
        // IV (Initialization Vector) là bắt buộc và phải là duy nhất cho mỗi lần mã hóa
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encodedData = new TextEncoder().encode(data);

        const encryptedData = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            symmetricKey,
            encodedData
        );
        // Gộp IV và dữ liệu mã hóa lại với nhau, vì cả hai đều cần thiết để giải mã
        const ivAndEncryptedData = new Uint8Array(iv.length + encryptedData.byteLength);
        ivAndEncryptedData.set(iv);
        ivAndEncryptedData.set(new Uint8Array(encryptedData), iv.length);

        // Chuyển sang Base64 để dễ dàng gửi qua JSON
        return btoa(String.fromCharCode.apply(null, ivAndEncryptedData));
    },
    // Giải mã tin nhắn bằng khóa đối xứng của nhóm
    async decryptMessage(symmetricKey, base64_encryptedData) {
        try {
            const encryptedDataWithIv = Uint8Array.from(atob(base64_encryptedData).split('').map(c => c.charCodeAt(0)));

            // Tách IV ra khỏi dữ liệu
            const iv = encryptedDataWithIv.slice(0, 12);
            const data = encryptedDataWithIv.slice(12);

            const decrypted = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv },
                symmetricKey,
                data
            );
            return new TextDecoder().decode(decrypted);
        } catch (error) {
            console.error("Lỗi giải mã:", error);
            // Trả về một thông báo lỗi thân thiện để hiển thị trên giao diện
            return "Tin nhắn không thể giải mã.";
        }
    },
// ================ BẢO VỆ PRIVATE KEY BẰNG MẬT KHẨU ==================
    // Tạo ra một khóa mã hóa (KEK) từ mật khẩu và salt
    async deriveKeyFromPassword(password, salt) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        const baseKey = await window.crypto.subtle.importKey(
            "raw", passwordBuffer, { name: "PBKDF2" }, false, ["deriveKey"]
        );
        return await window.crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
            baseKey,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    },  

    // Mã hóa private key (đã được export ra JWK) bằng KEK.
       async encryptPrivateKey(kek, privateKeyJwk) {
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const privateKeyString = JSON.stringify(privateKeyJwk);
        const encodedPrivateKey = new TextEncoder().encode(privateKeyString);
        const encryptedPrivateKey = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv }, kek, encodedPrivateKey
        );
        const resultBuffer = new Uint8Array(iv.length + encryptedPrivateKey.byteLength);
        resultBuffer.set(iv);
        resultBuffer.set(new Uint8Array(encryptedPrivateKey), iv.length);
        return btoa(String.fromCharCode.apply(null, resultBuffer));
    },

    // Giải mã private key từ chuỗi base64.
    async decryptPrivateKey(kek, encryptedPrivateKeyBase64) {
        const encryptedDataWithIv = Uint8Array.from(atob(encryptedPrivateKeyBase64).split('').map(c => c.charCodeAt(0)));
        const iv = encryptedDataWithIv.slice(0, 12);
        const encryptedPrivateKey = encryptedDataWithIv.slice(12);
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv }, kek, encryptedPrivateKey
        );
        const privateKeyString = new TextDecoder().decode(decryptedBuffer);
        return JSON.parse(privateKeyString);
    },

    async exportKeyToJWK(key) {
        return await window.crypto.subtle.exportKey("jwk", key);
    },
    async importPrivateKeyFromJWK(jwk) {
        return await window.crypto.subtle.importKey(
            "jwk", jwk, { name: "ECDH", namedCurve: "P-256" }, true, ['deriveKey']
        );
    },
    async importPublicKeyFromJWK(jwk) {
        return await window.crypto.subtle.importKey(
            "jwk", jwk, { name: "ECDH", namedCurve: "P-256" }, true, []
        );
    }
}
