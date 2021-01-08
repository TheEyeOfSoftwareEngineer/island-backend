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

-   步骤三: 注册 ro uter 到 app 上

```javascript
app.use(router.routes()).use(router.allowdMethods());
```
#### 端口号占用的解决
```
sudo lsof -i :PORT 找到占用端口号的PID
sudo lsof -i :3000 

kill -9 PID 占用端口的PID号
```

#### 路由的自动注册
```javascript
const Router = require('koa-router')
const requireDirctory = require('require-directory')

const modules = requireDirctory(module, './api', {visit:whenLoadModule})
function whenLoadModule(obj) {
  if(obj instanceof Router) {
    app.use(obj.routes())
  }
}

// 差一点的方法就是遍历modules
for(let r in modules) {
  if(r instanceof Router) {
    app.use(r.routes())
  }
}
```
这样我们就省去了手动导入路由的麻烦
```javascript
const book  = require('./api/v1/book')
const classic = require('./api/v1/classic')
app.use(book.routes())
app.use(classic.routes())
```
我们需要思考能不能在框架的基础上去简化操作从而提高效率

#### 构建初始化管理器
我们不想在主文件中加入过多的代码，所以我们尽量将代码部分抽离出去。这里我们通过类来构建初始化管理器，然后通过初始化管理器进行项目的初始化管理。
**另外我们一定要注意循环引用的情况，这里Flask的处理方式是使用蓝图blueprint。我们在文件构建的时候尽量不要让下级文件调用上级文件，而应该是上级调用下级文件，从而保证项目文档的清晰**
```javascript
// core/init.js
const requireDirctory = require('require-directory')
const Router = require('koa-router')

class InitManager {
  static initCore(app) {
    //入口方法
    InitManager.app = app
    InitManager.initLoadRouters()
  }
  static initLoadRouters() {
    requireDirctory(module, '../app/api',{
      visit:whenLoadModule
    })
    
    function whenLoadModule(obj) {
      if(obj instanceof Router) {
        InitManager.app.use(obj.routes())
      }
    }
  }
}
// app.js
const Koa = require('koa')
const InitManager = require('./core/init')

// 新建出来的App实例是应用程序对象，在这个对象有很多中间件
const app = new Koa()

InitManager.initCore(app)

// app阻塞以等待请求
app.listen(3000)
```
在上面的代码`init.js`部分，api的地址是用相对路径去完成的。这里我们可以用绝对路径或者配置文件的方式去管理.
```javascript
const apiDirectory = `${process.cwd()}/app/api`
    requireDirctory(module, apiDirectory,{
      visit:whenLoadModule
    })
// 这里我们通过process.cwd()获取当前项目的根目录地址，然后结合ES6的字符串模板写法形成目标目录地址
```

#### 参数获取
- 请求路径传参
- 请求参数传参
- header传参
- body请求体传参
```javascript
1. '/v1/:param/classic/latest'
2. 'v1/classic/latest?param='
```
- 示例
```javascript
// 需要在app.js中导入koa-bodyparser
const parser = require('koa-bodyparser')
app.use(parser())

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
```
```javascript
// 返回结果
{ id: '3' }
[Object: null prototype] { param: '857' }
{
  'content-type': 'application/json',
  token: '123123123',
  'user-agent': 'PostmanRuntime/7.26.5',
  accept: '*/*',
  'cache-control': 'no-cache',
  'postman-token': 'xxx',
  host: 'localhost:3000',
  'accept-encoding': 'gzip, deflate, br',
  connection: 'keep-alive',
  'content-length': '14'
}
{ key: 'will' }
```
*需要注意参数校验* 如WTForms
- 防止非法的参数
- 给客户端明确的提示

#### 异常处理
- 没有发生异常 正确返回结果
  - 无异常 执行后不需要返回结果
- 发生了异常

##### 函数异常设计
- 在函数内部中判断出异常, return false或者null
- throw new Error
```javascript
function func3() {
  try {
    1/0  // 1/0在javascript中不是错误
  } catch (error) {
    throw error 
  }
  return 'success' // func3()执行结果为 success
}
```
try-catch在大部分时候是对同步有效的,在异步中无效.所以思路可以是将异步的异常都用aysnc和await进行包裹，从而使的异步编程同步，此时可以结合try-catch使用.
```javascript
async function func2() {
  try {
    await func2()  
  } catch (error) {
    console.log('error') // 此时会打印 error
  }  
}

function func3() {
  return new Promise(function (resolve, reject) {
    const r = Math.random();
    if(r<0.5) {
      reject('error')
    }
  })
}
```
我们需要保证异常的触发出返回为promise
*unhandled promise*报错表示代码中有promise报异常但是没有处理
##### 全局异常处理
设计一种机制，监听所有函数的异常
##### AOP 面向切面编程
```javascript
const catchError = async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    ctx.body = '服务器有点问题，你等一下'
  }
}

app.use(catchError)
```
### error说明与设计
error需要简化清晰传递给前端
- HTTP status code 2xx 4xx 5xx
- error_code 详细的信息由开发者自定义
- request_url 当前请求的url

