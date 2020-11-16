import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol/'
import { Feature } from 'ol/';
import { FeatureLike } from 'ol/Feature';


import WithRender from './FeatureHighlightTool.html';


@WithRender
@Component({
    components: {
    }
})
export default class FeatureHighlightTool extends Vue {

    //################# BEGIN Props #################
    @Prop()
    map!: ol.Map;

    @Prop()
    hoverFeature!: ol.Feature

    @Prop()
    selectedFeature!: ol.Feature
    //################# END Props #################

 
    prevHoverFeature : ol.Feature = this.hoverFeature
    prevSelectedFeature : ol.Feature = this.selectedFeature


    @Watch('hoverFeature')
    onHoverFeatureChange() {
       
        if (this.prevHoverFeature != null) {
            this.prevHoverFeature.unset("hover")
            this.prevHoverFeature.changed()
        }
        
        this.prevHoverFeature = this.hoverFeature

        if (this.hoverFeature == null) {
            return
        }

        this.hoverFeature.set("hover", true)
        this.hoverFeature.changed()
    }


    @Watch('selectedFeature')
    onSelectedFeatureChange() {
    
        if (this.prevSelectedFeature != null) {
            this.prevSelectedFeature.unset("hover")
        }
        
        this.prevSelectedFeature = this.selectedFeature

        if (this.selectedFeature == null) {
            return
        }

        this.selectedFeature.set("selected", true)
        this.selectedFeature.changed()
    }

  
    beforeDestroy() {
        if (this.hoverFeature != null) {
            this.hoverFeature.unset("hover")
        }

        if (this.selectedFeature != null) {
            this.prevSelectedFeature.unset("selected")
            this.prevSelectedFeature.changed()
        }
    }


    init() {
             
    }


    mounted() {
        this.init()
    }

}
