import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol/'
import * as ol_proj from 'ol/proj'

import './MouseCoordinatesTool.scss'

import WithRender from './MouseCoordinatesTool.html';

@WithRender
@Component({
    components: {
       
    }
})
export default class MouseCoordinatesTool extends Vue {


    @Prop()
    map!: ol.Map;

    mouseCoords : any = 0;


    @Watch('map')
    onMapChange() {
        this.init()
    }


    beforeDestroy() {
        if (this.map == undefined) {
            return
        }

        this.map.un('pointermove', this.onMouseMove)
    }


    init() {
        if (this.map == undefined) {
            return
        }

        this.map.on('pointermove', this.onMouseMove)
    }


    mounted() {
        this.init()
    }

    
    onMouseMove(evt : any) {
        this.mouseCoords = ol_proj.transform(evt.coordinate, this.map.getView().getProjection(), 'EPSG:4326');
    }

}
