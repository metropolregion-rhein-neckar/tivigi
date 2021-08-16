import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol'
import * as ol_proj from 'ol/proj'
import LocationSearch from '../LocationSearch/LocationSearch'
import MapPanel from '../MapPanel/MapPanel'
import './RichMapPanel.scss'

import WithRender from './RichMapPanel.html';
import { Extent } from 'ol/extent';

@WithRender
@Component({
    components: {
     MapPanel,
     LocationSearch
    }
})
export default class RichMapPanel extends Vue {

    //################## BEGIN Props ##################

    @Prop()
    map!: ol.Map;

    @Prop({ default: () => { return [-180, -90, 180, 90] } })        
    initialExtent!: Extent

    @Prop({ default: "EPSG:4326" })
    initialExtentSrs!: ol_proj.ProjectionLike

    //################## END Props ##################



}
