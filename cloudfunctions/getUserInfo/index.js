// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const { OPENID } = cloud.getWXContext()
  const user = await db.collection('userInfo')
  .where({
    _openid: OPENID
  })
  .get()
  
  return {
    userInfo: user,
    code: 0
  }
}