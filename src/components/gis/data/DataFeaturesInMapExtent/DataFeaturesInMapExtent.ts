import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol/'
import * as ol_layer from 'ol/layer'


import { FeatureLike } from 'ol/Feature';
import AbstractData from 'tivigi/src/components/data/AbstractData/AbstractData';



@Component({
    components: {}
})
export default class DataFeaturesInMapExtent extends AbstractData {

    //################# BEGIN Props #################
    @Prop()
    map!: ol.Map;

    @Prop()
    layer!: ol_layer.Vector
    //################# END Props #################



    beforeDestroy() {
        if (!(this.map instanceof ol.Map && this.layer instanceof ol_layer.Layer)) {
            return
        }

        this.layer.un('change:visible', this.onLayerVisibilityChange);

        this.layer.getSource().un("change", this.update)

        this.map.un("moveend", this.onMapMoveEnd)  
    }


    @Watch('map')
    @Watch('layer')
    init() {
        
        if (!(this.map instanceof ol.Map && this.layer instanceof ol_layer.Layer)) {
            return
        }

        this.layer.on('change:visible', this.onLayerVisibilityChange);

        this.layer.getSource().on("change", this.update)

        this.map.on("moveend", this.onMapMoveEnd)
    }


    mounted() {
        this.init()
    }


    onMapMoveEnd(evt: ol.MapBrowserEvent) {
        this.update()
    }


    onLayerVisibilityChange() {        
        this.update()
    }

    
    getClusteredFeatures(feature: FeatureLike): Array<FeatureLike> {

        //############### BEGIN Handle cluster layer features ###############
        if (feature.getProperties().features instanceof Array) {

            let result = Array<FeatureLike>()

            for (const f2 of feature.getProperties().features) {

                result = result.concat(this.getClusteredFeatures(f2))
            }

            return result
        }
        //############### END Handle cluster layer features ###############

        return [feature]
    }


    update() {

        const extent = this.map.getView().calculateExtent()


        let features = Array<FeatureLike>()

        for (const feature of this.layer.getSource().getFeaturesInExtent(extent)) {
            features = features.concat(this.getClusteredFeatures(feature))
        }

      
        this.$emit("update:data", features)        
    }
}

