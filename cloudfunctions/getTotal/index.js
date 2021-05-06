// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const MAX_LIMIT = 100
  let userList = await db.collection("userGroup").where({
    groupId: event.groupId
  }).get()

  let countResult = await db.collection('userRoundDetail').where({
    groupId: event.groupId
  }).count()
  let total = countResult.total
  let batchTimes = Math.ceil(total / 100)
  let roundList = []
  for (let i = 0; i < batchTimes; i++) {
    let tempList = await db.collection('userRoundDetail').where({
      groupId: event.groupId
    }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    roundList = roundList.concat(tempList.data)
  }

  let userDetailList = []
  for (let item of userList.data) {
    let detail = {}
    detail.userId = item.userId
    detail.totalScore = 0;
    detail.totalNum = 0;
    userDetailList.push(detail)
  }

  let deskDetail = {}
  deskDetail.userId = "TaiBanUserId"
  deskDetail.totalScore = 0;
  deskDetail.totalNum = 0;
  debugger
  if (roundList.length) {
    let roundIdList = []
    for (let item of roundList) {
      // 玩家信息
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
      // 台板信息
      if (item.receiveUserId == deskDetail.userId) {
        deskDetail.totalScore = deskDetail.totalScore * 1 + item.score * 1
        deskDetail.totalNum = deskDetail.totalNum * 1 + 1
      }
    }
  }
  // 排序
  userDetailList == [] ? userDetailList : userDetailList.sort((a, b) => a.totalScore < b.totalScore ? 1 : -1)
  // 返回数据
  let detailInfo = {}
  detailInfo.userDetailList = userDetailList
  detailInfo.deskDetail = deskDetail
  return detailInfo
}