import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

//############## BEGIN OpenLayers imports ##############
import * as ol from 'ol/'
import * as ol_layer from 'ol/layer'
//############## END OpenLayers imports ##############

//############## BEGIN Tivigi imports ##############
import Collapsible from 'tivigi/src/components/Collapsible/Collapsible'
import PropertyGridWithSlideshow from 'tivigi/src/components/PropertyGridWithSlideshow/PropertyGridWithSlideshow'
import { MapQueryResultSet } from 'tivigi/src/util/mapQueryUtil';
import { getFeatureLabelField } from 'tivigi/src/util/featureAttributeUtils';
//############## END Tivigi imports ##############

import "./CollapsibleFeaturesList.scss"
import WithRender from './CollapsibleFeaturesList.html';



@WithRender
@Component({
    components: {
        Collapsible,
        PropertyGridWithSlideshow,
    }
})
export default class CollapsibleFeaturesList extends Vue {

    //@Prop({ default: () => { return new MapQueryResultSet() } })
    @Prop()
    featuresList!: MapQueryResultSet

    @Watch("featuresList")
    onFeaturesListChange() {
        console.log("features change!")
        console.log("features: " + this.featuresList.numFeatures())
    }
    
    // ATTENTION: We don't move this method to a library file because it is called from the template!
    getFeatureLabel(feature: ol.Feature, layer: ol_layer.Vector, defaultLabel: string) {

        const labelField = getFeatureLabelField(layer, feature)
    
        if (labelField == null) {
            return defaultLabel    
        }
    
        return feature.getProperties()[labelField]
        
    }

    getFeaturesOrdered(entry: any) {

        let index = 0

        let temp = []

        for (let feature of entry.features) {
            temp.push({ feature: feature, label: this.getFeatureLabel(feature, entry.layer, 'Objekt ' + (index + 1)) })
        }

        temp.sort(this.sortFunc)

        let result = []

        for (let kvp of temp) {
            result.push(kvp.feature)
        }

        return result
    }


    sortFunc(a:any,b:any) {
        if (!a.label || !b.label) {
            return 0
        }
        
        return a.label.toLowerCase().localeCompare(b.label.toLowerCase())
    }
}
