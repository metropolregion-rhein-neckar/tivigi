import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol/'
import * as ol_proj from 'ol/proj'

import WithRender from './MapOverlay.html';
import { Coordinate } from 'ol/coordinate';


@WithRender
@Component({
    components: {
    }
})
export default class MapOverlay extends Vue {

    //################# BEGIN Props #################
    @Prop()
    map!: ol.Map;

    @Prop({ default: () => { return [0, 0] } })
    position!: Coordinate

    @Prop({ default: () => { return "EPSG:4326" } })
    crs!: string
    //################# END Props #################


    overlay = new ol.Overlay({
        autoPan: false
    });



    @Watch('position')
    onPositionChange() {
        this.updatePosition()
    }


    beforeDestroy() {
        this.map.removeOverlay(this.overlay)
    }


    mounted() {      

        this.overlay.setElement(this.$el as HTMLElement)

        this.updatePosition()

        this.map.addOverlay(this.overlay)

    }

    updatePosition() {
        let transformed = this.position

        if (this.crs != "") {
            transformed = ol_proj.transform(this.position, this.crs, this.map.getView().getProjection())
        }

        this.overlay.setPosition(transformed);
    }
}
