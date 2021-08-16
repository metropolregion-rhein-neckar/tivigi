import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import moment from 'moment'

//############## BEGIN OpenLayers imports ###############
import * as ol from 'ol'
import * as ol_proj from 'ol/proj'
import * as ol_source from 'ol/source'
import * as ol_layer from 'ol/layer'
import * as ol_style from 'ol/style'
import * as ol_geom from 'ol/geom'
//############## END OpenLayers imports ###############

import Collapsible from '../../../Collapsible/Collapsible'
import DateTimeNative from '../../../DateTimeNative/DateTimeNative'
import LocationInput from '../../LocationInput/LocationInput'

import HereRouteInstructionsView from "../HereRouteInstructionsView/HereRouteInstructionsView"
import { HereRoutingClient } from 'tivigi/src/components/gis/HereRouting/HereRoutingClient';
import { HereRoutingSettings } from 'tivigi/src/components/gis/HereRouting/HereRoutingSettings';


import WithRender from './HereRouting.html';

// TODO: 1 Combination of "pedestrian" and "short" not allowed

// TODO: 2 Store routing settings in object and submit this object to parent component for
// Visualization on the map

@WithRender
@Component({
    components: {
        Collapsible,
        DateTimeNative,
        HereRouteInstructionsView,
        LocationInput
    }
})
export default class HereRouting extends Vue {

    // TODO: Move displaying of route on map to routing result view

    //############### BEGIN Props ################
    @Prop()
    map!: ol.Map;

    @Prop()
    hereApiKey!: string

    @Prop()
    routingResult: any
    
    @Prop()
    routingSettings! : HereRoutingSettings

    //############### END Props ################

    
    // Available modes:
    transportModes = [{"key":"car", "label":"PKW"}, {"key":"truck", "label": "LKW"}, 
    {"key":"pedestrian", "label":"Zu Fuß"}, {"key":"bicycle", "label":"Fahrrad"}, 
    {"key":"scooter", "label":"Motorroller"}]
    
    routingModes = [{"key":"fast", "label":"Schnellste Strecke"}, {"key":"short", "label":"Kürzeste Strecke"}]

    // Selected mode:
    transportMode = "truck"
    routingMode = "short"

    mapPickState = false

    coords_start = [7.86, 49.69]
    coords_end = [9.34, 49.33]


    truck_height_cm = 300
    truck_grossWeight_kg = 1000000
    truck_width_cm = 3000
    truck_length_cm = 10000
    truck_weightPerAxle_kg = 10000

    datetime_departure = moment().format('YYYY-MM-DD') + "T" +  moment().format("HH:mm") + ":00"
    

    //############### BEGIN Computed property addBlockadeMode #############
    _addBlockadeMode = false

    get addBlockadeMode(): boolean {
        return this._addBlockadeMode
    }


    set addBlockadeMode(newval: boolean) {
        this._addBlockadeMode = newval

        let mapDiv = this.map.getTarget() as HTMLDivElement

        if (this._addBlockadeMode) {
            mapDiv.style.cursor = "crosshair"
            this.map.on('click', this.onMapClick_addBlockade)
        }
        else {
            mapDiv.style.cursor = ""
            this.map.un('click', this.onMapClick_addBlockade)
        }
    }
    //############### END Computed property addBlockadeMode #############


    //################# BEGIN Set up vector layers #################

    vectorSource_blockades = new ol_source.Vector()

    vectorLayer_blockades = new ol_layer.Vector({
        source: this.vectorSource_blockades,

        //@ts-ignore
        title: "Routing: Blockierte Bereiche"
    });
    //################# END Set up vector layers #################



    beforeDestroy() {
        this.map.removeLayer(this.vectorLayer_blockades)

    }


    mounted() {

        let styleFunc_blockades = function () {
            return new ol_style.Style({

                image: new ol_style.Icon({
                    crossOrigin: 'anonymous',
                    src: "tivigi/img/here_routing/no-entry.svg",
                    scale: 0.05
                })

            })
        }


        this.vectorLayer_blockades.setStyle(styleFunc_blockades)

        let layers = this.map.getLayers().getArray()

        if (!layers.includes(this.vectorLayer_blockades)) {
            this.map.addLayer(this.vectorLayer_blockades)
        }

        this.vectorLayer_blockades.setZIndex(11)


        this.vectorLayer_blockades.setVisible(true)

    }


