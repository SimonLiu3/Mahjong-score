//app.js
App({
  globalData: {
    openid:'',
    userInfo: null,
    isLoading: false,
    isEscape: true,
    shareWord: function() {
      return `你的好友${this.userInfo.nickName}在用这个计分，你也来试试吧 (๑>◡<๑) `
    },
    sharePath: '/pages/main/main',
    skin: {
      colorList: [
        {
          bg0: '#F2F2F2',
          type: 'white-skin'
        }
      ],
      index: 0
    }
  },
  onLaunch: function (options) {
    const self = this
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // 此处请填入环境 ID, 环境 ID 可打开云控制台查看
        env: 'mahjong-dev-0uz5g',
        traceUser: true,
      })
    }
    // 判断是否在审核期间
    const nowTime = Date.parse(new Date())
    if (nowTime < 1563595200000) {
      this.globalData.isEscape = false
    }
    // 获取手机信息以配置顶栏
    wx.getSystemInfo({
      success: res => {
        this.globalData.statusBarHeight = res.statusBarHeight
        this.globalData.navBarHeight = 44 + res.statusBarHeight
        this.globalData.screenWidth = res.screenWidth
      }
    })
    this.globalData.shareParam = options.query
  
    // 获取openid
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        this.globalData.openid = res.result.openid
      },
    })
   
    // 查看是否授权
    wx.getSetting({
      success(settingRes) {
        // 已经授权
        if (settingRes.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success(infoRes) {
              self.globalData.userInfo = infoRes.userInfo
              if (self.catchUserInfo) {
                self.catchUserInfo(infoRes.userInfo)
              }
              // 如果是旧用户就更新信息
              wx.cloud.callFunction({
                name: 'addOrUpdateUser',
                data: {
                  info: infoRes.userInfo
                }
              })
            }
          })
        } else {
          wx.reLaunch({
            url: `/pages/login/login?back=${options.path.split('/')[1]}`
          })
        }
      }
    })
  },
  showLoading(target) {
    const nav = target.selectComponent('.nav-instance')
    nav.showLoading()
  },
  hideLoading(target) {
    const nav = target.selectComponent('.nav-instance')
    nav.hideLoading()
  },
})
