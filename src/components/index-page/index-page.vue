<template>
  <main class="container" id="index__roomList" @mousemove="titleShadow">
    <header class="header__container">
      <section class="header__container--title" @mousemove="titleShadow">
        <h1>☁️云纸条</h1>
      </section>
      <section class="button__container">
        <p>快来创建房间和小伙伴一起分享演示吧!</p>
        <button @click.stop="createRoom">创建房间</button>
      </section>
    </header>
    <section class="roomlist__container">
      <ul class="roomlist">
        <li class="roomlist__elem locked" v-for="room in roomList" @click.stop="enterRoom(room.token)">
          <div class="roomlist__elem--logo">
            <img class="room" src="./room.png">
          </div>
          <div class="roomlist__elem--title">
            <p class="room__title">房间{{ room.id }}</p>
          </div>
          <div class="roomlist__elem--lock">
            <img class="lock" src="./right.png">
          </div>
        </li>
        <!--    <li class="roomlist__elem">
               <div class="roomlist__elem--logo">
                   <img class="room" src="./room.png">
               </div>
               <div class="roomlist__elem--title">
                   <p class="room__title">房间一</p>
               </div>
               <div class="roomlist__elem--lock">
                   <img class="lock" src="./right.png">
               </div>
           </li> -->
      </ul>
    </section>
  </main>
</template>
<script type="text/ecmascript-6">
  import axios from 'axios'
  import * as type from '@/store/mutation-types'
  import serverPath from '@/api/server-path'
  export default {
    name: 'index-page',
    data () {
      return {
        roomList: [],
        inputToken: '',
      }
    },
    mounted () {
      let url = serverPath + '/websocket/getrooms';
      setInterval(() => {
        axios.get(url, {
          withCredentials: true
        })
          .then(res => {
            res = res.data;
            if (res.errcode === 0) {
              this.roomList = res.rooms;
            }
          })
      }, 1000)
    },
    methods: {
      enterRoom (token) {
        let url = serverPath + '/websocket/connect/' + token;
        axios.get(url, {
          withCredentials: true
        })
          .then(res => {
            if (res.data.errcode === 0) {
              this.$router.push({path: `/show-page?id=host`})
            } else {
              throw new Erro('error')
            }
          })
          .catch(err => console.error(err))
      },
      createRoom () {
        let url = serverPath + '/token/create';
        axios.get(url, {
          withCredentials: true
        })
          .then(res => {
            res = res.data;
            if (res.errcode === 0) {
              this.$router.push({path: `/show-page?id=owner&token=${res.token}`})
            } else {
              throw new Erro('error')
            }
          })
          .catch(err => console.error(err))
      },
      titleShadow (event) {
        const title = document.querySelector('.container#index__roomList .header__container--title');
        const text = title.querySelector('h1');
        const walk = 60;
        const {
          offsetWidth: width,
          offsetHeight: height
        } = title;
        let {
          offsetX: x,
          offsetY: y
        } = event;
        if (this !== event.target) {
          x = x + event.target.offsetLeft;
          y = y + event.target.offsetTop;
        }
        const xWalk = Math.round((x / width * walk) - (walk / 2));
        const yWalk = Math.round((y / height * walk) - (walk / 2));
        text.style.textShadow = `${yWalk}px ${xWalk * -1}px 10px rgba(204,204,204,0.4)`;
      }
    }
  }
