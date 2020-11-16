import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol/'
import * as ol_proj from 'ol/proj'

import WithRender from './SetMapExtentTool.html';
import { Extent } from 'ol/extent';

@WithRender
@Component({
    components: {

    }
})
export default class MapPanel extends Vue {

    @Prop({ default: "EPSG:4326" })
    srs!: ol_proj.ProjectionLike

    @Prop()
    map!: ol.Map;

    @Prop()
    extent!: Extent | null

    @Prop()
    trigger!: boolean

    @Prop({default: false})
    onlyOnTrue! : boolean

    @Prop({default: 750})
    animation_msec! : number



    @Watch('trigger')
    onTriggerChange() {

        if (this.extent == undefined) {
            return
        }

        if (this.onlyOnTrue && !this.trigger) {
            return
        }
    
        let extent_transformed = ol_proj.transformExtent(this.extent, this.srs, this.map.getView().getProjection())

        this.map.getView().fit(extent_transformed, {duration: this.animation_msec});

    }
}
