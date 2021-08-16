import { getActionImageUrl } from 'tivigi/src/components/gis/HereRouting/hereRoutingUtils';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './HereRouteInstructionsView.html';

import "./HereRouteInstructionsView.scss"

@WithRender
@Component({
    components: {

    }
})
export default class HereRouteInstructionsView extends Vue {

    @Prop({ default: null })
    route: any

    actionUnderMouse : any = null

    getActionImageUrl(action: any): string {

        return getActionImageUrl(action)
   
    }


    onActionClick(action : any) {
        this.$emit("actionClick", action)
    }


    onActionMouseOver(action : any) {
        this.actionUnderMouse = action
        this.$emit("actionMouseOver", action)
    }

    onMouseOut() {
       

        this.actionUnderMouse = null
        this.$emit("actionMouseOver", this.actionUnderMouse)
    }
}
