const Koa = require("koa");
const app = new Koa();

// const path = require('path')
// console.log(path.resolve(__dirname, './dist'))

app.use(require("koa-static")(__dirname + "/dist"));

app.listen(3002, () => {
  console.log("local server listen on 3002");
});