    onAddBlockadeButtonClick() {
        this.addBlockadeMode = true
    }


    onClearBlockadesButtonClick() {
        this.vectorSource_blockades.clear()
    }


    onMapClick_addBlockade(evt: ol.MapBrowserEvent) {
        this.addBlockadeMode = false

        let wp0_4326 = ol_proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326')

        let geom = new ol_geom.Point(evt.coordinate)

        let feature = new ol.Feature(geom)

        this.vectorSource_blockades.addFeature(feature)
    }


    async requestRoute() {

      
        console.log(this.datetime_departure)
        
        let waypoint0 = this.coords_start[1] + "," + this.coords_start[0]
        let waypoint1 = this.coords_end[1] + "," + this.coords_end[0]

        //################### BEGIN Build query URL for API version 8.16.0 ##################

        let url = new URL("https://router.hereapi.com/v8/routes")

        url.searchParams.append("apiKey", this.hereApiKey)
        url.searchParams.append("destination", waypoint1)
        url.searchParams.append("origin", waypoint0)
        url.searchParams.append("departureTime", this.datetime_departure)
        url.searchParams.append("return", "polyline,actions,instructions")
        url.searchParams.append("transportMode", this.transportMode)
        url.searchParams.append("routingMode", this.routingMode)
        url.searchParams.append("lang", "de-DE")


        if (this.transportMode == "truck") {
            url.searchParams.append("truck[height]", this.truck_height_cm.toString())
            url.searchParams.append("truck[grossWeight]", this.truck_grossWeight_kg.toString())
            url.searchParams.append("truck[width]", this.truck_width_cm.toString())
            url.searchParams.append("truck[length]", this.truck_length_cm.toString())
            url.searchParams.append("truck[weightPerAxle]", this.truck_weightPerAxle_kg.toString())
        }


        //######################### BEGIN Add blockades ############################
        let blockades = this.vectorSource_blockades.getFeatures()

        if (blockades.length > 0) {

            let areasStringPieces = []

            let radius = 20

            for (let blockade of blockades) {
                let geom = blockade.getGeometry() as ol_geom.Point

                let coords = geom.getCoordinates()

                let bottomLeft = [coords[0] - radius, coords[1] - radius]
                let TopRight = [coords[0] + radius, coords[1] + radius]

                let bottomLeft_4326 = ol_proj.transform(bottomLeft, 'EPSG:3857', 'EPSG:4326')
                let topRight_4326 = ol_proj.transform(TopRight, 'EPSG:3857', 'EPSG:4326')

                areasStringPieces.push("bbox:" + bottomLeft_4326[0] + "," + bottomLeft_4326[1] + "," + topRight_4326[0] + "," + topRight_4326[1])
            }

            url.searchParams.append("avoid[areas]", areasStringPieces.join("|"))
        }
        //######################### END Add blockades ############################

        //################### END Build query URL for API version 8.16.0 ##################

        // NOTE: Apparently, we can and actually *must* use the standard fetch function here. 
        // For a reason not yet examined, the request does not work with proxyfetch().
        // TODO: 3 Understand why this does not work with polyfetch()
        let response = await fetch(url.toString())

        let responseJson = await response.json()

        if (response.status == 200) {
           
            this.$emit("update:routingResult", responseJson.routes[0])
            
        }
        else if (response.status == 400) {
            alert("Fehler bei der Routenabfrage: " + responseJson.cause)
        }

        else {
            alert("Fehler bei der Routenabfrage")
        }
        
        
     

        /*
       let hereApi = new HereRoutingClient(this.hereApiKey)

        

        hereApi.coords_start = this.coords_start
        hereApi.coords_end = this.coords_end
        hereApi.departureTime = this.departureTime
        hereApi.departureDate = this.departureDate
        hereApi.transportMode = this.transportMode

        hereApi.truck_height_cm = this.truck_height_cm
        hereApi.truck_length_cm = this.truck_length_cm
        hereApi.truck_width_cm = this.truck_width_cm
        hereApi.truck_weightPerAxle_kg = this.truck_weightPerAxle_kg
        hereApi.truck_grossWeight_kg = this.truck_weightPerAxle_kg
        
        let route = await hereApi.requestRoute()
        */
    }
}
