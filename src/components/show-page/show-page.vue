<template>
  <div class="show-page" @click="shareHide($event)">
    <main class="container" id="room">
      <header class="header">
        <div class="header__warp">
          <span @click="back">
            <span>☁️云纸条</span>
          </span>
          <span class="header__warp--living" v-if="true">房间正在直播中</span>
          <span class="header__warp--stopping" v-if="false">当前房间尚未直播...</span>
          <span class="header__warp--sharing" @click.stop="toggleShare" v-show="this.id==='owner'">
            <img src="./sharing.png">
          </span>
          <transition name="share-show">
            <div class="header__warp--dropdown" v-if="shareShow">
              <div class="dropdown--cover">
                <div class="dropdown--container">
                  <p class="dropdown--inviate">快邀请小伙伴加入房间吧！</p>
                  <p class="dropdown--token">
                    <input type="text" :value="token" id="key">
                  </p>
                  <button class="dropdown--copy" type="button" id="copy" data-clipboard-target="#key">{{tips}}</button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </header>
      <div style="display: flex">
        <div class="chatContainer">
          <div class="video">
            <video ref="video_owner" style="width: 100%" autoplay="true" controls="true" v-if="id==='owner'"
                   id="ownerVideo"></video>
            <video ref="video_host" style="width: 100%" autoplay="true" controls="true" v-if="id==='host'"
                   id="hostVideo"></video>
          </div>
          <div class="chat"
               style="
               position: relative;
               width: 90%;
               height: 400px;
               margin: 50px auto 0;
               border: 1px solid #ededed;
               box-sizing: border-box;
               "
          >
            <div class="get_message"
                 ref="get_message"
                 style="
                 height: 375px;
                 padding: 5px;
                 padding-bottom: 0;
                 margin-bottom: 5px;
                 box-sizing: border-box;
                 overflow-y: auto;
                 font-size: 12px;
                 line-height: 16px;
                 "
            >
              <ul>
                <li v-for="(item,index) in getMessageInfo"
                    :key="index"
                    class="chat-list"
                    :class="{aside:aside(item)}"
                    style="margin: 5px"
                >
                  <h1 class="time">{{item.time}}</h1>
                  <p class="content" style="margin-top: 5px;padding:0 5px">{{item.content}}</p>
                </li>
              </ul>
            </div>
            <div class="send-message"
                 style="
                  position: absolute;
                  bottom: 0;
                  width: 100%;
                  overflow: hidden;
                  box-sizing: border-box;
                  border: 1px solid #ededed;
                  "
            >
              <input
                type="text"
                style="
                   width: inherit;
                   color: #333;
                   font-size: 12px;
                   line-height: 20px;
                   height: 20px;
                   box-sizing: border-box;
                   padding: 2px 30px 2px 5px;
                   background: #fafafa;
                   "
                v-model="sendMessageInfo"
                @keydown.enter.stop="sendMessage"
              />
              <button
                type="button"
                style="
                  position: absolute;
                  top: 2px;
                  right: 0px;
                  width: 30px;
                  height: 16px;
                  line-height: 16px;
                  color: gray;
                  font-size: 12px !important;
                  border-left: 1px solid grey;
                  border-radius: 0;
                  "
                @click="sendMessage"
              >发送
              </button>
            </div>
          </div>
        </div>
        <section class="paint" id="paint">
          <div class="paint-board">
            <section>
              <paper-writter v-if="id==='owner'"
                             ref="paperWritter"
                             :width="1024"
                             :height="670"
                             :type="peaDrawType"
                             :size="toolSize"
                             :color="peaDrawColor"
                             @draw="sendDrawEvent2ServerUseSocket"
              ></paper-writter>
              <paper-reader v-if="this.id==='host'"
                            ref="paperReader"
                            :width="1024"
                            :height="670"
              ></paper-reader>
            </section>
          </div>
          <aside class="paint__tool" v-if="id==='owner'">
            <ul>
              <li @click="adjust($event,'pencil')">
                <img src="./pencil.png">
                <div class="slider__range--container pencil" :class="{active: pencilShow}">
                  <input class="slider__vertical" type="range" min="1" max="6" v-model="toolSize"/>
                  <div class="colorpicker"></div>
                </div>
              </li>
              <li @click="adjust($event,'eraser')">
                <img src="./eraser.png">
                <div class="slider__range--container eraser" :class="{active: eraserShow}">
                  <input class="slider__vertical" type="range" min="1" max="6" v-model="toolSize"/>
                </div>
              </li>
              <li @click="adjust($event,'circle')">
                <img src="./circle.png">
                <div class="slider__range--container" :class="{active: circleShow}">
                  <input class="slider__vertical" type="range" min="1" max="6" v-model="toolSize"/>
                  <div class="colorpicker"></div>
                </div>
              </li>
              <li @click="adjust($event,'rectangle')">
                <img src="./rectangle.png">
                <div class="slider__range--container" :class="{active: rectangleShow}">
                  <input class="slider__vertical" type="range" min="1" max="6" v-model="toolSize"/>
                  <div class="colorpicker"></div>
                </div>
              </li>
              <li @click="peaClearCanvas">
                <img src="./clean.png">
              </li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  </div>
