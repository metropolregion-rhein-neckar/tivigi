import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './Tooltip.html';
import './Tooltip.scss'

@WithRender
@Component({
    components: {
    }
})
export default class Tooltips extends Vue {

    tooltipText = ""

    x = 0
    y = 0

    prevX = 0
    prevY = 0

    show = false


    timeout_hide = 0
    timeout_show = 0


    get dynamicStyle(): any {

        let top = 0
        let left = 0

        let el = this.$el as HTMLElement

        if (el != null) {            
            top = this.y - el.offsetHeight - 10
            left = this.x - el.offsetWidth / 2        
        }

        return {
            "left": left + "px",
            "top": top + "px",
            "opacity": this.show && this.tooltipText != "" ? '1' : '0'
        }
    }


    beforeDestroy() {
        window.removeEventListener("mousemove", this.onMouseMove)
        window.removeEventListener("scroll", this.onScroll)
 
    }


    mounted() {
        window.addEventListener("mousemove", this.onMouseMove)
        window.addEventListener("scroll", this.onScroll)
    
    }


    onMouseMove(evt: MouseEvent) {
    
        let dx = evt.clientX - this.prevX
        let dy = evt.clientY - this.prevY

        let dist = Math.sqrt(dx * dx + dy * dy)

        this.prevX = evt.clientX
        this.prevY = evt.clientY


        this.x = evt.clientX
        this.y = evt.clientY


        let target = evt.target as HTMLElement

        let tta = target.getAttribute("data-tooltip")

        if (tta == null) {            
            this.show = false
        }
        else {
            this.tooltipText = tta
            this.show = true
        }
    }


    onScroll(evt: Event) {
        window.clearTimeout(this.timeout_show)
        window.clearTimeout(this.timeout_hide)
        this.show = false
    }


}
