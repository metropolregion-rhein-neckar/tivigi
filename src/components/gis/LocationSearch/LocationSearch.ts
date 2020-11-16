import { Component, Vue, Prop } from 'vue-property-decorator';

import * as ol from 'ol'
import * as ol_proj from 'ol/proj'
import * as ol_extent from 'ol/extent'

import * as turf from '@turf/turf'

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

    @Prop()
    searchExtent!: ol_extent.Extent

    @Prop({ default: () => { return ['place', 'boundary', 'highway'] } })
    osmKeys!: Array<string>


    @Prop({
        default: () => {
            return ['town', 'village', 'city', 'borough', 'suburb', 'quarter', 'postcode',
                'county', 'state', 'administrative', 'residential', 'living_street',
                'pedestrian', 'unclassified', 'tertiary', 'secondary', 'primary']
        }
    })
    //################### END Props ###################


    osmValues!: Array<string>


    query: string = ""

    lastQuery: string = ""

    showResults = false

    result: Array<any> | null = null;


    get title(): string {

        if (this.result == null) {
            return ""
        }
        return this.result.length + ' Ergebnisse für &quot;' + this.lastQuery + '&quot;:'
    }

    
    onBlur() {
        
        if (this.query == "") {
            this.query = this.lastQuery
        }
    }


    onEntryClick(entry: any) {
        this.$emit('locationSelect', entry)

        this.onLocationSelect(entry)

        // Close results window when search result entry is selected:
        this.showResults = false
    }


   


    onLocationSelect(location: any) {

        let min = [parseFloat(location.boundingbox[2]), parseFloat(location.boundingbox[0])]
        let max = [parseFloat(location.boundingbox[3]), parseFloat(location.boundingbox[1])]

        let ext = ol_extent.boundingExtent([min, max]);
        let ext_3857 = ol_proj.transformExtent(ext, 'EPSG:4326', 'EPSG:3857');

        this.map.getView().fit(ext_3857, { maxZoom: 19 });
    }


    onSearchButtonClick(evt: InputEvent) {

        //evt.preventDefault()

        if (this.query == "") {
            alert("Bitte geben Sie einen Suchbegriff ein.")
            return
        }

        if (this.query == this.lastQuery) {

            this.showResults = true
            return
        }

        this.lastQuery = this.query

        //  let viewbox : string = '7.9529214,49.0251007,9.2630410,49.7615924'

        //let url = "https://nominatim.openstreetmap.org/search?&countrycodes=de&viewboxlbrt=" 
        // + bbox_string 
        // + "&bounded=1&dedupe=1&format=json&polygon=0&addressdetails=1&extratags=1&limit=10&q=" + this.query

        var urlObj = new URL("https://nominatim.openstreetmap.org/search")

      
        // TODO: 2 Check for array type
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
        urlObj.searchParams.append("q", this.query)

        

        fetch(urlObj.toString()).then(response => response.json()).then(data => this.processSearchResult(data))
    }


    processSearchResult(data: Array<any>) {

        let filter: Array<any> = []

        // Array which contains the final results
        let final2: Array<any> = []


        // throw out everything bsides cities, streets and adminstrative districts
        for (let i = 0; i < data.length; i += 1) {
            let obj = data[i]

            //if(keys_osm.includes(obj.class)  && values_osm.includes(obj.type)){
            if (this.osmKeys.includes(obj.class) && this.osmValues.includes(obj.type)) {
                filter.push(obj)
            }
        }


        // If only one rsult was found
        if (filter.length == 1) {
            final2 = filter
        }


        // If there are more than one check if those results are different from each other
        if (filter.length >= 2) {
            let coords: Array<number> = []

            // check if results contains a node, if yes take the first node as reference point
            for (let i = 0; i < filter.length; i += 1) {
                let obj = filter[i]

                if (obj.osm_type == 'node') {
                    final2.push(obj)
                    coords.push(obj.lon, obj.lat)
                    break
                }
            }


            // In case no Node is found use the first relation
            if (coords.length == 0) {
                for (let i = 0; i < filter.length; i += 1) {
                    let obj = filter[i]

                    if (obj.osm_type == 'relation') {
                        coords.push(obj.lon, obj.lat)
                        final2.push(obj)
                        break
                    }
                }
            }

            // Same for Ways (Streets) 
            let type_way: boolean = false;

            if (coords.length == 0) {
                for (let i = 0; i < filter.length; i += 1) {
                    let obj = filter[i]

                    if (obj.osm_type == 'way') {
                        type_way = true
                        coords.push(obj.lon, obj.lat)
                        final2.push(obj)
                        break
                    }
                }
            }



            // start filtering, this code is pretty ugly and might need some refactoring, but it works
            for (let i = 0; i < filter.length; i += 1) {

                let obj_tmp: any = filter[i]

                let coords_tmp: Array<number> = [obj_tmp.lon, obj_tmp.lat]

                let point_tmp: any = turf.point(coords_tmp)

                for (let j = 0; j < filter.length; j += 1) {

                    if (type_way == false && obj_tmp.osm_type == 'way') {
                        // pass
                    }

                    else {

                        let obj_tmp_2: any = filter[j]

                        let coords_tmp_2: Array<number> = [obj_tmp_2.lon, obj_tmp_2.lat]

                        let point_tmp_2: any = turf.point(coords_tmp_2)

                        let options: object = { units: 'kilometers' }

                        let distance_2: number = turf.distance(point_tmp, point_tmp_2, options)


                        let dist: number = 12


                        if (type_way == true) {
                            dist = 3
                        }


                        if (distance_2 > dist && final2.includes(obj_tmp) == false) {
                            if (final2.length == 0) {
                                final2.push(obj_tmp)

                            }

                            else {

                                // otherwise some relations will be pushed again therefore another check
                                // is needed
                                for (let g = 0; g < final2.length; g += 1) {
                                    let obj_tmp_3: any = final2[g]

                                    let coords_tmp_3: Array<number> = [obj_tmp_3.lon, obj_tmp_3.lat]

                                    let point_tmp_3: any = turf.point(coords_tmp_3)

                                    let options: object = { units: 'kilometers' }

                                    let distance_3: number = turf.distance(point_tmp, point_tmp_3, options)

                                    if (distance_3 > 12 && final2.includes(obj_tmp) == false) {
                                        final2.push(obj_tmp)
                                    }
                                }
                            }

                        }
                    }


                }

            }
        }

        let state_bool: Boolean = false;
        let final_state: Array<any> = [];

        for (let i = 0; i < final2.length; i++) {
            let obj: any = final2[i]

            if (obj.type == 'county') {
                state_bool = true
                final_state.push(obj)
                break
            }
        }

        if (state_bool == true) {
            this.result = final_state
        }
        else {
            this.result = final2
        }

        if (this.result != null) {
            this.showResults = true
        }
    }
}
