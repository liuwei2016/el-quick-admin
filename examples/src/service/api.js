import request from "./index.js";
export const getJobOptions = params => request.GET("/api/options/job", params);
export const getOrderStatus = params =>
  request.GET("/api/options/orderStatus", params);
export const getCodeOptionsData = params =>
  request.GET("/api/options/code", params);
