
const sessionManager = {
    // Kiểm tra và xây dụng phiên thật sự cần thiết
    async ensureSession(recipientId){
        const addrees = new libsignal.ProtocolAddress(recipientId,1);
        const sessionExists = await signalStorage.loadSession();

        if (sessionExists) return;

        //Nếu chưa có tồn tại thì tạo một cáii mới
        const preKeyBundle = await this.fetchPreKeyBundle(recipientId);
        if (!preKeyBundle)  throw new Error(`Không thế lấy được bundle cho ${recipientId} `);
        
        const sessionBuilder = new libsignal.SessionBuilder(signalStorage, addrees);

        await sessionBuilder.processPreKey(preKeyBundle);

    },
    // GỌI API  thông qua file apiService.js
    async fetchPreKeyBundle(userId){
        try{
            const res = await apiService.fetch(`api/crypto/keys/${userId}`);
            if (!res.success) return null;

            const bundle = res.data;
            const base64ToBuffer =  (base64) => Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer;
            
            return{ 
                identityKey: base64ToBuffer(bundle.identityKey),
                registrationId: bundle.registrationId,
                preKey: {
                    keyId: bundle.preKey.keyId,
                    publicKey: base64ToBuffer(bundle.preKey.publicKey)
                },
                signedPreKey: {
                    keyId : bundle.signedPreKey.keyId,
                    publicKey: base64ToBuffer(bundle.signedPreKey.publicKey),
                    signature: base64ToBuffer(bundle.signedPreKey.signature),
                }
            }
        }catch(error){
            console.error(`Lỗi khi fetch bundle của ${userId}:`, error);
            return null;
        }
    }
}


