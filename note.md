## island-backend

### 知识点

#### 后端

1. 功能

-   读写数据库 API

2. 难点

-   写出好的代码
-   提高开发效率 0

#### KOA

洋葱圈模型 精简 定制化能力强

```javascript
// 新建出来的App实例是应用程序对象，在这个对象有很多中间件
const app = new Koa();
```

#### 包导入的方式

1. commonJs require
2. Es6 import from
3. AMD

#### 中间件

中间件即函数

```javascript
function test() {
    console.log("hello, world");
}
```

我们需要将函数/中间件注册到应用程序对象上

app 对中间件会自动维护两个参数

-   ctx 上下文
-   next 下一个中间件函数

```javascript
app.use((ctx, next) => {
    console.log("hello, world");
    // next()会触发下一个中间件函数
    next();
});

app.use((ctx, next) => {
    console.log("hello, everyone");
});
```

下面的程序执行结果是 1->3->4->2;这个结果也符合函数堆栈调用的结果

```javascript
app.use((ctx, next) => {
    console.log(1);
    next();
    console.log(2);
});

app.use((ctx, next) => {
    console.log(3);
    next();
    console.log(4);
});
```

#### 洋葱模型

```javascript
app.use(async (ctx, next) => {
    // process
    await next();
});
```

**next()的调用结果返回的是一个 Promise**

### async 和 await

-   示例 1

```javascript
app.use((ctx, next) => {
    console.log(1);
    const a = next(); //Promise { undefined }
    console.log(a);
    console.log(2);
});
```

-   示例 2

```javascript
app.use((ctx, next) => {
    console.log(1);
    const a = next();
    console.log(a); // Promise { 'abc' } 包含有值的Promise
    console.log(2);
});

app.use((ctx, next) => {
    console.log(3);
    // next()
    console.log(4);
    return "abc"; // 我们也可以在这里直接狗仔一个Promise返回
});
// 1 3 4 Promise { 'abc' } 2
```

-   示例 3

```javascript
app.use((ctx, next)=>{
    console.log(1)
    const a = next()
    a.then((res) => {
        console.log(res)
      }
    )
    console.log(2)
})

app.use((ctx, next)=>{
    console.log(3)
    // next()
    console.log(4)
    return 'hello'
}
// 1 3 4 2 hello
```

-   示例 4

```javascript
app.use(async (ctx, next) => {
    console.log(1);
    const a = await next(); // 取出异步函数执行成功返回的值/求值关键字 阻塞线程; await可以对一个表达式求值，而不只是适用于异步函数
    console.log(a);
    console.log(2);
});

app.use((ctx, next) => {
    console.log(3);
    // next()
    console.log(4);
    return "hello";
});
// 1 3 4 hello 2
```

-   示例 5

```javascript
// condition 1 线程非阻塞 此时e-s的值很小
app.use(async (ctx, next) => {
    const axios = require("axios");
    const s = Date.now();
    const res = await axios.get("http://www.baidu.com");
    const e = Date.now();
    console.log(e - s);
});
// condition 2 线程阻塞，此时e-s值更大
app.use(async (ctx, next) => {
    const axios = require("axios");
    const s = Date.now();
    const res = await axios.get("http://www.baidu.com");
    console.log(res); //输出res 网页的源代码
    const e = Date.now();
    console.log(e - s);
});
```

**async 和 await 的作用**

异步的终极解决方案

await

-   求值关键字，将关键字后面的 Promise 或者表达式的值求出
-   阻塞当前的线程,等待异步线程的返回，即异步变同步
    async
-   将函数的返回包装成为 Promise
-   只有 await，没有 async 会报错
    <br/>

-   示例 6

```javascript
app.use((ctx, next) => {
    console.log(1);
    next();
    console.log(2);
});

app.use(async (ctx, next) => {
    console.log(3);
    const axios = require("axios");
    const res = await axios.get("http://www.baidu.com");
    next();
    console.log(4);
});
// 1 3 2 4 不符合洋葱模型;原因在于下面函数的await阻塞了当前的线程，从而使得上个函数的线程继续执行从而打印出了2
```

#### ctx

我们利用 ctx 上下文在中间件中进行内容的传递

```javascript
app.use(async (ctx, next) => {
    await next();
    const r = ctx.r;
    console.log(r);
});

app.use(async (ctx, next) => {
    const axios = require("axios");
    const res = await axios.get("http://www.baidu.com");
    ctx.r = res;
    next();
});
```

_这种方式需要我们保证传值是在洋葱模型的基础上执行的_

#### API 编写

我们可以根据数据类型的不同进行主题的划分

主题的划分是渐进式的,我们可以先抓住核心主要的进行工作

主题是一种大的内容或者数据类型的抽象，其可以对应Model部分

##### API版本
随着业务和需求的版本,需要考虑客户端的兼容性;服务器需要兼容多个版本,具体多少版本需要看情况而定；版本号我们可以添加到大概三种位置
- 路径 "/v2/classic/latest"
- 查询参数 "/classic/latest?version=v1"
- header 
*开闭原则: 修改关闭 扩展开启*
#### 请求的接收处理

```javascript
app.use(async (ctx, next) => {
    // 前端页面此时访问: http://localhost:3000/classic/latest
    console.log(ctx.path); // 输出: /classic/latest
    console.log(ctx.method); // 输出: GET 默认
    if (ctx.path === "/classic/latest" && ctx.method === "GET") {
        // return "classic" //无效
        // ctx.body = "classic" //koa2在返回前端数据时会将ctx.body中的数据返回给前端
        ctx.body = { key: "classic" }; //我们将js对象传入body中前端就可以接收到json类型的信息
    }
});
```

#### koa-router

-   步骤一: 实例化 koa-router

```javascript
const Router = require("koa-router");
const router = new Router();
```

-   步骤二: 编写一系列的路由函数

```javascript
router.get("/", (ctx, next) => {
    // process
});

// 第一个参数是监控的网页地址
// 第二个参数是函数/中间件
router.get("/classic/latest", (ctx, next) => {
    ctx.body = { key: "classic" };
});
```

-   步骤三: 注册 router 到 app 上

```javascript
app.use(router.routes()).use(router.allowdMethods());
```
