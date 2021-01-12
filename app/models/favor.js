const {sequelize} = require('../../core/db')
const { Sequelize, Model } = require("sequelize")
const { Art } = require('./art')

class Favor  extends Model {
  // 业务表 而不是实体表 表示业务的状态
  static async like(art_id, type, uid) {
    // 需要使用事务保证两张表中点赞数的一致性
    const favor = await Favor.findOne({
      where: {
        art_id,
        type,
        uid
      }
    })
    if(favor) {
      throw new global.errs.LikeError()
    }
    return sequelize.transaction(async t=> {
      await Favor.create({
        art_id,
        type,
        uid
      }, {transaction: t})
      const art = await Art.getData(art_id, type)
      await art.increment('fav_nums', {by:1, transaction: t})
    })
    // favor添加记录
    // 修改classic中的实体的点赞数

  }

  static async dislike(art_id, type, uid) {
    const favor = await Favor.findOne({
      where: {
        art_id,
        type,
        uid
      }
    })
    if(!favor) {
      throw new global.errs.DislikeError()
    }
    return sequelize.transaction(async t=> {
      await favor.destroy({
        force: true,
        transaction: t
      })
      const art = await Art.getData(art_id, type)
      await art.decrement('fav_nums', {by:1, transaction: t})
    })
  }

  static async userLikeIt(art_id, type, uid) {
    const favor = await Favor.findOne({
      where: {
        uid,
        art_id,
        type,
      }
    })
    return favor ? true : false
  }

  
}

Favor.init({
  uid: Sequelize.INTEGER,
  art_id: Sequelize.INTEGER,
  type: Sequelize.INTEGER
}, {
  sequelize,
  tableName: 'favor'
})

module.exports = {
  Favor
}