</template>
<script type="text/ecmascript-6">
  import Clipboard from 'clipboard'
  import { Position } from '@/common/js/libs'
  import axios from 'axios'
  import PaperWritter from '../paper/paper-writter.vue';
  import PaperReader from '../paper/paper-reader.vue';
  import serverPath from '@/api/server-path';
  import { urlParse } from '@/common/js/util'
  export default {
    name: 'show-page',
    data () {
      return {
        shareShow: false,
        tips: '点击复制令牌号',
        socket: '',
        pencilShow: false,
        eraserShow: false,
        circleShow: false,
        rectangleShow: false,
        paint: true,
        widthDiff: '',
        toolSize: 1,
        // pea3nut
        peaSocketRec: null,
        peaDrawType: null,
        peaDrawSize: null,
        peaDrawColor: null,
        id: (() => urlParse().id)(),
        token: (() => urlParse().token)(),
        sendMessageInfo: '',
        getMessageInfo: [],
        pc: '',
        media_video: ''
      }
    },
    mounted () {
      window.SHOW_PAGE_VM = this;
      this.socket = io.connect(serverPath);
      this.$nextTick(() => {
        this.media_video = navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });
        this.webRtc();
        // 初始化粘贴板
        this.initCopyBoard();
        // 判断身份
        this.justify();
        // 初始化颜色板
        this.initColorBoard();
        // 初始化聊天室
        this.getMessage();
      })
    },
    computed: {
      PeerConnection () {
        return (window.PeerConnection ||
        window.webkitPeerConnection00 ||
        window.webkitRTCPeerConnection ||
        window.mozRTCPeerConnection);
      }
    },
    methods: {
      // webRTC
      webRtc () {
        let that = this;
        this.pc = new this.PeerConnection();
        //发送ICE候选到其他客户端
        this.pc.onicecandidate = event => {
          that.socket.emit('video', JSON.stringify({
            "event": "__ice_candidate",
            "data": {
              "candidate": event.candidate
            }
          }));
        };
        let sendAnswerFn = desc => {
          that.pc.setLocalDescription(desc);
          that.socket.emit('video', JSON.stringify({
            "event": "__answer",
            "data": {
              "sdp": desc
            }
          }));
        };

        this.socket.on('video', event => {
          console.log('我收到video数据了')
          let json = JSON.parse(event);
          //如果是一个ICE的候选，则将其加入到PeerConnection中，否则设定对方的session描述为传递过来的描述
          if (json.event === "__ice_candidate") {
            that.pc.addIceCandidate(new RTCIceCandidate(json.data.candidate));
          } else {
            that.pc.setRemoteDescription(new RTCSessionDescription(json.data.sdp));
            // 如果是一个offer，那么需要回复一个answer
            if (json.event === "__offer") {
              setTimeout(() => {
                that.pc.createAnswer(sendAnswerFn, error => {
                  console.log('Failure callback: ' + error);
                });
              }, 500)
            }
          }
        })
        this.socket.on('refresh', data => {
          if (that.id === 'owner') {
            console.log('owner刷新')
            that.initOwnerVideo()
          }
        })
      },
      // 聊天aside class
      aside (item) {
        return this.id === item.id;
      },
      getTime () {
        let date = new Date();
        return date.toLocaleTimeString()
      },
      sendMessage () {
        this.socket.emit('chat', {
          id: this.id,
          time: `${this.id} (${this.getTime()})`,
          content: this.sendMessageInfo
        });
        this.sendMessageInfo = ''
      },
      getMessage () {
        const that = this;
        this.socket.on('chat', data => {
          that.getMessageInfo.push(data);
          that.$nextTick(() => {
            let em = that.$refs['get_message'];
            if (em.clientHeight !== em.scrollTop) {
              em.scrollTop = em.clientHeight;
            }
          })
        })
      },
      initOwnerVideo () {
        console.log('初始化一次主人')
        let that = this;
        // let video = this.$refs['video_owner'];
        let video = document.getElementById('ownerVideo')
        // 主动方发送视频流
        this.media_video.then(mediaStream => {
          video.src = window.URL.createObjectURL(mediaStream);
          let sendOfferFn = desc => {
            that.pc.setLocalDescription(desc);
            that.socket.emit('video', JSON.stringify({
              "event": "__offer",
              "data": {
                "sdp": desc
              }
            }));
          };
          that.pc.addStream(mediaStream);
          that.pc.createOffer(sendOfferFn, error => {
            console.log(error)
          });
        });
      },
      initHostVideo () {
        // let video = this.$refs['video_host'];
        let video = document.getElementById('hostVideo')
        // 被动方接受视频流
//        this.socket.on('video', function (data) {
//          video.src = data.msg
//        })
        //如果检测到媒体流连接到本地，将其绑定到一个video标签上输出
        this.pc.onaddstream = event => {
          video.src = URL.createObjectURL(event.stream);
          console.log(video.src)
        };
      },
      peaClearCanvas(){
        this.$refs.paperWritter.clear();
      },
      // 初始化画板
      initColorBoard () {
        for (let em of $('.colorpicker')) {
          $(em).ClassyColor({
            color: '#A98C61',
            colorSpace: 'rgb',
            labels: true,
            staticComponents: true,
            displayColor: 'css',
          }).on('newcolor', (event, data) => {
            this.peaDrawColor = data.toString();
          });
        }
      },
      // 调整画笔和橡皮大小事件
      adjust (event, name) {
        let elt = event.target;
        while (elt.tagName.toLowerCase() !== 'body') {
          if (elt.className.indexOf('slider__range--container') !== -1) {
            return;
          }
          elt = elt.parentNode;
        }

        switch (name) {
          case 'pencil':
            this.peaDrawType = 'pen';
            this.pencilShow = !this.pencilShow;
            this.eraserShow = false;
            this.circleShow = false;
            this.rectangleShow = false;
            break;
          case 'eraser':
            this.peaDrawType = 'eraser';
            this.eraserShow = !this.eraserShow;
            this.pencilShow = false;
            this.circleShow = false;
            this.rectangleShow = false;
            break;
          case 'circle':
            this.peaDrawType = 'ellipse';
            this.circleShow = !this.circleShow;
            this.pencilShow = false;
            this.eraserShow = false;
            this.rectangleShow = false;
            break;
          case 'rectangle' :
            this.peaDrawType = 'rect';
            this.rectangleShow = !this.rectangleShow;
            this.pencilShow = false;
            this.eraserShow = false;
            this.circleShow = false;
            break;
        }
      },
      // 返回主页销毁房间
      back () {
        if (confirm('确定退出房间？')) {
          if (this.id === 'owner') {
            let url = serverPath + '/token/destroy/' + this.token;
            // 销毁房间
            axios.get(url)
          }
          this.socket.disconnect();
          this.$router.push({path: '/'})
        }
      },
      // 分享按钮打开与关闭
      toggleShare () {
        this.shareShow = !this.shareShow;
        setTimeout(() => {
          this.tips = '点击复制令牌号';
        }, 500);
      },
      // 分享界面关闭，监听空白区域
      shareHide (event) {
        if (!this.shareShow) {
          return
        }
        if (event.target.className === 'container' || event.target.parentNode.className === 'write') {
          this.shareShow = false;
          setTimeout(() => {
            this.tips = '点击复制令牌号';
          }, 500)
        }
      },
      // 挂载复制粘贴
      initCopyBoard () {
        let copy = new Clipboard('#copy');
        copy.on('success', () => {
          this.tips = '复制成功，快去分享吧'
        })
      },
      // 向服务器发送数据
      sendDrawEvent2ServerUseSocket(){
        this.socket.emit('message', ...arguments);
      },
      // 判断房主还是宾客
      justify () {
        if (this.id === 'host') {
          let that = this;
          this.socket.on('message', data => {
            that.$refs.paperReader.dispatch(data);
          });
          this.initHostVideo();
        } else {
          this.initOwnerVideo()
        }
      }
    },
    components: {
      'paper-reader': PaperReader,
      'paper-writter': PaperWritter,
    }
  }
