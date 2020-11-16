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
    onLayerChange() {
        this.init()
    }

    beforeDestroy() {
        if (this.layer == undefined) {
            return
        }
        
        this.layer.un("propertychange", this.onLayerPropertyChange)
    }


    init() {
        if (this.layer == undefined) {
            return
        }

        this.layer.on("propertychange", this.onLayerPropertyChange)

        this.legend = this.layer.get('legend')
    }

    mounted() {
        this.init()
    }


    onLayerPropertyChange(evt: ObjectEvent) {

        if (evt.key == 'legend') {
            this.legend = this.layer.get('legend')
        }
    }
}



