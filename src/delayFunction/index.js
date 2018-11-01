// 延遲執行函數
const waitFor = ms => new Promise(r => setTimeout(r, ms));

export { waitFor };
