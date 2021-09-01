import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import * as ol_layer from 'ol/layer'
import WithRender from './LayerVisibilityCheckbox.html';
import "./LayerVisibilityCheckbox.scss"

@WithRender
@Component({
   
})
export default class LayerVisibilityCheckbox extends Vue {

    //################# BEGIN Props #################
    @Prop()
    layer!: ol_layer.Layer

    @Prop()
    label! : string
    //################# END Props ####################

    legend = {
        "Legend": undefined
    }

    getLabel() {
        if (this.label != undefined) {
            return this.label
        }

        if (this.layer == undefined) {
            return ""
        }

        return this.layer.get("title")
    }


    get visible() {
        if (this.layer == undefined) {
            return false
        }
        return this.layer.getVisible()
    }


    set visible(newval : boolean) {
        if (this.layer == undefined) {
            return
        }
        this.layer.setVisible(newval)
    }
}



