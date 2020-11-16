import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

//############## BEGIN OpenLayers imports ##############
import * as ol from 'ol/'
import * as ol_layer from 'ol/layer'
//############## END OpenLayers imports ##############

//############## BEGIN Tivigi imports ##############
import Collapsible from 'tivigi/src/components/Collapsible/Collapsible'
import PropertyGridWithSlideshow from 'tivigi/src/components/PropertyGridWithSlideshow/PropertyGridWithSlideshow'
import { MapQueryResultSet } from 'tivigi/src/components/gis/MapQueryTool/mapQueryUtil';
//############## END Tivigi imports ##############

import WithRender from './CollapsibleFeaturesList.html';
import './CollapsibleFeaturesList.scss';
import { getFeatureLabelField } from 'tivigi/src/util/featureAttributeUtils';


@WithRender
@Component({
    components: {
        Collapsible,      
        PropertyGridWithSlideshow,
    }
})
export default class CollapsibleFeaturesList extends Vue {

    @Prop({ default: () => { return new MapQueryResultSet()} })
    featuresList!: string

    getFeatureLabel(feature: ol.Feature, layer: ol_layer.Vector, defaultLabel: string) {

        let labelField = getFeatureLabelField(layer, feature)

        if (labelField != null) {
            return feature.getProperties()[labelField]
        }

        return defaultLabel
    }

}