</script>
<style scoped>
  #paint > span {
    display: none !important;
  }
</style>
<style lang="stylus" rel="stylesheet/stylus" type="text/stylus" scoped>
  .show-page
    .aside
      text-align right
    button, input
      border none
      outline: none
      background: none
      font-family: 'Open Sans', Helvetica, Arial, sans-serif
    button
      display: block
      margin: 0 auto
      width: 30vw
      height: 36px
      border-radius: 30px
      color: #fff
      font-size: 15px
      font-weight bold
      cursor: pointer
      padding 0
    a, input
      color: #fff
    #room
      &.container
        overflow: hidden
        position: relative
        background: #fff
      .header
        width: 100vw
        background: #d4af7a
        height: 70px
      .header__warp
        max-width: 1024px
        margin: 0 auto
        height: 100%
        position: relative
        span
          line-height: 70px
        & > span
          padding: 0 20px
          font-size: 1.5em
          color: #FAF7F1
      span
        &.header__warp--living
          font-size: .8em
          &::before
            content: ''
            position: relative
            background: green
            width: 10px
            height: 10px
            border-radius: 50%
            display: inline-block
            margin-right: 10px
        &.header__warp--stopping
          font-size: .8em
          &::before
            content: ''
            position: relative
            background: red
            width: 10px
            height: 10px
            border-radius: 50%
            display: inline-block
            margin-right: 10px
        &.header__warp--sharing
          float: right
          height: 40px
          width: 40px
          padding: 0
          border-radius: 50%
          position: absolute
          right: 0
          top: 50%
          transform: translate3d(0, -50%, 0)
          border: 2px solid #FAF7F1
          margin-right: 20px
          box-sizing border-box
          &:hover
            cursor: pointer
            background: rgba(204, 204, 204, 0.4)
            border-color: rgba(255, 255, 255, 1)
          img
            width: 60%
            height: 60%
            position: absolute
            top: 50%
            left: 50%
            transform: translate3d(-55%, -55%, 0)
      div
        .header__warp--dropdown
          transition: all .2s ease-in
          position: absolute
          z-index: 2
          background: white
          border-radius: 5px 5px 5px 5px
          right: 15px
          height: 200px
          width: 400px
          transform-origin 400px 0
          animation show .5s /**
          说明：
            未知原因，入场动画使用vue渲染会卡顿
          解决办法：
            入场动画使用animation
           */
          @keyframes show
            0%
              transform scale(0)
            100%
              transform scale(1)
          &.share-show-leave-active
            transition transform .5s ease-in-out
          &.share-show-leave-active
            transform scale(0)
          .dropdown--cover
            width: 100%
            height: 100%
            border-radius: 5px 5px 5px 5px
            background: rgba(231, 210, 180, 0.5)
          &::before
            position: absolute
            right: 10px
            transform: translate3d(0, -100%, 0)
            content: ''
            border: 15px solid rgba(231, 210, 180, 0.5)
            border-color: transparent transparent rgba(231, 210, 180, 0.5) transparent
      .dropdown--container
        text-align: center
        position: absolute
        width: 400PX
        top: 50%
        left: 50%
        transform: translate3d(-50%, -50%, 0)
        color: #C72
        .dropdown--token
          border: 2px solid white
          border-radius: 5px
          width: 60%
          margin: 19px auto
          line-height: 1.5em
          background: rgba(204, 204, 204, .5)
          color: white
          box-shadow: 0 0 5px #ccc
          box-sizing border-box
          font-weight bold
          #key
            width 100%
            text-align center
        .dropdown--copy
          box-shadow: 0 0 5px white
          background: #d4af7a
          width: 50%
          box-sizing border-box
      .chatContainer
        flex 0 0 251px
        with 251px
      .paint
        min-width: 1024px
        flex 1
        height 100%
        margin 0 0 auto auto
        display: block
        position relative
        z-index: 1
        box-shadow: 0 0 10px rgba(204, 204, 204, 0.5)
        .paint-board
          .read, .write
            display inline-block
            vertical-align top
          .read
            canvas
              margin-top 27px
        .paint__tool
          width: 50px
          background: white
          position: absolute
          right: 20px
          top: 20px
          -webkit-box-shadow: 0 0 15px #ccc
          box-shadow: 0 0 15px #ccc
          opacity: .87
          border-radius: 10px
          ul
            list-style: none
          li
            &:first-child
              border-bottom: 1px solid rgba(204, 204, 204, 0.8)
            &:hover
              cursor: pointer
              background: rgba(204, 204, 204, 0.2)
              img
                animation-duration: 800ms
                animation-name: jump
                animation-timing-function: ease-in-out
                animation-delay: 0
                animation-iteration-count: infinite
            width: 50px
            height: 50px
            img
              width: 30px
              height: 30px
              margin: 10px
              position: relative
              top: 0px;
    @keyframes jump
      33%
        top: 0px
      66%
        top: -8px
      100%
        top: 0px
