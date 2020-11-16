import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol/'
import * as ol_layer from 'ol/layer'

import WithRender from './FeaturesInMapViewFilter.html';
import { FeatureLike } from 'tivigi/node_modules/@types/ol/Feature';


@WithRender
@Component({
    components: {}
})
export default class FeaturesInMapExtentFilter extends Vue {

    //################# BEGIN Props #################
    @Prop()
    map!: ol.Map;

    @Prop()
    layer! : ol_layer.Vector

    @Prop({default: () => { return [] }})
    features!: Array<ol.Feature>

    //################# END Props #################

   
    @Watch('map')
    onMapChange() {
        this.init()
    }


    beforeDestroy() {
        if (!(this.map instanceof ol.Map)) {
            return
        }

        this.map.un("moveend", this.onMapMoveEnd)
        
    }


    

    init() {
        if (!(this.map instanceof ol.Map)) {
            return
        }

      
        this.map.on("moveend", this.onMapMoveEnd)
    }


    mounted() {
        this.init()
    }


    onMapMoveEnd(evt: ol.MapBrowserEvent) {
  
        if (!(this.layer instanceof ol_layer.Vector)) {           
            return
        }

        let extent = this.map.getView().calculateExtent()

       
        let features = Array<FeatureLike>()

        for(let feature of this.layer.getSource().getFeaturesInExtent(extent)) {            
            features = features.concat(this.getClusteredFeatures(feature))
        }
      
        
        this.$emit("update:features", features)
    }



    getClusteredFeatures(feature: FeatureLike) : Array<FeatureLike> {

        //############### BEGIN Handle cluster layer features ###############
        if (feature.getProperties().features instanceof Array) {

            let result = Array<FeatureLike>()
            for (let f2 of feature.getProperties().features) {
                
                result = result.concat(this.getClusteredFeatures(f2))
            }

            return result 
        }
        //############### END Handle cluster layer features ###############

        return [feature]
    }
}

