import user from "./user";
import {
  getHomeList,
  getTableList,
  getCommonList,
  getOptions,
  getStoreList
} from "./homeMock";

import { getJobOptions, getOrderStatus, getCodeOptions } from "./options";
import { storeListData } from "./store";

console.log(getStoreList());

export default {
  "GET /api/login": user.login,
  "GET /api/posts": function(req, res) {
    // let query = req.query || {};
    return res.json(getHomeList(req.query));
  },
  "GET /api/users/:id": (req, res) => {
    return res.json({
      id: req.params.id,
      username: "kenny"
    });
  },
  "GET /api/options/job": function(req, res) {
    return res.json(getJobOptions());
  },
  "GET /api/options/code": function(req, res) {
    return res.json(getCodeOptions(req.query.search));
  },
  "GET /api/options/orderStatus": function(req, res) {
    return res.json(getOrderStatus());
  },
  "GET /api/tableList": function(req, res) {
    return res.json(getTableList());
  },
  "GET /api/options": function(req, res) {
    // console.log("req", req.query);
    const parentKey = req.query.search;
    const result = {
      status: 0,
      msg: "success",
      data: [
        { parentKey: parentKey, value: "101", label: "label：101" },
        { parentKey: parentKey, value: "102", label: "label：102" },
        { parentKey: parentKey, value: "103", label: "label：103" }
      ]
    };
    return res.json(result);
  },
  // 获取枚举 门店
  // "GET /api/options/store": function(req, res) {
  //   return res.json(getStoreList());
  // },
  // 获取枚举 城市
  "GET /api/options/city": function(req, res) {
    return res.json(getCommonList());
  },
  // 获取枚举 门店
  "GET /api/options/store": function(req, res) {
    return res.json(storeListData);
  },
  // 获取枚举 服务项目
  "GET /api/options/service": function(req, res) {
    return res.json(getOptions());
  },

  "POST /api/users": (req, res) => {
    res.send({ status: "ok", message: "创建成功！" });
  },
  "DELETE /api/users/:id": (req, res) => {
    // console.log(req.params.id);
    res.send({ status: "ok", message: "删除成功！" });
  },
  "PUT /api/users/:id": (req, res) => {
    // console.log(req.params.id);
    // console.log(req.body);
    res.send({ status: "ok", message: "修改成功！" });
  }
};
