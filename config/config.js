module.exports = {

  // prod
  environment:'dev',
  database: {
    dbName:'islandback',
    host:'localhost',
    port:3306,
    user:'root',
    password:'1123581321'
  },
  security:{
    secretKey:"@3dsf*&h",
    expiresIn: 60*60*24*30
  },
  wx: {
    appId:'wx92d925c9bfa465a0',
    appSecret: 'f549a28714af13c5ccb010415dcb0356',
    loginUrl: 'https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code' 
  }
 
}