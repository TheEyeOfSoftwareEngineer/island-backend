const Koa = require('koa')
const parser = require('koa-bodyparser')

const InitManager = require('./core/init')
const catchError = require('./middlewares/exceptions')


// 新建出来的App实例是应用程序对象，在这个对象有很多中间件
const app = new Koa()
app.use(catchError)
app.use(parser())

InitManager.initCore(app)

// app阻塞以等待请求
app.listen(3000)
