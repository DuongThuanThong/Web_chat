
const messageCipher = {
    //Mã hóa tin nhắn cho cả nhóm
    async encryptForGroup(formId,memberId, plainText) {
        const groupSender = {name: formId, deviceId: user.id};
        const groupCipher = new libsignal.GroupCipher(signalStorage,groupSender);
        const distributionMessage = await groupCipher.createrSession();

        const  distributionMessages = {};
        for (const memberId of memberIds){
            if (memberId === user.id) continue;
            const address = new libsignal.ProtocolAddress(memberId, 1);
            await sessionManager.ensureSession(memberId);
            const sessionCipher = new libsignal.SessionCipher(signalStorage, address);
            const encryptedDistributionMsg = await sessionCipher.encrypt(distributionMessage);
            distributionMessages[memberId] = {
                type: encryptedDistributionMsg.type,
                body: btoa(String.fromCharCode(...new Uint8Array(encryptedDistributionMsg.body)))
            };
        }
        const mainCiphertext = await groupCipher.encrypt(new TextEncoder().encode(plainText));
        
        return {
            mainCiphertext: btoa(String.fromCharCode(...new Uint8Array(mainCiphertext))),
            distributionMessages
        };
    },


    async decryptGroupMessage(forumId, senderId, payload) {
        const groupSender = { name: forumId, deviceId: senderId };
        const groupCipher = new libsignal.GroupCipher(signalStorage, groupSender);
        
        if (payload.distributionMessage) {
            const senderAddress = new libsignal.ProtocolAddress(senderId, 1);
            const sessionCipher = new libsignal.SessionCipher(signalStorage, senderAddress);
            const distMsgBodyBuffer = Uint8Array.from(atob(payload.distributionMessage.body), c => c.charCodeAt(0));
            
            const senderKeyDistributionMessage = await sessionCipher.decryptPreKeyWhisperMessage(distMsgBodyBuffer);
            await groupCipher.process(senderKeyDistributionMessage);
        }
        
        const mainCiphertextBuffer = Uint8Array.from(atob(payload.mainCiphertext), c => c.charCodeAt(0));
        const decryptedBuffer = await groupCipher.decrypt(mainCiphertextBuffer);
        
        return new TextDecoder().decode(decryptedBuffer);
    }
};