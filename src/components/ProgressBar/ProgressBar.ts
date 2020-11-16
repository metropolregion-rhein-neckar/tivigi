import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import "./ProgressBar.scss"
import WithRender from './ProgressBar.html';

@WithRender
@Component({
    components: {
    }
})
export default class ProgressBar extends Vue {

    //################ BEGIN Props #################
    @Prop({ default: false })
    fadeout!: boolean

    @Prop({ default: 0 })
    progress!: number

    @Prop({ default: true })
    showPercent!: boolean
    //################ END Props #################


    get dynamicStyle(): any {
        return { "width": (this.progress * 100) + "%" }
    }


    @Watch('progress')
    updateState() {
        let elem = this.$el as HTMLElement;

        if (this.progress >= 1) {

            if (this.fadeout) {

                // Start fade with a delay:
                setTimeout(() => {
                    elem.style.transition = "2s"
                    elem.style.opacity = "0";

                }, 300)
            }
        }
        else {

            elem.style.transition = "0s"
            elem.style.opacity = "1";
        }
    }
}
