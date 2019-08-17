// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let userIdList = await db.collection('userGroup').where({
    groupId:event.groupId
  }).field({
    userId:true
  }).get()
  if(userIdList.data.length){
    let userIds = []
    for (let item of userIdList.data){
      console.log('userId:'+item.userId)
      userIds.push(item.userId)
    }
    let userInfoList = await db.collection('userInfo').where({
      _openid: _.in(userIds)
    }).get()
    return userInfoList.data
  }else{
    return []
  }

}