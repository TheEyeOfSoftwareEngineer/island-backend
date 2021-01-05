const Koa = require('koa')
const requireDirctory = require('require-directory')
const Router = require('koa-router')


// 新建出来的App实例是应用程序对象，在这个对象有很多中间件
const app = new Koa()

requireDirctory(module, './api',{
  visit:whenLoadModule
})

function whenLoadModule(obj) {
  if(obj instanceof Router) {
    app.use(obj.routes())
  }
}



// app阻塞以等待请求
app.listen(3000)
