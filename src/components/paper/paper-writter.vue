<template>
  <div ref="rootElt"></div>
</template>

<script>
  import PaperWritter from './paper_writter';
  export default {
    data(){
      return {
        pw: null
      }
    },
    props: {
      'width': {},
      'height': {},
      'size': {
        //\d 1-6
      },
      'type': {
        //铅笔pen 橡皮eraser 文字text 矩形rect 椭圆ellipse
      },
      'color': {
        //符合css3颜色格式规范的字符串
      }
    },
    watch: {
      size (v) {
        this.pw.size = v
      },
      type (v) {
        this.pw.type = v
      },
      color (v) {
        this.pw.color = v
      }
    },
    created () {
      window.TEST_VM = this;
      this.$nextTick(function () {
        this.pw = new PaperWritter({
          el: this.$refs.rootElt,
          width: this.width,
          height: this.height
        });
        this.pw.callback = (data) => {
          this.$emit('draw', data);
        }
      })
    },
    methods: {
      clear () {
        this.pw.clear();
      }
    }
  };
</script>
