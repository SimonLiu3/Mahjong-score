// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  const detail = await db.collection('userRoundDetail').where({
    sendUserId:openId,
    receiveUserId:event.receiveUserId,
    groupId:event.groupId
  }).get()
  if(detail.data.length > 0){
    await db.collection('userRoundDetail').where({
      _id:detail.data[0]._id
    }).update({
      data:{
        score:event.score
      }
    })
  }else{
    await db.collection('userRoundDetail').add({
      data:{
        sendUserId:openId,
        receiveUserId:event.receiveUserId,
        groupId:event.groupId,
        score:event.score
      }
    })
  }
  return {
    code:1,
    msg:'操作成功'
  }
}