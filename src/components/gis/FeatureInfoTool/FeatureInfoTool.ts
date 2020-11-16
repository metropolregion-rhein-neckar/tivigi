import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

//############## BEGIN OpenLayers imports ##############
import * as ol from 'ol/'
import { Coordinate } from 'ol/coordinate';
//############## END OpenLayers imports ##############

//############## BEGIN Tivigi imports ##############
import LocationInput from '../LocationInput/LocationInput'
import MapQueryTool from '../MapQueryTool/MapQueryTool'
import { MapQueryResultSet } from '../MapQueryTool/mapQueryUtil';
import CollapsibleFeaturesList from '../CollapsibleFeaturesList/CollapsibleFeaturesList'
//############## END Tivigi imports ##############

import WithRender from './FeatureInfoTool.html';

@WithRender
@Component({
    components: {
        CollapsibleFeaturesList,
        LocationInput,
        MapQueryTool
    }
})
export default class FeatureInfoTool extends Vue {

    //################### BEGIN Props #################
    @Prop()
    map!: ol.Map;

    @Prop({ default: true })
    show!: boolean

    // This is used to emit a window title that includes the number of results to the parent component:
    @Prop({ default: "" })
    title!: string

    @Prop({ default: 5 })
    queryRadius!: number
    //################### END Props #################

    coords: Coordinate|null = null

    resultset = new MapQueryResultSet()

    emitUpdateEvents() {

        this.$emit('update:show', this.resultset.numFeatures() > 0)

        // Emit results:
        this.$emit('update:result', this.resultset)

        //############## BEGIN Emit title update ###############
        let title = "Kartenabfrage: " + this.resultset.numFeatures() + " "

        if (this.resultset.numFeatures() == 1) {
            title += "Ergebnis"
        }
        else {
            title += "Ergebnisse"
        }

        this.$emit('update:title', title)
        //############## END Emit title update ###############        
    }


    onResultUpdate(result: MapQueryResultSet) {
        this.resultset = result;
        this.emitUpdateEvents()
    }
}
