import { DirectiveOptions } from 'vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

//################### BEGIN Element resize listener directive ######################



Vue.directive('onresize-native', {

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
 
