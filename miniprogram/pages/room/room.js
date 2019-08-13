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
    roundDetail: {},
    groupInfo: {},
    groupId: '',
    groupCreateTime: null,
    navScrollLeft: 0,
    windowHeight: '',
    windowWidth: '',
    sendScoreModal : false,
    score:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    console.log("currentGroupInfo:"+currentGroupInfo._id)
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
          console.log('userList:'+res.result)
          self.setData({
            userList: res.result
          })
        }
      }),
        wx.cloud.callFunction({
          name: 'getRound',
          data: {
            groupId: currentGroupInfo._id
          },
          success(res) {
            self.setData({
              roundList: res.result
            })
          },
          complete() {
            getApp().hideLoading(self)
          }
        })
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
        roundDetail: {
          sortNo: index,
        }
      })
    }
  },
  showScore(event) {
    this.setData({
      score:'',
      sendScoreModal: true,
    })
  },
  onShareAppMessage: function () {
    const { groupInfo } = this.data
    const userInfo = app.globalData.userInfo
    if (getApp().globalData.isEscape) {
      return {
        title: `${userInfo.nickName}邀你加入【${groupInfo.name}】一起计分，快加入吧 (๑>◡<๑) `,
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
  sendSuccess(event){
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
            roundId:self.roundList[currentRoundIndex]._id
          },
          success(res) {
            self.setData({
              score: '',
              newBillModal: false
            })
            wx.cloud.callFunction({
              name: 'getUserRoundDetaill',
              data: {
                groupId: self.data.groupId,
                roundId: self.roundList[currentRoundIndex]._id
              },
              success(res) {
                self.setData({
                  roundDetail: res.result
                })
              }
            })
          },
          fail(error) {
            // console.log('错误', error)
          }
        })
      }
    } else {
      this.setData({
        sendScoreModal: false
      })
    }
  }

})