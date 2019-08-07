// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const openId = cloud.getWXContext().OPENID
  const containGroup = await db.collection('userGroup').where({
    userId: openId,
    groupId: event.groupId
  }).get()
  if (containGroup.data.length) {
    return {
      msg: '你已在该组内，即将跳转至组页面',
      code: 0
    }
  } else {
    await db.collection('userGroup').add({
      data: {
        groupId: event.groupId,
        userId: openId,
        invalid: false
      }
    })
  }
  return {
    msg: '加入成功',
    code: 1
  }
}