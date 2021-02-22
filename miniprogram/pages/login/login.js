// pages/login/login.js
const app = getApp()
import Notify from '../dist/notify/notify'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    backPath: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.hasOwnProperty("back")) {
      this.setData({
        backPath: options.back
      })
    }
  },
  onGotUserInfo (event) {
    const { backPath } = this.data
    // 确认获取到用户信息
    if (event.detail.errMsg === 'getUserInfo:ok') {
      const userInfo = event.detail.userInfo
      app.globalData.userInfo = userInfo
      wx.cloud.callFunction({
        name: 'addOrUpdateUser',
        data: {
          info: userInfo
        }
      })
      // wx.redirectTo({
      //   url: `${backPath === '' ? '../../custom-tab-bar/index' : `/pages/${backPath}/${backPath}`}`
      // })
      wx.switchTab({  
        url: '/pages/main/main'  
      }); 
    } else {
      // 加入提示
      Notify({
        text: "需要获取基本信息，请再次点击登录",
        duration: 1500,
        selector: '#login-tips',
        backgroundColor: '#dc3545'
      });
    }
  },
  cancelLogin(event){
    const { backPath } = this.data
    wx.switchTab({  
      url: '/pages/main/main'  
    }); 
  }
})