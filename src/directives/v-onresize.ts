import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

//################### BEGIN Element resize listener directive ######################

var elementResizeDetectorMaker = require("element-resize-detector");


let erd = elementResizeDetectorMaker({
    strategy: "scroll"
});

let resizeListener = function (element: HTMLElement, vnode : Vue) {
    var width = element.offsetWidth;
    var height = element.offsetHeight;
}


Vue.directive('onresize', {
    bind(element, binding, vnode) {
        erd.listenTo(element, binding.value);
       
    },

    unbind(element, binding, vnode) {
        erd.removeListener(binding.value, resizeListener);
       
    }

}); 
//################### END Element resize listener directive ######################
