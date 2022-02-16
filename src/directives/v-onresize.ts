
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

//################### BEGIN Element resize listener directive ######################

var elementResizeDetectorMaker = require("element-resize-detector");


let erd = elementResizeDetectorMaker({
    strategy: "scroll"
});


Vue.directive('onresize', {
    bind(element, binding, vnode) {
        erd.listenTo(element, binding.value);
       
    },

    unbind(element, binding, vnode) {
        //erd.removeListener(binding.value, resizeListener);
        erd.removeListener(binding.value);
       
    }

}); 
//################### END Element resize listener directive ######################
