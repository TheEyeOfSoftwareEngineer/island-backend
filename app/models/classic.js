// image // title // pubdate // content // fav_counts // type

const {sequelize} = require('../../core/db')
const { Sequelize, Model } = require("sequelize")

const classicFields = {
  image: Sequelize.STRING,
  content: Sequelize.STRING,
  pubdate: Sequelize.DATEONLY,
  fav_nums: Sequelize.INTEGER,
  title: Sequelize.STRING,
  type: Sequelize.TINYINT
}

class Movie extends Model {

}

Movie.init(classicFields, {
  sequelize,
  tableName:'movie'
})

class Sentence extends Model {

}

Sentence.init(classicFields, {
  sequelize,
  tableName:'sentence'
})


class Music extends Model {

}

const musicfileds = Object.assign({
  url: Sequelize.STRING
}, classicFields)

Music.init(musicfileds, {
  sequelize,
  tableName:'movie'
})

module.exports = {
  Movie,
  Sentence,
  Music
}