// pages/main/main.js
import Dialog from '../dist/dialog/dialog'
import Notify from '../dist/notify/notify'
const app = getApp()
Page({
	data: {
    groupList: [],
    newGroupModal: false,
    groupName: '',
    statusBarHeight: getApp().globalData.statusBarHeight,
    screenWidth: getApp().globalData.screenWidth,
  },
  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function () {
		
	},

	onShow: function () {
    this.getGroup()
	},
	getGroup() {
    const self = this
    app.showLoading(self)
    wx.cloud.callFunction({
      name: 'getGroup',
      data: {},
      success(res) {
        self.setData({
          groupList: res.result
				})
      },
      complete() {
        app.hideLoading(self)
      }
		})
	},
	goToGroupDetail (event) {
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
          groupName: this.data.groupName
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

})