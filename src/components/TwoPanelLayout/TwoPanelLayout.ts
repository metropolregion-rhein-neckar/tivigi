import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import * as uuid from 'uuid'
import ScrollMenu from 'tivigi/src/components/ScrollMenu/ScrollMenu';
import WithRender from './TwoPanelLayout.html';
import './TwoPanelLayout.scss'

@WithRender
@Component({
    components: {
        ScrollMenu
    }
})
export default class TwoPanelLayout extends Vue {

    portrait = false

    showPanel1 = false

    

    @Prop()
    panel1ButtonLabel! : string

    @Prop()
    panel2ButtonLabel! : string

    containerId = uuid.v4()


    getDynamicClass(): any {
        return {
            "TwoPanelLayout__Inner": true,
            "TwoPanelLayout--portrait": this.portrait,
            "TwoPanelLayout--landscape": !this.portrait

        }
    }


    getToggleButtonLabel() {
        if (this.showPanel1) {
            return this.panel2ButtonLabel != undefined ? this.panel2ButtonLabel : "Panel 2"
        }
        else {
            return this.panel1ButtonLabel != undefined ? this.panel1ButtonLabel : "Panel 1"
        }
    }


    getPanel1Style(): any {

        if (this.portrait) {
            return {

                "z-index": this.showPanel1 ? "1" : "0"
            }
        }
        return {}
    }

    getPanel2Style(): any {
        if (this.portrait) {
            return {

                "z-index": !this.showPanel1 ? "1" : "0"
            }
        }
        return {}
    }


    onResize() {
   

        let el = this.$el as HTMLElement

        this.portrait = (el.offsetHeight > el.offsetWidth)

     
    }

    onToggleButtonClick() {
        this.showPanel1 = !this.showPanel1
    }
}
