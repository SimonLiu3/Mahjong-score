// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const round = db.collection('round').where({
    groupId: event.groupId,
    sortNo: event.sortNo
  }).get()
  if (round.data.length = 0) {
    await db.collection('round').add({
      data: {
        groupId: event.groupId,
        sortNo: event.sortNo,
        createTime: new Date()
      }
    })
  }
}