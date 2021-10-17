import Mock from "mockjs";
const Random = Mock.Random;
export const avatar = () => {
  return Random.image("100x100", "334455", "#fff", "avatar");
};
// Random.range(1, 10, 2)
// => [1, 3, 5, 7, 9]

// 两位正整数
export const int2 = () => {
  return Random.integer(10, 99);
};
export const float2 = () => {
  return Random.float(60, 100, 2, 2);
};
export const str3_5 = () => {
  // 我的拉篮
  return Random.csentence(3, 5);
};
export const str5_10 = () => {
  // 我的拉篮嘿呀哦
  return Random.csentence(5, 10);
};
export const num0_1 = () => {
  // 0 | 1
  return Random.integer(0, 1);
};
export const datetime = () => {
  return Random.datetime("yyyy-MM-dd HH:mm:ss");
};
// 基础响应数据
export const resBaseObj = {
  status: 0,
  message: {
    text: "ok"
  }
};
// 表格data数据
export const baseTableObj = {
  pageNumber: 1,
  pageSize: 10,
  totalElements: "10",
  content: []
};
