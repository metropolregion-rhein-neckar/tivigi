import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol/'
import { ScaleLine } from 'ol/control';

import WithRender from './MapScale.html';

@WithRender
@Component({
    components: {

    }
})
export default class Scale extends Vue {
    @Prop()
    map!: ol.Map;

    
    control = new ScaleLine({units: 'metric'})


    @Watch('map')
    onMapChange() {        
        this.init()
    }


    beforeDestroy() {
        if (!(this.map instanceof ol.Map)) {
            return
        }
        
        this.map.removeControl(this.control)
    }
    
    init() {
        if (!(this.map instanceof ol.Map)) {
            return
        }

        this.map.addControl(this.control)        
    }

    mounted() {
        this.init()
    }
}
