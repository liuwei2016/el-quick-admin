import Mock from "mockjs";
const Random = Mock.Random;
const avatar = () => {
  return Random.image("100x100", "334455", "#fff", "avatar");
};

// Random.range(1, 10, 2)
// => [1, 3, 5, 7, 9]

// 两位正整数
const int2 = () => {
  return Random.integer(10, 99);
};
console.log(int2());
const float2 = () => {
  return Random.float(60, 100, 2, 2);
};
console.log(float2());
const str3_5 = () => {
  // 我的拉篮
  return Random.csentence(3, 5);
};
const str5_10 = () => {
  // 我的拉篮嘿呀哦
  return Random.csentence(5, 10);
};
const num0_1 = () => {
  // 0 |1
  return Random.integer(0, 1);
};

// Random.time()
// // => "00:14:47"

// Random.now()
// // => "2014-04-29 20:08:38 "
// Random.now('day', 'yyyy-MM-dd HH:mm:ss SS')
// // => "2014-04-29 00:00:00 000"
// Random.now('day')
// // => "2014-04-29 00:00:00 "
// Random.now('yyyy-MM-dd HH:mm:ss SS')
// // => "2014-04-29 20:08:38 157"

// Random.now('year')
// // => "2014-01-01 00:00:00"
// Random.now('month')
// // => "2014-04-01 00:00:00"
// Random.now('week')
// // => "2014-04-27 00:00:00"
// Random.now('day')
// // => "2014-04-29 00:00:00"
// Random.now('hour')
// // => "2014-04-29 20:00:00"
// Random.now('minute')
// // => "2014-04-29 20:08:00"
// Random.now('second')
// // => "2014-04-29 20:08:38"

// Random.cname()
// => "袁军"
// Random.cfirst()
// // => "曹"
const datetime = () => {
  return Random.datetime("yyyy-MM-dd HH:mm:ss");
};
const maxArr = [];
for (let i = 0; i < 100; i++) {
  maxArr.push(0);
}
const resBaseObj = {
  status: 0,
  message: {
    text: "ok"
  }
};
const baseTableObj = {
  pageNumber: 2,
  pageSize: 10,
  totalElements: 30,
  content: []
};

export const getTableList = options => {
  console.log("query:", options);
  let list = maxArr.splice(-10);
  list = list.map(() => {
    return {
      id: "60000055",
      cityId: 414,
      cityName: "长沙",
      serviceType: 30,
      serviceName: "服务项", //服务项名称
      normal: "0.20",
      nonNormal: "0.10",
      renewal: null,
      effectBegin: datetime(), //生效开始时间
      effectEnd: "2099-12-31 00:00:00",
      remark: str5_10(),
      createTime: "2020-10-26 17:41:02",
      creater: "测试01号",
      updateTime: "2021-06-28 17:49:16",
      updater: "测试01号",
      settleType: num0_1(),
      settleTypeName: str5_10(),
      storeId: "3432432432423", //门店id
      storeName: "北京代理门店", //门店名称
      storeType: "代理", //门店类型
      canUpdate: true, //是否可修改
      canDelete: true //是否可删除
    };
  });
  return {
    data: {
      ...baseTableObj,
      content: list
    },
    ...resBaseObj
  };
};

export const getHomeList = options => {
  console.log(options);
  let list = maxArr.splice(-10);
  list = list.map(() => {
    return {
      name: str5_10(),
      createTime: Random.datetime("yyyy-MM-dd HH:mm:ss"),
      avatar: avatar(),
      status: num0_1()
    };
  });
  return {
    data: list,
    ...resBaseObj
  };
};

export const getCommonList = options => {
  console.log(options);
  let list = maxArr.splice(-10);
  list = list.map(() => {
    return {
      key: str5_10(),
      value: str5_10()
    };
  });
  return {
    data: list,
    ...resBaseObj
  };
};

export const getOptions = () => {
  let data = Mock.mock({
    "list|1-10": [
      {
        "key|+1": 1
      }
    ]
  });
  data.list.forEach(v => {
    v.value = str3_5();
  });
  console.log("data", data);
  return {
    data: data.list,
    ...resBaseObj
  };
};

export const getStoreList = () => {
  let data = Mock.mock({
    "list|1-2": [
      {
        "key|+1": 1,
        pid: "0",
        text: "自营",
        state: null,
        children: [],
        order: 0
      }
    ]
  });
  data.list.forEach(v => {
    v.children = [
      {
        id: "49158966214",
        pid: "90000000002",
        text: Random.city() + "密云家教代理",
        state: null,
        children: null,
        order: 0
      },
      {
        id: "49158966215",
        pid: "90000000002",
        text: Random.city() + "密云家教代理",
        state: null,
        children: null,
        order: 1
      }
    ];
  });
  return {
    data: data.list,
    ...resBaseObj
  };
};
