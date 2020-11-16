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
    remove = false

    timeout = 0


    get dynamicStyle(): any {

        let top = 0
        let left = 0

        let el = this.$el as HTMLElement

        if (el != null) {
           // top = this.y - el.offsetHeight / 2
           top = this.y + 20

            left = this.x - el.offsetWidth / 2 
            left = this.x + 10
        }

        return {
            "left": left + "px",
            "top": top + "px",
            "opacity": this.show && this.tooltipText != "" ? '1' : '0'
        }
    }


    beforeDestroy() {
        //@ts-ignore
        window.removeEventListener("tooltip", this.onTooltip)
        window.removeEventListener("mousemove", this.onMouseMove)
    }

    mounted() {

        //@ts-ignore
        window.addEventListener("tooltip", this.onTooltip)
        window.addEventListener("mousemove", this.onMouseMove)
    }


    onMouseMove(evt: MouseEvent) {

        this.x = evt.clientX
        this.y = evt.clientY

        this.$forceUpdate()

        this.remove = true
        this.timeout = window.setTimeout(() => { if (this.remove) this.show = false }, 300)
    }


    onTooltip(evt: CustomEvent) {

        window.setTimeout(() => {this.remove = false}, 0)

        this.show = true

        this.tooltipText = evt.detail

        window.clearTimeout(this.timeout)

    }
}
