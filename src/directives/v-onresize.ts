/*
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
*/


import { DirectiveOptions } from 'vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

//################### BEGIN Element resize listener directive ######################



Vue.directive('onresize', {

    bind(element, binding, vnode) {

        //@ts-ignore
        element.tivigiResizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                binding.value(entry)
            }
        })

        //@ts-ignore
        element.tivigiResizeObserver.observe(element);
    },

    
    unbind(element, binding, vnode) {

        //@ts-ignore
        if (element.tivigiResizeObserver instanceof ResizeObserver) {
            //@ts-ignore
            element.tivigiResizeObserver.unobserve(element);
        }

    }

});
//################### END Element resize listener directive ######################