错误分类
- 已经型错误 可以主动判断的错误
- 未知型错误 程序潜在错误

```javascript
router.post("/v1/:id/classic/latest", (ctx, next)=> {
  const path =  ctx.params
  const query = ctx.request.query
  const headers = ctx.request.header 
  const body = ctx.request.body
  if(true) {
    const error = new Error('错误信息')
    error.errorCode = 10001
    error.status = 400
    error.requestUrl = `${ctx.method} ${ctx.path}`
    throw error
  }
  
  ctx.body = {
    key:"classic"
  }
}

// 全局异常处理
const catchError = async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    if(error.errorCode) {
      ctx.body = {
        mgs: error.message,
        error_code: error.errorCode,
        request_url: error.requestUrl
      }
      ctx.status = error.status // 设置返回的code
    }
  }
}

// Postman返回
{
    "mgs": "错误信息",
    "error_code": 10001,
    "request_url": "POST /v1/3/classic/latest"
}
```

#### 异常类的封装
```javascript
class HttpException extends Error {
  constructor(msg="服务器异常", errorCode=10000, code=400) {
    super()
    this.errorCode = errorCode
    this.code = code
    this.msg = msg
  }
}

module.exports = {
  HttpException
}
```

#### 业务模块的构建
##### 用户系统
- 通用性
- 针对小程序
一般，用户系统包括
- 账号
- 密码
- 附属信息
  - email
  - 年龄等

#### 数据库
- 关系型数据库
  - MS SQLServer
  - Oracle
  - PostgresSQL
  - MySQL
- 非关系型数据库
  - Redis: key-value型
  - MongoDB: 文档型数据库
持久存储数据，写数据的过程即持久化

主键不能重复，不能为空;需要是数字的,不建议是字符串，尤其是随机字符串(比如GUID).但需要注意并发的情况.自增的情况可能会泄露.我们需要做到的是即使别人知道编号,也可以保护用户的资料.

#### ORM
Sequelize 连接数据库 配置数据库的参数
```javascript
const Sequelize = require('sequelize')

const sequelize = new Sequelize(dbName, user, passwaord, JS对象)

const sequelize = new Sequelize(dbName, user, password, {
  // dislect 指定数据库的类型
  dislect: 'mysql',
  host,
  port,
  logging:true,
  timezone:'xxx',
  define: {

  }
})

module.exports = {
  db:sequelize
}
```

#### Model层
```javascript
const {db} = require('../../core/db')

const {Sequelize, Model} = require('sequelize')

class User extends Model {

}

User.init({
  id:{
    type:Sequelize.INTEGER,
    primaryKey:true,
    autoIncrement: true
  },
  nickname:Sequelize.STRING,
  email:Sequelize.STRING,
  password:Sequelize.STRING,
  openid:{
    type:Sequelize.STRING(64),
    unique:true
  }
},{sequelize})
```

#### 编写API的思维方式
- 接受那些参数
- 进行参数校验

#### 中间件的坑
中间件是静态方式,在app启动时候实例化一次,全局唯一;后面属性如果变化,后面就会数据错乱.所以轻易我们不要以*类*的形式组织中间件.

#### 密码加密
```javascript
//盐值的大小一般代表密码破解的难度
const salt = bcrypt.genSaltSync(10)
//不同的用户的相同密码生成的密码都会不同以防范彩虹攻击
```

#### jwt Token
```javascript
// 生成Token
// scope 用户权限
const generateToken = function (uid, scope) {
  const { secretKey } = global.config.security
  const { expiresIn } = global.config.security
  const token = jwt.sign({
    uid,
    scope,
  }, secretKey, {
    expiresIn,
  })
  return token
}
```

#### 用户权限
```javascript
const basicAuth = require('basic-auth')
const jwt = require('jsonwebtoken')
class Auth {
  constructor(level) {
    this.level = level || 1
    Auth.USER = 8
    Auth.ADMIN = 16
    Auth.SUPER_ADMIN = 32
  }

  get m() {
    return async (ctx, next) => {
      // token 检测
      // HttpBasicAuth
      const userToken = basicAuth(ctx.req)
      let errMsg = 'token不合法'
      if(!userToken || !userToken.name) {
        throw new global.errs.Forbidden(errMsg)
      }
      try {
        var decode = jwt.verify(userToken.name, global.config.security.secretKey)
      } catch (error) {
        // token不合法 token过期
        if(error.name == 'TokenExpiredError') {
          errMsg = 'token令牌过期'
        }
        throw new global.errs.Forbidden(errMsg)
      }
      if(decode.scope < this.level) {
        errMsg = '权限不足'
        throw new global.errs.Forbidden(errMsg)
      }      
      
      ctx.auth = {
        uid: decode.uid,
        scope: decode.scope
      }

      await next()
    }
  }
}

module.exports = {
  Auth
}
```

#### 业务逻辑
- 在API接口编写
- Model 分层编写(MVC)
#### 业务分层
 - 简单项目Model
 - Model+Service
 - Java: Model+DTO