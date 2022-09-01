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

  

    show = false


    timeout_hide = 0
    timeout_show = 0


    getDynamicStyle(): any {

        let top = 0
        let left = 0

        let tooltipElement = this.$el as HTMLElement

        if (tooltipElement != null) {
            top = Math.max(0, this.y - tooltipElement.offsetHeight - 20)
            left = Math.max(0, this.x - tooltipElement.offsetWidth / 2)
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

        // Update tooltip position:
        this.x = evt.clientX
        this.y = evt.clientY

        let element : HTMLElement|null = evt.target as HTMLElement

        if (element == undefined) {
            return
        }
        
        let text = null

        while (text == null && element != null) {
            text = element.getAttribute("data-tooltip")

            element = element.parentElement
        }

        if (text == null || text == "") {
            this.show = false
        }
        else {
            this.tooltipText = text
            this.show = true
        }
    }


    onScroll(evt: Event) {
        
        window.clearTimeout(this.timeout_show)
        window.clearTimeout(this.timeout_hide)
        this.show = false
    }


}
