import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import SmartButton from 'tivigi/src/components/SmartButton/SmartButton'

import WithRender from './SidebarPanel.html';
import './SidebarPanel.scss'

@WithRender
@Component({
    components: {
        SmartButton
    }
})
export default class SidebarPanel extends Vue {

    //############# BEGIN Props #############
    @Prop({ default: false })
    show!: boolean

    @Prop({ default: 'Untitled Window' })
    title!: String;

    @Prop({ default: 'right' })
    side!: String;

    @Prop({ default: true })
    autoClose!: boolean

    //##################### END Props #######################

    getDynamicStyle_outer(): any {
        let result: any = {}

        if (this.side == "left") {
            result.left = "0px"
        }
        else {
            result.right = "0px"
        }

        return result
    }


    getDynamicStyle_inner(): any {



        let result: any = {}

        if (this.side == "left") {
            result['animation-name'] = 'slidein_left'
        }
        else {
            result['animation-name'] = 'slidein_right'
        }

        return result
    }

    @Watch('show')
    onShowChange() {

        if (this.show) {
            let comp: Vue = this

            while (comp.$parent != null) {
                comp = comp.$parent
            }

            this.hideOtherSidebars(comp)
        }
    }


    hideOtherSidebars(comp: Vue) {
        for (let child of comp.$children) {

            if (child instanceof SidebarPanel && child != this) {
                child.hide()
            }

            this.hideOtherSidebars(child)
        }
    }


    //################################# END Watchers #################################

    beforeDestroy() {
        window.removeEventListener("mousedown", this.onWindowMouseDown)
    }

    mounted() {
        //if (this.autoClose) {
            window.addEventListener("mousedown", this.onWindowMouseDown)
        //}
    }



    hide() {
        this.$emit('update:show', false)
    }


    onWindowMouseDown(evt: MouseEvent) {

        if (!this.autoClose) {
            return
        }
        
        let eventTarget: HTMLElement = evt.target as HTMLElement

        // TODO: Move this to library
        while (eventTarget != this.$el) {
            if (eventTarget.parentElement != null) {
                eventTarget = eventTarget.parentElement
            }
            else {
                break
            }
        }

        if (eventTarget != this.$el) {
            
            this.hide()
        }
    }
}
