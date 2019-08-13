// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  const detailList = await db.collection('userRoundDetail').where({
    groupId: event.groupId,
    roundId: event.roundId,
  }).get()
  const result = []
  if (detailList.data.length > 0) {
    for (let item of detailList.data) {
      if (item.sendUserId == openId || item.receiveUserId == openId) {
        result.push(item)
      }
    }
    if(result.length > 0){
      result = result.sort((a, b) => a.updateTime < b.updateTime ? 1 : -1)
    }
  }
  return result
}