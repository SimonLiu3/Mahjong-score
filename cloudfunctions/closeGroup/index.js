// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  await db.collection('group').where({
    _id: event.groupId
  }).update({
    data: {
      deleted: true
    }
  })
  return {
    code: 0
  }
}