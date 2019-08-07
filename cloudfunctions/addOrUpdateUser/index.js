// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event) => {
  const db = cloud.database()
  const { OPENID } = cloud.getWXContext()
  const userInfo = event.info
  try {
    // 查询有没用户数据
    const user = await db.collection('userInfo').where({
      _openid: OPENID
    }).get()

    // 如果有数据，就更新，没有就新插入一条数据
    if (user.data.length) {
      await db.collection('userInfo').where({
        _openid: OPENID
      }).update({
        data: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          gender: userInfo.gender,
          updateTime: new Date()
        }
      })
    } else {
      await db.collection('userInfo').add({
        data: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          gender: userInfo.gender,
          updateTime: new Date(),
          createTime: new Date(),
          _openid: OPENID
        }
      })
    }
  } catch (e) {
    return {
      message: e.message,
      code: 1,
    }
  }

  return {
    message: 'login success',
    code: 0
  }

}