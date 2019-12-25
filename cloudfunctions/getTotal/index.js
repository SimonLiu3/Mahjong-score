// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let userList = await db.collection("userGroup").where({
    groupId: event.groupId
  }).get()

  let roundList = await db.collection('userRoundDetail').where({
    groupId: event.groupId
  }).get()

  let userDetailList = []
  for (let item of userList.data) {
    let detail = {}
    detail.userId = item.userId
    detail.totalScore = 0;
    detail.totalNum = 0;
    userDetailList.push(detail)
  }


  if (roundList.data.length) {
    let roundIdList = []
    for (let item of roundList.data) {
      for (let detail of userDetailList) {
        if (item.sendUserId == detail.userId) {
          detail.totalScore = detail.totalScore * 1 - item.score * 1
        } else if (item.receiveUserId == detail.userId) {
          detail.totalScore = detail.totalScore * 1 + item.score * 1
          if (roundIdList.indexOf(item.roundId) == -1) {
            detail.totalNum = detail.totalNum * 1 + 1
            roundIdList.push(item.roundId)
          }
        }
      }
    }
  }

  return userDetailList == [] ? userDetailList : userDetailList.sort((a, b) => a.totalScore < b.totalScore ? 1 : -1)
}