import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as ol from 'ol/'
import * as ol_interaction from 'ol/interaction'
import Tooltip from 'ol-ext/overlay/Tooltip';


import WithRender from './MeasureTool.html';
import GeometryType from 'ol/geom/GeometryType';


@WithRender
@Component({
    components: {

    }
})
export default class MeasureTool extends Vue {

    @Prop()
    map!: ol.Map;

    // Valid values: "LineString", "Polygon"
    @Prop({ default: () => { return "LineString" } })
    type!: GeometryType


    tooltip: any
    draw: any


    beforeDestroy() {
        this.map.removeInteraction(this.draw)
        this.map.removeOverlay(this.tooltip)
    }


   
    mounted() {
        this.draw = new ol_interaction.Draw({            
            type: this.type
        });

        this.tooltip = new Tooltip()

        this.draw.on('drawstart', this.tooltip.setFeature.bind(this.tooltip));
        this.draw.on(['change:active', 'drawend'], this.tooltip.removeFeature.bind(this.tooltip));

        this.map.addOverlay(this.tooltip);
        this.map.addInteraction(this.draw);
    }

}
