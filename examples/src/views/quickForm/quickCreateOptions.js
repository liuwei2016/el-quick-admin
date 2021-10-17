export const modes = [
  {
    label: "表格查询表单",
    value: "tableQuery"
  },
  {
    label: "弹窗表单",
    value: "dialogForm"
  },
  {
    label: "大表单",
    value: "bigForm"
  },
  {
    label: "分组表单",
    value: "groupForm"
  }
];

export const rows = [
  {
    label: "默认展示1行",
    value: 1
  },
  {
    label: "默认展示2行",
    value: 2
  },
  {
    label: "默认展示3行",
    value: 3
  },
  {
    label: "默认展示4行",
    value: 4
  },
  {
    label: "默认展示5行",
    value: 5
  },
  {
    label: "默认展示6行",
    value: 6
  },
  {
    label: "默认展示7行",
    value: 7
  }
];
export const cols = [
  {
    label: "一行1列",
    value: 24
  },
  {
    label: "一行2列",
    value: 12
  },
  {
    label: "一行3列",
    value: 8
  },
  {
    label: "一行4列",
    value: 6
  },
  {
    label: "一行6列",
    value: 4
  }
];

export const options = [
  {
    label: "选项1",
    value: 11
  },
  {
    label: "选项2",
    value: 22
  },
  {
    label: "选项3",
    value: 33
  }
];

export const treeParams = {
  clickParent: false,
  filterable: true,
  "check-strictly": true,
  "default-expand-all": false,
  "expand-on-click-node": false,
  // data: storeListData,
  props: {
    children: "children",
    label: "text",
    disabled: "disabled",
    value: "id"
  }
};
