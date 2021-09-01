import { Component, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol'
import * as ol_layer from 'ol/layer'

import { createLayerFromConfig } from 'tivigi/src/util/mapLayerLoading';
import AbstractRenderlessComponent from 'tivigi/src/components/AbstractRenderlessComponent/AbstractRenderlessComponent';


@Component({
    components: {}
})
export default class DataMapLayer extends AbstractRenderlessComponent {

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

    @Prop()
    data! : ol_layer.Layer
    //############# END Props ##############


    pLayer: ol_layer.Layer | null = null

   

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

        if (this.pLayer == null) {
            console.log("Visibility toggle: Layer is null")
            return
        }

        this.pLayer.setVisible(this.visible)
    }


    @Watch('zIndex')
    onZIndexChange() {

        if (this.pLayer == null) {
            console.log("Z-Index change: Layer is null")
            return
        }

        this.pLayer.setZIndex(this.zIndex)
    }


    mounted() {
        this.setup()
    }


    setup() {

        if (!(this.map instanceof ol.Map)) {
            return
        }
        
        if (this.layerDef == undefined) {
            return
        }

        if (!(this.layerId in this.layerDef)) {
            console.log("DataMapLayer: Layer ID not found: " + this.layerId);
            return
        }



        //########### BEGIN Check if layer with same ID already exists in the map ############

        // If a layer with the same ID already exists, we assign it to "this.layer" to that
        // further changes made through/by this component are applied to the correct layer.

        for (let otherLayer of this.map.getLayers().getArray()) {

            if (otherLayer.get("id") == this.layerId) {
                this.pLayer = otherLayer as ol_layer.Layer
                break                
            }
        }
        //########### END Check if layer with same ID already exists in the map ############

        if (this.pLayer == null) {
            const layer = createLayerFromConfig(this.layerDef[this.layerId], this.map.getView().getProjection())

            if (layer != null) {
                layer.set("id", this.layerId)
                this.map.addLayer(layer)
                this.pLayer = layer
            }
        }


        if (this.pLayer == null) {
            return
        }

    
        if (this.maxResolution != undefined) {
            this.pLayer.setMaxResolution(this.maxResolution)
        }


        this.pLayer.setVisible(this.visible)

        this.pLayer.setZIndex(this.zIndex)

        // New way:
        this.$emit("update:data", this.pLayer)    
    }
}
