import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol/'

import { FeatureLike } from 'ol/Feature';

import WithRender from './FeatureSelectTool.html';


@WithRender
@Component({
    components: {}
})
export default class FeatureSelectTool extends Vue {

    //################# BEGIN Props #################
    @Prop()
    map!: ol.Map;

    @Prop()
    hoverFeature!: ol.Feature | undefined

    @Prop()
    selectedFeature!: ol.Feature | undefined
    //################# END Props #################

    prevHoverFeature: ol.Feature | undefined = undefined

    @Watch('selectedFeature')
    onSelectedFeatureChange() {
       // this.centerSelectedFeatureOnMap()
    }

    @Watch('map')
    onMapChange() {
        this.init()
    }


    beforeDestroy() {
        if (!(this.map instanceof ol.Map)) {
            return
        }

        this.map.un("click", this.onMapClick)
        this.map.un("pointermove", this.onMapPointerMove)
    }


    centerSelectedFeatureOnMap() {

        //#################### BEGIN Center map on selected feature ####################
        if (this.selectedFeature != null) {
            let geom = this.selectedFeature.getGeometry()

            if (geom != null) {
                let extent = geom.getExtent()

                let padding = 300

                this.map.getView().fit(extent, { padding: [padding, padding, padding, padding], duration: 1000, maxZoom: 15 })
            }

        }
        //#################### END Center map on selected feature ####################
    }


    init() {
        if (!(this.map instanceof ol.Map)) {
            return
        }

        this.map.on("click", this.onMapClick)
     //   this.map.on("pointermove", this.onMapPointerMove)
    }


    mounted() {
        this.init()
    }


    onMapClick(evt: ol.MapBrowserEvent) {

        let selectedFeature = undefined

        let features = Array<FeatureLike>()

        this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {

            features.push(feature)
        })

        if (features.length > 0) {
            selectedFeature = features[0]
        }


        if (selectedFeature != this.selectedFeature) {
            // ATTENTION: We must *not* send this.selectedFeature as the update event payload here since we
            // have not updated this.selectedFeature! this.selectedFeature can only be updated happen from 
            // the outside through the prop. In a typical use case of this component, this happen automatically 
            // through a "feedback loop". But in any case, for now, this.selectedFeature remains unchanged!
            this.$emit('update:selectedFeature', selectedFeature)

            
            //this.centerSelectedFeatureOnMap()
        }
    }


    onMapPointerMove(evt: ol.MapBrowserEvent) {

        let features = Array<any>()

        this.map.forEachFeatureAtPixel(evt.pixel, (feat, lay) => {

            if (lay != undefined) {
                features.push({ feature: feat, layer: lay })
            }
        })


        

        let newHoverFeature = undefined

        //############### BEGIN Determine new hover feature ################
        if (features.length > 0) {
            newHoverFeature = features[0].feature
        }


         /*       
        //############# BEGIN Step into clustered feature #############
        if (newHoverFeature instanceof ol.Feature) {

            let subfeatures = newHoverFeature.getProperties().features

            if (subfeatures instanceof Array) {

                if (subfeatures.length > 0) {
                    
                    newHoverFeature = subfeatures[0]                    
                }
             
               
            }
        }
        //############# END Step into clustered feature #############
  */
  
        //############### END Determine new hover feature ################


        if (newHoverFeature == this.prevHoverFeature) {
            return
        }

      
  

        //############ BEGIN Unset hover state of previous hover feature ##############
        if (this.prevHoverFeature instanceof ol.Feature) {
            this.prevHoverFeature.unset("hover")
            this.prevHoverFeature.changed()

            /*
            let subfeatures = this.prevHoverFeature.getProperties().features

            if (subfeatures instanceof Array) {
                for (let sf of subfeatures) {
                    sf.unset("hover")
                    sf.changed()
                }
            }
            */
        }
        //############ END Unset hover state of previous hover feature ##############

        
          

        this.prevHoverFeature = newHoverFeature

        this.$emit('update:hoverFeature', newHoverFeature)




        if (newHoverFeature != undefined) {
            
            newHoverFeature.set("hover", true)
            newHoverFeature.changed()
    
        }


    


        //###################### BEGIN Show feature tooltip ######################
        /*
    
        let layer = features[0].layer;
        let feature = features[0].feature;
    
    
        let text = layer.get('tooltipTemplate')
    
        if (text != undefined) {
    
            for (let prop in feature.getProperties()) {
                text = text.replace("{{" + prop + "}}", feature.getProperties()[prop]);
            }
    
            let attributeName = layer.get("attribute")
    
            if (attributeName != null) {
                let value = feature.getProperties()[attributeName]
    
                if (value != undefined) {
                    text = text.replace("<<ATTRIBUTE>>", value)
                }
            }
    
            // Fire tooltip event:
            var tooltipEvent = new CustomEvent('tooltip', { detail: text });
            window.dispatchEvent(tooltipEvent)
        }
        */
        //###################### END Show feature tooltip ######################
    }




    getClusterSubFeatures(feature: FeatureLike): Array<FeatureLike> {

        //############### BEGIN Handle cluster layer features ###############
        if (feature.getProperties().features instanceof Array) {

            let result = Array<FeatureLike>()

            for (let f2 of feature.getProperties().features) {

                result = result.concat(this.getClusterSubFeatures(f2))
            }

            return result
        }
        //############### END Handle cluster layer features ###############

        return [feature]
    }

}

