// pages/main/main.js
import Dialog from '../dist/dialog/dialog'
import Notify from '../dist/notify/notify'
const app = getApp()
const CURRENT_ACTIVE_TABBAR = 0
Page({
  data: {
    groupList: [],
    newGroupModal: false,
    groupName: '',
    statusBarHeight: getApp().globalData.statusBarHeight,
    screenWidth: getApp().globalData.screenWidth,
    supportDesk: false,
    userInfo:getApp().globalData.userInfo,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this
    wx.getSetting({
      success(settingRes) {
        // 已经授权
        if (settingRes.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success(infoRes) {
              self.setData({
                userInfo:infoRes.userInfo,
              })
            }
          })
        }
      }
    })
  },
  
  onShow: function () {
    this.getTabBar().init();
    this.getGroup()
  },
  onRefresh(){
    //在当前页面显示导航条加载动画
    wx.showNavigationBarLoading(); 
    //显示 loading 提示框。需主动调用 wx.hideLoading 才能关闭提示框
    wx.showLoading({
      title: '刷新中...',
    })
    this.getGroup();
  },
  onPullDownRefresh: function () {
    //调用刷新时将执行的方法
    this.onRefresh();
  },
  getGroup() {
    const self = this
    wx.cloud.callFunction({
      name: 'getGroup',
      data: {},
      success(res) {
        self.setData({
          groupList: res.result
        })
      },
      complete() {
        //隐藏loading 提示框
        wx.hideLoading();
        //隐藏导航条加载动画
        wx.hideNavigationBarLoading();
        //停止下拉刷新
        wx.stopPullDownRefresh();
      }
    })
  },
  goToGroupDetail(event) {
    app.globalData.currentGroupInfo = event.currentTarget.dataset.group
    wx.navigateTo({
      url: `/pages/room/room`
    })
  },
  onGroupModalClose() {
    this.setData({
      newGroupModal: false
    })
  },
  showNewGroupModal() {
    this.setData({
      newGroupModal: true
    })
  },
  callNewGroup(event) {
    if (event.detail === 'confirm') {
      // 异步关闭弹窗
      const self = this
      if (this.data.groupName === '') {
        Notify({
          text: '起个名字吧',
          duration: 1500,
          selector: '#notify-selector',
          backgroundColor: '#dc3545'
        })
        self.setData({
          newGroupModal: true
        })
        self.selectComponent("#new-group-modal").stopLoading()
        return
      }
      wx.cloud.callFunction({
        name: 'createGroup',
        data: {
          groupName: this.data.groupName,
          supportDesk: this.data.supportDesk
        },
        success() {
          self.setData({
            groupName: '',
            newGroupModal: false
          })
          Notify({
            text: '新建成功',
            duration: 1500,
            selector: '#notify-selector',
            backgroundColor: '#28a745'
          })
          self.getGroup()
        }
      })
    } else {
      this.setData({
        newGroupModal: false
      })
    }
  },
  onGroupNameChange(event) {
    this.setData({
      groupName: event.detail
    })
  },
  onShareAppMessage: function () {
    return {
      title: getApp().globalData.shareWord(),
      path: getApp().globalData.sharePath,
      imageUrl: getApp().globalData.imageUrl
    }
  },
  onChange: function ({ detail }) {
    this.setData({ supportDesk: detail });
  },
  goToLogin:function(){
    wx.navigateTo({
      url: `/pages/login/login`
    })
  },
})