import { resBaseObj } from "./baseRule";
// import Mock from "mockjs";
// const Random = Mock.Random;
export const getJobOptions = function() {
  //   const options = ["自由职业|1"];
  //   console.log(options);
  const list = [
    {
      value: "1",
      label: "自由职业者"
    },
    {
      value: "2",
      label: "体制内"
    },
    {
      value: "3",
      label: "打工人"
    },
    {
      value: "4",
      label: "其他"
    }
  ];

  return {
    data: list,
    ...resBaseObj
  };
};

export const getOrderStatus = function() {
  const list = [
    { parentKey: "100", code: "101", label: "已完成" },
    { parentKey: "100", code: "102", label: "进行中" },
    { parentKey: "100", code: "103", label: "未开始" }
  ];
  return {
    data: list,
    ...resBaseObj
  };
};

export const getCodeOptions = function(key) {
  const list = [
    { code: "101", label: "aabb" },
    { code: "102", label: "ccdd" },
    { code: "103", label: "eeff" }
  ];

  return {
    data: !key
      ? list
      : list.filter(v => {
          return v.label.indexOf(key) >= 0;
        }),
    ...resBaseObj
  };
};
