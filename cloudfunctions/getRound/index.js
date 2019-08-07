// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const openId = cloud.getWXContext().OPENID
  const roundList = await db.collection('round').where({
    groupId: event.groupId
  }).get()
  return roundList.data.sort((a, b) => a.sortNo > b.sortNo ? 1 : -1)
}