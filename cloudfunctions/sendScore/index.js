// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  const score = event.score
  const detailList = await db.collection('userRoundDetail').where({
    groupId: event.groupId,
    roundId: event.roundId,
  }).get()
  if (detailList.data.length) {
    for (let item of detailList.data) {
      if (item.sendUserId == openId && item.receiveUserId == event.receiveUserId) {
        if (item.score * 1 >= score * 1) {
          return {
            code: 1,
            msg: '提交失败，重给分数不能小于之前的分数'
          }
        } else {
          // 修改分数
          await db.collection('userRoundDetail').where({
            groupId: event.groupId,
            roundId: event.roundId,
            sendUserId: openId,
            receiveUserId: event.receiveUserId
          }).update({
            data: {
              score: score,
              updateTime: new Date()
            }
          })
          return {
            code: 0,
            msg: '提交成功'
          }
        }
      }
    }
  }
  // 添加记录
  await db.collection('userRoundDetail').add({
    data: {
      groupId: event.groupId,
      roundId: event.roundId,
      sendUserId: openId,
      receiveUserId: event.receiveUserId,
      score: score,
      updateTime: new Date()
    }
  })

  return {
    code: 0,
    msg: '提交成功'
  }
}