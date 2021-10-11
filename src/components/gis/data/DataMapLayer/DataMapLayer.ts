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

        let layer = this.getLayer()

        if (layer == null) {
            console.log("Visibility toggle: Layer is null")
            return
        }


        layer.setVisible(this.visible)
    }


    @Watch('zIndex')
    onZIndexChange() {

        let layer = this.getLayer()

        if (layer == null) {
            console.log("Z-Index change: Layer is null")
            return
        }

        layer.setZIndex(this.zIndex)
    }


    getLayer(): ol_layer.Layer | null {

        if (!(this.map instanceof ol.Map)) {
            return null
        }


        for (let otherLayer of this.map.getLayers().getArray()) {

            if (otherLayer.get("id") == this.layerId) {
                return otherLayer as ol_layer.Layer
            }
        }

        if (this.layerDef == undefined) {
            return null
        }
      
        if (!(this.layerId in this.layerDef)) {
            console.log("DataMapLayer: Layer ID not found: " + this.layerId);
            return null
        }

        let layer = createLayerFromConfig(this.layerDef[this.layerId], this.map.getView().getProjection())

        if (layer == null) {
            return null
        }

        layer.set("id", this.layerId)

        try {
            this.map.addLayer(layer)
        }
        catch (e) {
            console.log("layer already in map")
        }

        this.$emit("update:data", layer)

        return layer
    }


    mounted() {
        this.setup()
    }


    setup() {

        let layer = this.getLayer()

        if (layer == null) {
            return
        }

        if (this.maxResolution != undefined) {
            layer.setMaxResolution(this.maxResolution)
        }

        layer.setVisible(this.visible)

        layer.setZIndex(this.zIndex)
    }
}
