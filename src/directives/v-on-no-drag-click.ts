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

let mouseDownX = 0
let mouseDownY = 0
let element : HTMLElement|null = null

function onMouseDown(evt : MouseEvent) {

    //@ts-ignore
    element = this
    
    mouseDownX = evt.clientX
    mouseDownY = evt.clientY
}

function onMouseUp(evt : MouseEvent) {

    let mouseUpX = evt.clientX
    let mouseUpY = evt.clientY

    const a = mouseDownX - mouseUpX
    const b = mouseDownY - mouseUpY

    let dist = Math.sqrt(a*a + b*b)

    if (dist < 10 && element != null) {
        //@ts-ignore
        element.tivigiNoDragClickHandler(evt)
    }

}

Vue.directive('on-no-drag-click', {

    bind(element, binding, vnode) {

        //@ts-ignore
        element.tivigiNoDragClickHandler = binding.value
        element.addEventListener("mousedown", onMouseDown)
        element.addEventListener("mouseup", onMouseUp)

    },

    
    unbind(element, binding, vnode) {

        //@ts-ignore
        delete element.tivigiNoDragClickHandler

        element.removeEventListener("mousedown", onMouseDown)
        element.removeEventListener("mouseup", onMouseUp)

    }

});
//################### END Element resize listener directive ######################
