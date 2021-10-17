import request from "./index.js";
export const getTableData = (url, params) => request.GET(url, params);
