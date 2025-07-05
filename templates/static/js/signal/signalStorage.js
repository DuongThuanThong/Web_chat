// templates/static/js/signal/SignalStorage.js

class SignalStorage {
    constructor() {
        this.dbName = 'SignalStorageDB';
        this.versiondb = null;
    }

    // Khởi tạo và mở kết nối đến IndexedDB
    async init() {
        if (this.versiondb) {
            return;
        }
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = (event) => {
                console.error('Lỗi khi mở IndexedDB:', event);
                reject('Lỗi IndexedDB');
            };

            request.onsuccess = (event) => {
                this.versiondb = event.target.result;
                console.log('Kết nối IndexedDB thành công.');
                resolve();
            };

            // Hàm này chỉ chạy khi tạo DB lần đầu hoặc nâng cấp phiên bản
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('Đang thiết lập các kho lưu trữ (object stores)...');
                // Khoá định danh và ID đăng ký
                db.createObjectStore('identity', { keyPath: 'key' });
                // Khoá PreKeys dùng một lần
                db.createObjectStore('preKeys', { keyPath: 'keyId' });
                // Khoá Signed PreKey
                db.createObjectStore('signedPreKeys', { keyPath: 'keyId' });
                // Các phiên chat đã thiết lập
                db.createObjectStore('sessions', { keyPath: 'address' });
            };
        });
    }

    // --- Các hàm mà thư viện Signal yêu cầu ---

    // Lấy dữ liệu từ một kho (store) theo khóa (key)
    async get(storeName, key) {
        if (!this.versiondb) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.versiondb.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    // Lưu dữ liệu vào một kho
    async put(storeName, value) {
        if (!this.versiondb) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.versiondb.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(value);
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }

    // Xóa dữ liệu khỏi một kho
    async remove(storeName, key) {
        if (!this.versiondb) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.versiondb.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }

    // --- Các hàm tiện ích cho việc quản lý khóa ---

    getIdentityKeyPair = () => this.get('identity', 'identityKey');
    putIdentityKeyPair = (keyPair) => this.put('identity', { key: 'identityKey', value: keyPair });

    getLocalRegistrationId = () => this.get('identity', 'registrationId');
    putLocalRegistrationId = (regId) => this.put('identity', { key: 'registrationId', value: regId });

    // PreKey
    loadPreKey = (keyId) => this.get('preKeys', keyId);
    storePreKey = (keyId, keyPair) => this.put('preKeys', { keyId, keyPair });
    removePreKey = (keyId) => this.remove('preKeys', keyId);

    // Signed PreKey
    loadSignedPreKey = (keyId) => this.get('signedPreKeys', keyId);
    storeSignedPreKey = (keyId, keyPair) => this.put('signedPreKeys', { keyId, keyPair });
    removeSignedPreKey = (keyId) => this.remove('signedPreKeys', keyId);

    // Session
    loadSession = (address) => this.get('sessions', address);
    storeSession = (address, sessionRecord) => this.put('sessions', { address, sessionRecord });
    removeSession = (address) => this.remove('sessions', address);
    
    // Xóa toàn bộ CSDL (hữu ích khi logout)
    async clearAllData() {
        if (!this.versiondb) await this.init();
        const storeNames = ['identity', 'preKeys', 'signedPreKeys', 'sessions'];
        return new Promise((resolve, reject) => {
            const transaction = this.versiondb.transaction(storeNames, 'readwrite');
            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => reject(event.target.error);
            storeNames.forEach(storeName => {
                transaction.objectStore(storeName).clear();
            });
        });
    }
}

// Tạo một thực thể (instance) duy nhất để toàn bộ ứng dụng sử dụng
const signalStorage = new SignalStorage();