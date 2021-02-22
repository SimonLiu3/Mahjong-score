// custom-tab-bar/index.js
Component({
  data: {
    active: 0,
    list: [
      {
        "url": "/pages/main/main",
        "icon": "home",
        "text": "首页"
      },
      {
        "url": "/pages/personal/personal",
        "icon": "contact",
        "text": "我的"
      }
    ]
    },
    methods: {
     onChange(e) {
        console.log(e,'e')
        this.setData({ active: e.detail });
        wx.switchTab({
          url: this.data.list[e.detail].url
        });
     },
     init() {
         const page = getCurrentPages().pop();
         this.setData({
        　  active: this.data.list.findIndex(item => item.url === `/${page.route}`)
         });
        }
     }
});
