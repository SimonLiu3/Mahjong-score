// pages/share/share.js
import Notify from '../dist/notify/notify'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inviteInfo: {},
    loading: false,
    isEscape: getApp().globalData.isEscape,
    theme: 'white-skin'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('groupId:'+options.groupId)
    if (!getApp().globalData.isEscape) {
      wx.redirectTo({
        url: '/pages/main/main'
      })
    }
    if (options.hasOwnProperty('groupId')) {
      this.setData({
        inviteInfo: options
      })
    } else if (app.globalData.shareParam) {
      this.setData({
        inviteInfo: app.globalData.shareParam
      })
    }
    this.joinGroup()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // getApp().setTheme(this)
  },
  joinGroup () {
    const { inviteInfo } = this.data
    const self = this
    self.setData({
      loading: true
    })
    wx.cloud.callFunction({
      name: 'jointGroup',
      data: {
        groupId: inviteInfo.groupId
      },
      success (joinRes) {
        // 加入提示
        Notify({
          text: `${joinRes.result.msg}`,
          duration: 1500,
          selector: '#join-tips',
          backgroundColor: `${joinRes.result.code === 1 ? '#28a745' : '#dc3545'}`
        });
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/main/main',
          })
        }, 2000)
      },
      complete() {
        self.setData({
          loading: false
        })
      }
    })
  }
})