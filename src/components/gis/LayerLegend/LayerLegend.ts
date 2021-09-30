import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

//############## BEGIN OpenLayers imports ##############
import * as ol_layer from 'ol/layer'
//############## END OpenLayers imports ##############

//################# BEGIN Tivigi imports #################
import Legend from 'tivigi/src/components/gis/Legend/Legend'
//################# END Tivigi imports #################



import WithRender from './LayerLegend.html';
import { ObjectEvent } from 'ol/Object';


@WithRender
@Component({
    components: {
        Legend
    },
})
export default class LayerControlPanel extends Vue {

    //################# BEGIN Props #################
    @Prop()
    layer!: ol_layer.Layer
    //################# END Props ####################

    legend = {
        "Legend": undefined
    }


    @Watch('layer')
    onLayerChange(now : ol_layer.Layer|undefined, before : ol_layer.Layer|undefined) {

     
        if (before != undefined) {
            before.un("propertychange", this.onLayerPropertyChange)
        }

        if (now != undefined) {
            now.on("propertychange", this.onLayerPropertyChange)
            this.legend = now.get('legend')
        }  
    }


    beforeDestroy() {
        if (this.layer == undefined) {
            return
        }
        
        this.layer.un("propertychange", this.onLayerPropertyChange)
    }


    mounted() {
        this.onLayerChange(this.layer, undefined)
    }


    onLayerPropertyChange(evt: ObjectEvent) {

        if (evt.key == 'legend') {
            this.legend = this.layer.get('legend')
        }
    }
}



