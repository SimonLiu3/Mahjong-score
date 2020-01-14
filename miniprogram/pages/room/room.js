// pages/room/room.js
import { parseTime } from '../../utils/parseTime.js'
import Dialog from '../dist/dialog/dialog'
import Notify from '../dist/notify/notify'
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roundList: [],
    userList: [],
    currentRoundIndex: 0,
    roundDetail: [],
    roundDetailList: [],
    groupInfo: {},
    groupId: '',
    groupCreateTime: null,
    navScrollLeft: 0,
    windowHeight: '',
    windowWidth: '',
    sendScoreModal: false,
    score: '',
    receiveUserId: '',
    openid: getApp().globalData.openid,
    autoInputScore: false,
    userScoreList: [],
    showDetail: false,
    taiBanUrl: '/images/taiban.png',
    taiBanScore: 0,
    taiBanNum: 0,
    isNextRound: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { currentGroupInfo } = getApp().globalData
    this.setData({
      openid: getApp().globalData.openid,
      groupInfo: currentGroupInfo,
      groupCreateTime: parseTime(currentGroupInfo.createTime, '{y}-{m}-{d}'),
      groupId: currentGroupInfo._id
    })
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      },
    }),
      this.getUserWatch()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  getUserWatch() {
    let self = this
    const watcher = db.collection('userGroup')
      .where({
        groupId: self.data.groupId
      })
      .watch({
        onChange: function (snapshot) {
          let userIdList = []
          snapshot.docs.forEach(user => {
            userIdList.push(user.userId)
          })
          db.collection('userInfo')
            .where({
              _openid: _.in(userIdList)
            }).get({
              success: function (res) {
                self.setData({
                  userList: res.data
                })
                if (snapshot.type == 'init') {
                  self.getRoundWatch()
                  self.getGroupWatch()
                }
              }
            })
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      })
  },
  getGroupWatch: function () {
    let self = this
    const watch = db.collection('group')
      .where({
        _id: self.data.groupId
      })
      .watch({
        onChange: function (snapshot) {
          let groupInfo = self.data.groupInfo
          groupInfo.deleted = snapshot.docs[0].deleted
          self.setData({
            groupInfo: groupInfo
          })
          if (self.data.groupInfo.deleted) {
            self.getTotal()
          }
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      })
  },
  getRoundWatch: function () {
    let self = this
    const watcher = db.collection('round')
      .where({
        groupId: self.data.groupId
      })
      .orderBy('sortNo','asc')
      .watch({
        onChange: function (snapshot) {
          let singleNavWidth = self.data.windowWidth / 5
          let currentRoundIndex = self.data.currentRoundIndex
          if (self.data.isNextRound) {
            currentRoundIndex += 1
          }
          self.setData({
            roundList: snapshot.docs,
            navScrollLeft: (currentRoundIndex - 2) * singleNavWidth,
            currentRoundIndex: currentRoundIndex,
            isNextRound: false
          })
          if (snapshot.type == 'init') {
            self.getRoundDetailWatch()
          }
          self.getDetail()
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      })
  },
  getRoundDetailWatch: function () {
    let self = this
    const watcher = db.collection('userRoundDetail')
      .where({
        groupId: self.data.groupId
      })
      .watch({
        onChange: function (snapshot) {
          self.setData({
            roundDetailList: snapshot.docs
          })
          self.getDetail()
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      })
  },


  selectRound(event) {
    let index = event.currentTarget.dataset.current;
    if (this.data.currentRoundIndex == index) {
      return false;
    } else {
      let singleNavWidth = this.data.windowWidth / 5;
      this.setData({
        currentRoundIndex: index,
        navScrollLeft: (index - 2) * singleNavWidth,
      })
      this.getDetail()
    }
  },
  showScore(event) {
    let userId = event.currentTarget.dataset.user._openid
    if (userId == this.data.openid) {
      return;
    }
    this.setData({
      score: '',
      sendScoreModal: true,
      receiveUserId: userId,
      autoInputScore: true
    })
  },
  showScoreT() {
    this.setData({
      score: '',
      sendScoreModal: true,
      receiveUserId: 'TaiBanUserId',
      autoInputScore: true
    })
  },
  onShareAppMessage: function () {
    const { groupInfo } = this.data
    const userInfo = app.globalData.userInfo
    if (getApp().globalData.isEscape) {
      return {
        title: `${userInfo.nickName}邀你加入【${groupInfo.name}】一起玩耍，快加入吧`,
        path: `/pages/share/share?groupId=${groupInfo._id}&inviter=${userInfo.nickName}&avatarUrl=${userInfo.avatarUrl}&groupName=${groupInfo.name}`,
        imageUrl: getApp().globalData.imageUrl
      }
    }
    return {
      title: getApp().globalData.shareWord(),
      path: getApp().globalData.sharePath,
      imageUrl: getApp().globalData.imageUrl
    }
  },
  sendSuccess(event) {
    let self = this
    if (event.detail === 'confirm') {
      if (this.data.score === '') {
        Notify({
          text: '请输入分数',
          duration: 1500,
          selector: '#notify-selector',
          backgroundColor: '#dc3545'
        })
        self.setData({
          sendScoreModal: true
        })
        self.selectComponent("#send-score-modal").stopLoading()
        return
      } else {
        wx.cloud.callFunction({
          name: 'sendScore',
          data: {
            score: self.data.score,
            groupId: self.data.groupId,
            roundId: self.data.roundList[self.data.currentRoundIndex]._id,
            receiveUserId: self.data.receiveUserId
          },
          success(res) {
            self.setData({
              score: '',
              sendScoreModal: false
            })
            if (res.result.code == 1) {
              Notify({
                text: res.result.msg,
                duration: 1500,
                selector: '#notify-selector',
                backgroundColor: '#dc3545'
              })
            }
          },
          fail(error) {
            console.log('错误', error)
          }
        })
      }
    } else {
      this.setData({
        sendScoreModal: false
      })
    }
  },
  onScoreChange(event) {
    this.setData({
      score: event.detail
    })
  },
  getDetail() {
    let self = this
    let detail = this.data.roundDetailList.filter(function (item) {
      return item.roundId == self.data.roundList[self.data.currentRoundIndex]._id
    })
    detail.sort(function(a,b){
      return a._id > b._id
    })
    detail.map(item => {
      self.data.userList.forEach(user => {
        if (user._openid == item.sendUserId) {
          item.sendNickName = user.nickName
          item.sendUrl = user.avatarUrl
        }
        if (user._openid == item.receiveUserId) {
          item.receiveNickName = user.nickName
          item.receiveUrl = user.avatarUrl
        }
      });
      if (item.receiveUserId == 'TaiBanUserId') {
        item.receiveUrl = self.data.taiBanUrl
      }
      return item;
    })
    self.setData({
      roundDetail: detail
    })
  },
  nextRound() {
    let self = this
    let sortNo = this.data.roundList[this.data.currentRoundIndex].sortNo + 1
    let currentRoundIndex = this.data.currentRoundIndex + 1
    if (currentRoundIndex <= this.data.roundList.length - 1) {
      let singleNavWidth = self.data.windowWidth / 5
      this.setData({
        currentRoundIndex: currentRoundIndex,
        navScrollLeft: (currentRoundIndex - 2) * singleNavWidth,
      })
      this.getDetail()
    } else {
      this.setData({
        isNextRound: true
      })
      wx.cloud.callFunction({
        name: 'nextRound',
        data: {
          groupId: self.data.groupId,
          sortNo: sortNo
        },
        success(res) {

        },
        error(err) {
          this.setData({
            isNextRound: false
          })
        }
      })
    }
  },
  // 退款
  giveBackScore(event) {
    let self = this
    Dialog.confirm({
      message: `确定要退还分数给${event.currentTarget.dataset.round.sendNickName}吗?`,
      selector: '#confirm-delete-detail'
    }).then(() => {
      wx.cloud.callFunction({
        name: 'giveBackScore',
        data: {
          id: event.currentTarget.dataset.round._id
        },
        success() {
          Notify({
            text: '已退还',
            duration: 1500,
            selector: '#notify-selector',
            backgroundColor: '#dc3545'
          });
        }
      })
    })
  },
  endGame() {
    let self = this
    Dialog.confirm({
      message: `确定要结束本局游戏吗?`,
      selector: '#confirm-delete-detail'
    }).then(() => {
      wx.cloud.callFunction({
        name: 'closeGroup',
        data: {
          groupId: self.data.groupId
        },
        success(res) {
          
        }
      })
    })
  },
  getTotal() {
    let self = this;
    wx.cloud.callFunction({
      name: 'getTotal',
      data: {
        groupId: self.data.groupId,
      },
      success(res) {
        let datas = res.result
        datas.userDetailList.map(item => {
          self.data.userList.forEach(user => {
            if (user._openid == item.userId) {
              item.nickName = user.nickName
              item.avatarUrl = user.avatarUrl
            }
          });
          return item;
        })
        self.setData({
          userScoreList: datas.userDetailList
        })
        if (self.data.groupInfo.supportDesk) {
          self.setData({
            taiBanScore: datas.deskDetail.totalScore,
            taiBanNum: datas.deskDetail.totalNum
          })
        }
      }
    })
  },
  closeDetail() {
    this.setData({
      showDetail: false
    })
  },
  showTotalDetail() {
    this.getTotal()
    this.setData({
      showDetail: true
    })
  }

})