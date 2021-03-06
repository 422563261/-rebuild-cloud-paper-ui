
import PaperRender from './paper_render';
import DrawInfo from './lib';
export default class PaperReader extends PaperRender {
    constructor(obj) {
      super();
      this.width  = obj.width;
      this.height = obj.height;
      this.callback = obj.callback;
      let node = document.createElement('canvas');
      node.width = this.width;
      node.height = this.height;
      obj.el.appendChild(node);
      this.canvas = node;
      const canvas = node;
      this.context = canvas.getContext('2d');
      let _self = this;
    }

    dispatch (di) {
      let current, last; //记录上一次与本次事件的坐标
      this.type = di.pen.type;
      this.size = di.pen.size;
      this.color = di.pen.color;
      this.factor = Math.min(this.width/di.width, this.height/di.height);
      switch(di.type) {
        case ('mousedown'):
        case ('touchstart'):
          this.last = di;
          // console.log(di.type, di.pen.type);
          super.start();
          break;
        case ('mousemove'):
        case ('touchmove'):
          this.current = di;
          super.move();
          // console.log(this.last.x, this.last.y);
          this.last = this.current;
          break;
        case ('clear'):
          super.clear();
          break;
      }
    }
  };

