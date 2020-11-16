import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

//################### BEGIN Tooltip directive ######################


Vue.directive('tooltip', {
    bind(element: HTMLElement, binding, vnode) {

        let handler = () => {
      
            var tooltipEvent = new CustomEvent('tooltip', { detail: binding.value });
            window.dispatchEvent(tooltipEvent)
        }
      
        element.addEventListener("mousemove", handler )
    },

    unbind(element: HTMLElement, binding, vnode) {
        // TODO: 3 What to do here?
        //element.removeEventListener("mousemove", handler)
    }

});
//################### END Tooltip directive ######################
