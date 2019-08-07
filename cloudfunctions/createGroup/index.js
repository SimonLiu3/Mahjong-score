// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = (event, context) => {
  const openId = cloud.getWXContext().OPENID
  db.collection('group').add({
    data: {
      name: event.groupName,
      createBy: openId,
      createTime: new Date(),
      deleted: false,
      updateTime: new Date(),
      num:1
    }
  })
  .then(res => {
    db.collection('userGroup').add({
      data: {
        groupId: res._id,
        userId: openId,
        invalid: false
      }
    }),
    // 创建第一轮
    db.collection('round').add({
      data: {
        groupId: res._id,
        sortNo: 1,
        createTime: new Date()
      }
    })
  })
}