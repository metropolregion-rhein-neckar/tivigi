// TODO: 2 OPTIMIZE: Perform clipping only if layer is visible

import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol'
import * as ol_layer from 'ol/layer'

import { createLayerFromConfig } from 'tivigi/src/util/mapLayerLoading';


import WithRender from './DataMapLayer.html';
import AbstractData from 'tivigi/src/components/data/AbstractData/AbstractData';


@WithRender
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

    @Prop({ default: 1 })
    zindex!: number

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

        if (this.visible) {
            this.pTargetOpacity = 1
          //  this.animateOpacity()
        }
        else {      
            this.pTargetOpacity = 0
            //this.animateOpacity()
        }

        this.layer.setVisible(this.visible)
        
    }


    animateOpacity() {
        if (this.layer == null) {
            return
        }

        let opacity = this.layer.getOpacity()

        let opacityStep = 0.3
        let timeStep = 100

        if (opacity < this.pTargetOpacity) {
            this.layer.setOpacity(Math.min(opacity + opacityStep,1))
            window.setTimeout(this.animateOpacity, timeStep)            
        }
        else if (opacity > this.pTargetOpacity) {
            this.layer.setOpacity(Math.max(opacity - opacityStep,0))
            window.setTimeout(this.animateOpacity,timeStep)            
        }
    }
  

    beforeDestroy() {
        if (!(this.map instanceof ol.Map)) {
            return
        }

        //console.log("destroy")
     
        /*
        let existing = this.get()

        if (existing != undefined) {
            this.layer = existing

        } 
        */     
        //if (this.layer != null) this.map.removeLayer(this.layer)
    }


    mounted() {     
        
        // NOTE: This is required as a workaround to make visibility toggling work. 
        // The reason why visibility toggling doesn't work without it has probably
        // something to do with the multiple re-creation of the component which happens for unknown reasons.
        let existing = this.get()

        if (existing != undefined) {
            this.layer = existing

        }                    
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

        let lc = createLayerFromConfig(this.layerDef[this.layerId], this.map.getView().getProjection())

        if (lc != null) {
            
            this.layer = lc

            if (this.maxResolution != undefined) {
                this.layer.setMaxResolution(this.maxResolution)
            }
    
            
            this.layer.setVisible(this.visible)              
            
            if (this.visible) {
                this.pTargetOpacity = 1
            }
            else {
                this.pTargetOpacity = 0
            }

    
            //this.layer.setOpacity(this.pTargetOpacity) 
        
            this.map.addLayer(this.layer)

            this.register(this.layer)
        }
    }
}
