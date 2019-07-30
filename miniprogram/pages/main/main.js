const app = getApp()

// pages/main/main.js
Page({

  /**
   * 页面的初始数据
   */
	data: {
		openid: '',
		avatarUrl: '',
		userInfo: '',
	},

  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function () {
		this.onGetOpenid();
	},

	onGetOpenid: function () {
		// 调用云函数
		wx.cloud.callFunction({
			name: 'login',
			data: {},
			success: res => {
				app.globalData.openid = res.result.openid
				this.setData({
					openid: res.result.openid
				})
			},
			fail: err => {
				wx.navigateTo({
					url: '../deployFunctions/deployFunctions',
				})
			}
		})
	},

	onGetUserInfo: function () {
		wx.getSetting({
			success: res => {
				if (res.authSetting['scope.userInfo']) {
					// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框！
					wx.getUserInfo({
						success: res => {
							this.setData({
								avatarUrl: res.userInfo.avatarUrl,
								userInfo: res.userInfo
							})
							this.addUser(res.userInfo)
						}
					})
				}
			}
		})
	},

	addUser: function (userInfo) {
		try {
				wx.cloud.callFunction({
				name: 'userinfoapi',
				data: {
					info: userInfo
				}
			})
		} catch (e) {
			console.log(e)
		}
	}

})