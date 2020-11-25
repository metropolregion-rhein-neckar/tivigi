import { Component, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol'
import * as ol_layer from 'ol/layer'

import { createLayerFromConfig } from 'tivigi/src/util/mapLayerLoading';
import AbstractData from 'tivigi/src/components/data/AbstractData/AbstractData';


@Component({
    components: {}
})
export default class DataMapLayer extends AbstractData {

    //############# BEGIN Props ##############
    @Prop({})
    map!: ol.Map

    @Prop()
    maxResolution!: number

    @Prop({ default: false })
    visible!: boolean

    @Prop({ default: 0 })
    zIndex!: number

    @Prop()
    layerDef!: any

    @Prop()
    layerId!: any
    //############# END Props ##############


    layer: ol_layer.Layer | null = null

    pTargetOpacity = 0;


    @Watch('map')
    onMapChange() {
        this.setup()
    }


    @Watch('layerDef')
    onLayerDefChange() {
        this.setup()
    }


    @Watch('visible')
    onVisibleChange() {

        if (this.layer == null) {
            console.log("Visibility toggle: Layer is null")
            return
        }

        this.layer.setVisible(this.visible)
    }


    setup() {

        if (!(this.map instanceof ol.Map)) {
            return
        }

        if (this.layer != null) {
            return
        }

        if (this.layerDef == undefined) {
            return
        }

        if (!(this.layerId in this.layerDef)) {
            console.log("DataMapLayer: Layer ID not found: " + this.layerId);
            return
        }

        let layer = createLayerFromConfig(this.layerDef[this.layerId], this.map.getView().getProjection())

        if (layer == null) {
            return
        }

        this.layer = layer

        if (this.maxResolution != undefined) {
            this.layer.setMaxResolution(this.maxResolution)
        }


        this.layer.setVisible(this.visible)

        this.layer.setZIndex(this.zIndex)        

        this.map.addLayer(this.layer)

        this.register(this.layer)

    }
}
