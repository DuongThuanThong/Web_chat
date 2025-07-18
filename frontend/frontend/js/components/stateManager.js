export const state = {
    user: JSON.parse(localStorage.getItem("user")) || null,
    currentForumId: null,
    socket: null,
    groupSymmetricKey: new Map(),
    stagedFiles: [],
    MAX_TOTAL_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_FILE_COUNT: 10
};