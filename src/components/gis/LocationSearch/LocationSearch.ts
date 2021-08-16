// THIS LINE IS FOR TESTING
// TODO: 1 Implement functionality to set query from outside
// TODO: 2 Remove hard-coded limitation to Germany
// TODO: 4 Perhaps remove OpenLayers dependency from here?

import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol'
import * as ol_proj from 'ol/proj'
import * as ol_extent from 'ol/extent'

import {getDistance} from 'ol/sphere';

import Superbutton from 'tivigi/src/components/Superbutton/Superbutton'
import Superinput from 'tivigi/src/components/Superinput/Superinput'
import FloatingWindow from 'tivigi/src/components/FloatingWindow/FloatingWindow'

import WithRender from './LocationSearch.html';
import './LocationSearch.scss';


@WithRender
@Component({
    components: {
        FloatingWindow,
        Superbutton,
        Superinput
    }
})
export default class LocationSearch extends Vue {

    //################### BEGIN Props ###################
    @Prop()
    map!: ol.Map;

    
    @Prop({ default: () => { return ['place', 'boundary', 'highway'] } })
    osmKeys!: Array<string>

    @Prop({
        default: () => {
            return ['town', 'village', 'city', 'borough', 'suburb', 'quarter', 'postcode',
                'county', 'state', 'administrative', 'residential', 'living_street',
                'pedestrian', 'unclassified', 'tertiary', 'secondary', 'primary']
        }
    })
    osmValues!: Array<string>

    @Prop({default:""})
    query! : string

    @Prop()
    searchExtent!: Array<number>

    //################### END Props ###################


    // threshold in m to decided wheter search result is a duplicate
    dist: number = 3000

    pQuery: string = ""

    lastQuery: string = ""

    showResults = false

    result: Array<any> | null = null;


    get title(): string {

        if (this.result == null) {
            return ""
        }
        return this.result.length + ' Ergebnisse für &quot;' + this.lastQuery + '&quot;:'
    }


    @Watch('query')
    onQueryChange() {
        this.pQuery = this.query
    }


    


    onEntryClick(entry: any) {
        this.$emit('locationSelect', entry)

        this.onLocationSelect(entry)

        // Close results window when search result entry is selected:
        this.showResults = false
    }


    onLocationSelect(location: any) {
        
        // TODO: 3 Move this to separate component to get rid of OpenLayers dependencies in this component

        if (this.map != undefined) {

            let min = [parseFloat(location.boundingbox[2]), parseFloat(location.boundingbox[0])]
            let max = [parseFloat(location.boundingbox[3]), parseFloat(location.boundingbox[1])]

            let ext = ol_extent.boundingExtent([min, max]);
            let ext_3857 = ol_proj.transformExtent(ext, 'EPSG:4326', 'EPSG:3857');

            this.map.getView().fit(ext_3857, { maxZoom: 19 });
        }        
    }


    onSearchButtonClick(evt: InputEvent) {

        if (this.pQuery == "") {
            alert("Bitte geben Sie einen Suchbegriff ein.")
            return
        }

        if (this.pQuery == this.lastQuery) {

            this.showResults = true
            return
        }

        this.lastQuery = this.pQuery

        this.$emit("update:query", this.pQuery)

        let urlObj = new URL("https://nominatim.openstreetmap.org/search")

        // TODO: 4 Check for array type
        if (this.searchExtent != undefined) {
            urlObj.searchParams.append("viewboxlbrt", this.searchExtent[0] + ","
                + this.searchExtent[1] + ","
                + this.searchExtent[2] + ","
                + this.searchExtent[3])
        }

        urlObj.searchParams.append("countrycodes", "de")
        urlObj.searchParams.append("bounded", "1")
        urlObj.searchParams.append("dedupe", "1")
        urlObj.searchParams.append("format", "json")
        urlObj.searchParams.append("polygon", "0")
        urlObj.searchParams.append("addressdetails", "1")
        urlObj.searchParams.append("extratags", "1")
        urlObj.searchParams.append("limit", "10")
        urlObj.searchParams.append("q", this.pQuery)

        // TODO: 3 Understand why this doesn't work with proxyfetch()
        fetch(urlObj.toString()).then(response => response.json()).then(data => this.processSearchResult(data))
    }


    processSearchResult(data: Array<any>) {

        let filter: Array<any> = []

        // Array which contains the final results

        // throw out everything bsides cities, streets and adminstrative districts
        for (let obj of data) {

            if (this.osmKeys.includes(obj.class) && this.osmValues.includes(obj.type)) {
                filter.push(obj)
            }
        }

        // If there are more than one check if those results are different from each other
        if(filter.length != 1) {

            // start filtering, this code is pretty ugly and might need some refactoring, but it works
            for (let obj of filter) {

                for (let objTmp of filter) {

                    if(!(obj == objTmp)){   
                        
                        let distance: number = getDistance([obj.lon, obj.lat], [objTmp.lon, objTmp.lat])
                        
                        if(distance < this.dist){
                            let index: number = filter.indexOf(objTmp)
                            filter.splice(index, 1)
                        }
                    }

                }

            }
    
        }

        // check if county in filter, counties as nodes (type=county) as well as relations (administrative=boarder)

        for (let obj of filter) {

            if (obj.type == 'county') {

                filter = [obj]

                break
            }
        }

        this.result = filter
        

        if (this.result != null) {
            this.showResults = true
        }
    }
}
