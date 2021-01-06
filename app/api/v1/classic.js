const Router = require('koa-router')
const router = new Router()

// 第一个参数是监控的网页地址
// 第二个参数是函数/中间件
router.post("/v1/:id/classic/latest", (ctx, next)=> {
  const path =  ctx.params
  const query = ctx.request.query
  const headers = ctx.request.header 
  const body = ctx.request.body

  // 监听错误
  // 向客户进行错误提示

  if(true) {
    const error = new global.errs.ParameterException()
    // const error = new Error('错误信息')
    // error.errorCode = 10001
    // error.status = 400
    // error.requestUrl = `${ctx.method} ${ctx.path}`
    throw error
  }
  
  ctx.body = {
    key:"classic"
  }
})

module.exports = router