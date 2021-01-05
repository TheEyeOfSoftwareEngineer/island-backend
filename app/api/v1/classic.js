const Router = require('koa-router')
const router = new Router()

// 第一个参数是监控的网页地址
// 第二个参数是函数/中间件
router.post("/v1/:id/classic/latest", (ctx, next)=> {
  const path =  ctx.params
  console.log(path)
  const query = ctx.request.query
  console.log(query)
  const headers = ctx.request.header
  console.log(headers)
  const body = ctx.request.body
  console.log(body)
  ctx.body = {
    key:"classic"
  }
})

module.exports = router