</script>
<style lang="css" rel="stylesheet/css" scoped>
  .roomlist {
    height: 100%;
  }

  .container#index__roomList {
    overflow: hidden;
    width: 100vw;
    height: 100vh;
    margin: 0 auto;
    background: #fff;
    position: relative;
  }

  .container#index__roomList .roomlist__elem--password {
    display: block;
    position: fixed;
    height: 100vh;
    width: 100vw;
    z-index: 3;
    background: rgba(248, 240, 227, 0.5);
  }

  .container#index__roomList .roomlist__elem--password #popup {
    transition: all 2s ease-in-out;
    height: 40vh;
    text-align: center;
    width: 40vw;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    background: white;
    border-radius: 5vh;
  }

  .container#index__roomList .roomlist__elem--password #popup.slidein {
    transition: all 2s ease-in-out;
  }

  .container#index__roomList .roomlist__elem--password #popup .modal-content {
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
  }

  .container#index__roomList .roomlist__elem--password #popup .modal-content p {
    font-weight: bold;
    color: #666;
  }

  .container#index__roomList .roomlist__elem--password #popup .modal-content input {
    width: 60%;
    border-bottom-width: 2px;
    margin: 1.1em auto;
    display: block;
  }

  .container#index__roomList .roomlist__elem--password #popup .modal-content button {
    border: 2px solid white;
    width: 50%;
    line-height: 2.5;
    color: white;
    background: #E2C6A2;
    box-shadow: inset 0 0 10px rgba(204, 204, 204, 0.5);
    border-radius: 20px;
    font-size: .7em;
    margin-top: 1em;
  }

  .container#index__roomList .roomlist__elem--password #popup .modal-content button:hover {
    cursor: pointer;
  }

  .container#index__roomList input,
  .container#index__roomList button {
    border: none;
    outline: none;
    background: none;
    font-family: 'Open Sans', Helvetica, Arial, sans-serif;
  }

  .container#index__roomList input {
    display: block;
    width: 100%;
    margin-top: 5px;
    padding-bottom: 5px;
    font-size: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.4);
    text-align: center;
  }

  .container#index__roomList .header__container {
    position: relative;
    height: 70vh;
    width: 100vw;
    background-image: url('./pexels-photo.jpg');
    background-size: cover;
    text-align: center;
  }

  .container#index__roomList .header__container:after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
  }

  .container#index__roomList .header__container .header__container--title {
    height: 45vh;
    position: relative;
    z-index: 3;
  }

  .container#index__roomList .header__container .header__container--title h1 {
    margin: 0;
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    color: #e7e7e7;
    z-index: 2;
    font-size: 5em;
    letter-spacing: .3em;
    text-shadow: 10px 10px 10px rgba(255, 255, 255, 0.4);
  }

  .container#index__roomList .header__container .button__container {
    position: relative;
    height: 25vh;
    width: 100vw;
    text-align: center;
    color: white;
    background: rgba(255, 255, 255, 0.4);
    box-shadow: 0 -1px 10px #eee;
    border-radius: 20px 20px 0 0;
  }

  .container#index__roomList .header__container .button__container p {
    z-index: 9;
    color: white;
    position: relative;
    font-size: 1.5em;
    top: 21%;
    left: 50%;
    transform: translate3d(-50%, -22%, 0);
  }

  .container#index__roomList .header__container .button__container button {
    position: absolute;
    top: 65%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    border: 2px solid #e8e8e8;
    border-radius: 30px;
    width: 25%;
    margin: 0 auto;
    line-height: 2.5;
    font-size: 1em;
    z-index: 2;
    color: white;
    background: rgba(246, 235, 218, 0.7);
    box-shadow: inset 0 0 10px rgba(204, 204, 204, 0.5);
  }

  .container#index__roomList .header__container .button__container button:hover {
    cursor: pointer;
    background: rgba(246, 235, 218, 0.6);
  }

  .container#index__roomList .roomlist__container {
    position: relative;
    height: 30vh;
    width: 100vw;
    background: rgba(246, 235, 218, 0.7);
    color: white;
  }

  .container#index__roomList .roomlist__container ul.roomlist {
    position: relative;
    white-space: nowrap;
    text-align: center;
    vertical-align: middle;
    padding: 3vh;
  }

  .container#index__roomList .roomlist__container ul.roomlist li.roomlist__elem {
    vertical-align: text-bottom;
    position: relative;
    text-align: center;
    display: inline-block;
    width: 23vh;
    height: 23vh;
    background: rgba(221, 211, 196, 0.2);
    margin: 0 .5em;
    box-shadow: inset 0 0 10px rgba(204, 204, 204, 0.5);
    border-radius: 20px;
  }

  .container#index__roomList .roomlist__container ul.roomlist li.roomlist__elem:hover {
    box-shadow: inset 0 0 10px rgba(204, 204, 204, 0.8);
  }

  .container#index__roomList .roomlist__container ul.roomlist li.roomlist__elem .roomlist__elem--logo {
    position: relative;
    height: 10vh;
  }

  .container#index__roomList .roomlist__container ul.roomlist li.roomlist__elem .roomlist__elem--logo img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
  }

  .container#index__roomList .roomlist__container ul.roomlist li.roomlist__elem .roomlist__elem--title p {
    color: #888;
    font-weight: bold;
  }

  .container#index__roomList .roomlist__container ul.roomlist li.roomlist__elem .roomlist__elem--lock {
    position: relative;
    height: 9vh;
  }

  .container#index__roomList .roomlist__container ul.roomlist li.roomlist__elem .roomlist__elem--lock img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0px);
    height: 2.5vh;
    width: 2.5vh;
    border: 2px solid #d4af7a;
    padding: 5px;
    border-radius: 50%;
  }

  .container#index__roomList .roomlist__container ul.roomlist li.roomlist__elem .roomlist__elem--lock img:hover {
    cursor: pointer;
    background: rgba(204, 204, 204, 0.4);
  }
</style>