</style>
<style lang="stylus" rel="stylesheet/stylus" type="text/stylus" scoped>
  #room {
    .paint {
      .paint__tools--cursor {
        transform: translate3d(-50%, -50%, 0);
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        &.pencil {
          display: block;
          width: 20px;
          height: 20px;
          box-shadow: 0 0 10px rgba(204, 204, 204, 0.5);
          background: rgba(200, 200, 200, 0.4);
          border-radius: 50%;
        }
        &.eraser {
          display: block;
          width: 35px;
          height: 35px;
          box-shadow: 0 0 10px rgba(204, 204, 204, 0.5);
          background: rgba(200, 200, 200, 0.4);
          border-radius: 5px 5px 15px 5px;
          transform: translate3d(-50%, -50%, 0) rotate(40deg);
        }
      }
      .paint__tool {
        width: 50px;
        background: white;
        position: absolute;
        right: 20px;
        top: 20px;
        -webkit-box-shadow: 0 0 15px #ccc;
        box-shadow: 0 0 15px #ccc;
        opacity: .87;
        border-radius: 10px;
        ul {
          list-style: none;
        }
        li {
          position: relative;
          &:not(:last-child) {
            border-bottom: 1px solid rgba(204, 204, 204, 0.8);
          }
          &:hover {
            cursor: pointer;
            background: rgba(204, 204, 204, 0.2);
            img {
              animation-duration: 800ms;
              animation-name: jump;
              animation-timing-function: ease-in-out;
              animation-delay: 0; // animation-iteration-count: infinite;
            }
          }
          width: 50px;
          height: 50px;
          img {
            width: 30px;
            height: 30px;
            margin: 10px;
            position: relative;
            top: 0px;
          }
          .slider__range--container {
            position: absolute;
            border-radius: 15px;
            border: 2px solid transparent;
            top: 0px;
            left: -45px;
            height: 231px;
            width: 30px; // background: #DABA8C;
            display none
            .colorpicker {
              position: absolute;
              width: 30px;
              border-radius: 50%;
              height: 30px;
              background: rgba(169, 140, 97, 0.5);
              right: -1px;
              bottom: -7px;
              box-shadow: 0 0 25px #ccc;
              &.ClassyColor {
                font-size: 4px !important;
              }
            }
            &.active {
              display: block;
            }
            &::after {
              position: absolute;
              z-index: -1;
              right: -18px;
              top: 15px;
              content: '';
              border: 10px solid #d4af7a;
              border-color: transparent transparent transparent #d4af7a;
            }
            input[type=range] {
              position: absolute;
              left: -87px;
              top: 82px;
              transform: rotate(90deg);
              -webkit-appearance: none;
              width: 200px;
            }
            input[type=range]:focus {
              outline: none;
            }
            input[type=range]::-webkit-slider-runnable-track {
              width: 100%;
              height: 30px;
              cursor: pointer;
              box-shadow: 0 0 25px #ccc;
              background: #d4af7a;
              border-radius: 15px;
            }
            input[type=range]::-webkit-slider-thumb {
              box-shadow: 0px 0px 5px rgba(0, 0, 62, 0.67), 0px 0px 0px rgba(0, 0, 88, 0.67);
              border: 1.2px solid rgba(204, 204, 204, 0.57);
              height: 30px;
              width: 30px;
              border-radius: 15px;
              background: rgba(255, 255, 255, 0.5);
              cursor: pointer;
              -webkit-appearance: none;
            }
          }
        }
      }
    }
  }
</style>
