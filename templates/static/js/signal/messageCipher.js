
const messageCipher = {
    //Mã hóa tin nhắn cho cả nhóm
    async encrypt(recipientId, plainText) {

        // const myStorage = getMySignalStorage();
        // const address = new libsignal.SignalProtocolAddress(recipientId, 1);
        // const sessionCipher = new libsignal.SessionCipher(myStorage, address);

        // const plaintextBuffer = new TextEncoder().encode(plainText);
        
        // // Thư viện sẽ tự động quản lý các ratchet key để mã hóa
        // const ciphertext = await sessionCipher.encrypt(plaintextBuffer);

        // console.log("Mã hóa thành công!");
        // return ciphertext; // Đây là đối tượng chứa type và body

        const mainCiphertext = btoa(`GROUP_ENCRYPTED[${plainText}]`)// Mã hóa thành chuỗi Base64
        const distributionMessages = {};
        for (const memberId of memberIds) {
            distributionMessages[memberId] = btoa(`KEY_FOR_${memberId}`);
        }
        return { mainCiphertext, distributionMessages};
    },


    //Giải mã một tin nhắn nhận được.
    async decrypt(senderId, ciphertext) {
        console.log(`Đang giải mã tin nhắn từ ${senderId}...`);
        
        // const myStorage = getMySignalStorage();
        // const address = new libsignal.SignalProtocolAddress(senderId, 1);
        // const sessionCipher = new libsignal.SessionCipher(myStorage, address);

        // let decryptedBuffer;
        // if (ciphertext.type === 3) { // PreKeyWhisperMessage (tin nhắn đầu tiên)
        //     decryptedBuffer = await sessionCipher.decryptPreKeyWhisperMessage(ciphertext.body, 'binary');
        // } else { // WhisperMessage (tin nhắn thông thường)
        //     decryptedBuffer = await sessionCipher.decryptWhisperMessage(ciphertext.body, 'binary');
        // }
        
        // console.log("Giải mã thành công!");
        // return new TextDecoder().decode(decryptedBuffer);

        // --- DỮ LIỆU GIẢ LẬP ĐỂ TEST ---
        console.log(`Đã nhận được key: ${atob(messagePayload.distributionMessage)}`);
        const plainText = atob(messagePayload.mainCiphertext).match(/GROUP_ENCRYPTED\[(.*?)\]/)[1];
        return plainText;
        // --- KẾT THÚC DỮ LIỆU GIẢ LẬP ---
    }
};