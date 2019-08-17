// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  await db.collection('userRoundDetail').doc(event.id).remove()
  return {
    code:1,
    msg:'退还成功'
  }
}