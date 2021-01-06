const { HttpException } = require("../core/http-exception")

// 全局异常处理
const catchError = async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    // if(error.errorCode) {
    //   ctx.body = {
    //     mgs: error.message,
    //     error_code: error.errorCode,
    //     request_url: error.requestUrl
    //   }
    //   ctx.status = error.status
    // }
    if(error instanceof HttpException) {
      ctx.body = {
        msg: error.msg,
        error_code: error.errorCode,
        request: `${ctx.method} ${ctx.path}`
      }
      ctx.status = error.code
    }
  }
}

module.exports = catchError