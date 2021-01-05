const Koa = require('koa')
const book  = require('./api/v1/book')
const classic = require('./api/v1/classic')

// 新建出来的App实例是应用程序对象，在这个对象有很多中间件
const app = new Koa()


app.use(book.routes())
app.use(classic.routes())

// app阻塞以等待请求
app.listen(3000)
