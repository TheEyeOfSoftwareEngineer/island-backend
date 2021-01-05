const Router = require('koa-router')
const router = new Router()

// 第一个参数是监控的网页地址
// 第二个参数是函数/中间件
router.get("/v1/classic/latest", (ctx, next)=> {
  ctx.body = {
    key:"classic"
  }
})

module.exports = router