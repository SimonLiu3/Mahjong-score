// pages/room/room.js
import { parseTime } from '../../utils/parseTime.js'
import Dialog from '../dist/dialog/dialog'
import Notify from '../dist/notify/notify'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roundList: [],
    userList: [],
    currentRoundIndex: 0,
    roundDetail: [],
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
    autoInputScore:false,
    userScoreList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      openid: getApp().globalData.openid
    })
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getData()
  },
  getData() {
    const self = this
    const { currentGroupInfo } = getApp().globalData
    app.showLoading(self)
    if (currentGroupInfo) {
      self.setData({
        groupInfo: currentGroupInfo,
        groupCreateTime: parseTime(currentGroupInfo.createTime, '{y}-{m}-{d}')
      })
      wx.cloud.callFunction({
        name: 'getGroupUserList',
        data: {
          groupId: currentGroupInfo._id
        },
        success(res) {
          self.setData({
            userList: res.result
          })
          wx.cloud.callFunction({
            name: 'getRound',
            data: {
              groupId: currentGroupInfo._id
            },
            success(res) {
              self.setData({
                roundList: res.result,
                currentRoundIndex: 0
              })
              self.getDetail()
              if(currentGroupInfo.deleted){
                self.getTotal()
              }
            },
            complete() {
              getApp().hideLoading(self)
            }
          })
        }
      }),
      this.setData({
        groupId: currentGroupInfo._id
      })
    }
  },
  selectRound(event) {
    const self = this
    let index = event.currentTarget.dataset.current;
    if (this.data.currentRoundIndex == index) {
      return false;
    } else {
      const singleNavWidth = this.data.windowWidth / 5;
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
      autoInputScore:true
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
            self.getDetail()
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
    wx.cloud.callFunction({
      name: 'getUserRoundDetail',
      data: {
        groupId: self.data.groupId,
        roundId: self.data.roundList[self.data.currentRoundIndex]._id
      },
      success(res) {
        let datas = res.result
        datas.map(item => {
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
          return item;
        })
        self.setData({
          roundDetail: datas
        })
      }
    })
  },
  nextRound() {
    let self = this
    let sortNo = this.data.roundList[this.data.currentRoundIndex].sortNo + 1
    let currentRoundIndex = this.data.currentRoundIndex + 1
    console.log("sortNo", sortNo)
    console.log("currentRoundIndex", currentRoundIndex)
    wx.cloud.callFunction({
      name: 'nextRound',
      data: {
        groupId: self.data.groupId,
        sortNo: sortNo
      },
      success(res) {
        console.log("code:" + res.result.code)
        wx.cloud.callFunction({
          name: 'getRound',
          data: {
            groupId: self.data.groupId,
          },
          success(res) {
            self.setData({
              roundList: res.result,
              currentRoundIndex: currentRoundIndex
            })
            self.getDetail()
          },
        })
      }
    })
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
          self.getDetail()
        }
      })
    })
  },
  endGame(){
    let self = this
    wx.cloud.callFunction({
      name:'closeGroup',
      data:{
        groupId:self.data.groupId
      },
      success(res){
        self.getTotal()
        let temp = self.data.groupInfo
        temp.deleted = true
        self.setData({
          groupInfo:temp
        })
      }
    })
  },
  getTotal(){
    let self = this;
    wx.cloud.callFunction({
      name:'getTotal',
      data:{
        groupId:self.data.groupId
      },
      success(res){
        let datas = res.result
        datas.map(item => {
          self.data.userList.forEach(user => {
            if (user._openid == item.userId) {
              item.nickName = user.nickName
              item.avatarUrl = user.avatarUrl
            }
          });
          return item;
        })
        self.setData({
          userScoreList: datas
        })
      }
    })
  }

})