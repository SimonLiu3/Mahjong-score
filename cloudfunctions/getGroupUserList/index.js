// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let userIdList = await db.collection('userGroup').where({
    groupId:event.groupId
  }).field({
    userId:ture
  }).get()
  if(userIdList.data.length > 0){
    let userInfoList = await db.collection('userInfo').where({
      _openid:_.in(userIdList)
    }).orderBy('createTime').get()
    return userInfoList.data
  }else{
    return []
  }

}