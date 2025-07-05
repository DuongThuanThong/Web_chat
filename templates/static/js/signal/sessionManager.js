
const sessionManager = {
    // Kiểm tra và xây dụng phiên thật sự cần thiết
    async ensureSession(recipientId){

        const existingSession = await this.loadSession(recipientId);
        // Nếu phiên đã tồn tại rồi thì thôi
        if (existingSession) return;

        // Nếu phiên chưa tồn tại thì ta sẽ là sao:
        //1: Lấy preKey Bundle của người nhận từ server xuống
        const bundle = await this.fetchPreKeyBundle(recipientId);
        // kiểm tra thử xem có rỗng không để thực hiện bước 2:
        if (!bundle){
            throw new Error(`Không thể lấy bundle cho ${recipientId}`);
        }

        //2: Load khóa định danh của chính mình từ IndexedDB
        //3: Xây dựng phiên bằng thư viện signal
        //4: Xử lý pre-key bundle để tạo phiên chat



    },

    // GỌI API  thông qua file apiService.js
    async fetchPreKeyBundle(userId){
        try{
            const res = await apiService.fetch(`api/crypto/keys/${userId}`);
            if (res.success){
                return res.data;
            }
            return null;
        }catch(error){
            console.error(`Lỗi khi fetch pre-key bundle của ${userId}:`, error);
            return null;
        }
    },


    // Hàm này mục đích là load phiên từ IndexedDB
    async loadSession (){
        // Logic để load phiên từ IndexedDB
        return null;
    }
}


