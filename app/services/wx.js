const util = require('util')
const axios = require('axios')

const {User} =  require('../models/user')
const {generateToken} = require('../../core/util')
const {Auth} = require('../../middlewares/auth')


class WXManager {
  static async codeToToken(code) {
    //小程序不需要email password
    //小程序发code给服务端 然后服务端向微信服务 后者返回openid给服务端
    // code appid appsecret
    const url = util.format(global.config.wx.loginUrl,
      global.config.wx.appId,
      global.config.wx.appSecret,
      code)
    console.log(url)  
    const result = await axios.get(url)  
    console.log(result.data)
    if(result.status !== 200) {
      throw new global.errs.AuthFailed('opneid获取失败')
    }
    const errcode = result.data.errcode
    if(errcode !== 0) {
      throw new global.errs.AuthFailed('opneid获取失败:' + errcode)
    }
    let user = await User.getUserByOpenid(result.data.openid)
    if(!user) {
      user = await User.registerByOpenid(result.data.openid)
    }

    return generateToken(user.id, Auth.User)
  }
}

module.exports = {
  WXManager
}