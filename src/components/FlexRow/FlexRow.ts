import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import WithRender from './FlexRow.html';
import './FlexRow.scss'

@WithRender
@Component({
    components: {}
})
export default class FlexRow extends Vue {

    portrait = false

    // TODO 4: Make switch threshold ratio configurable through prop

    get dynamicClass(): any {
     
        return {
            "FlexRow": true,
            "FlexRow--portrait": this.portrait
        }
    }

    onResize() {
        this.portrait = (this.$el as HTMLElement).offsetHeight > (this.$el as HTMLElement).offsetWidth
    }
}
