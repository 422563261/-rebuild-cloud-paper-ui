<template>
  <div ref="rootElt"></div>
</template>

<script>
  import PaperReader from './paper_reader';
  export default {
    data () {
      return {
        pr: null
      }
    },
    props: {
      'width': {},
      'height': {}
    },
    created(){
      window.TEST_VM = this;
      this.$nextTick(function () {
        this.pr = new PaperReader({
          el: this.$refs.rootElt,
          width: this.width,
          height: this.height
        });
      })
    },
    methods: {
      dispatch (...data) {
        this.pr.dispatch(...data);
      }
    }
  };
</script>
