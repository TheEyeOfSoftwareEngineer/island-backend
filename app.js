const Koa = require('koa')

// 新建出来的App实例是应用程序对象，在这个对象有很多中间件
const app = new Koa()

// 接受HTTP

app.use(async(ctx, next)=>{
    await next()
    const r = ctx.r
    console.log(r)
})

app.use(async(ctx, next)=>{
    const axios = require('axios')
    const res = await axios.get('http://www.baidu.com')
    ctx.r = res
    next()    
})

// app阻塞以等待请求
app.listen(3000)
