import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

//############ BEGIN OpenLayers imports ############
import * as ol from 'ol'
import * as ol_proj from 'ol/proj'
import { Coordinate } from 'ol/coordinate';
//############ END OpenLayers imports ############

import Superbutton from '../../Superbutton/Superbutton'
import LocationSearch from '../LocationSearch/LocationSearch'

import WithRender from './LocationInput.html';

import './LocationInput.scss';

@WithRender
@Component({
    components: {
        LocationSearch,
        Superbutton
        
    }
})
export default class LocationInput extends Vue {

    //############### BEGIN Props ###############
    @Prop({ default: false })
    alwaysEnabled!: boolean

    @Prop({ default: "crosshair" })
    cursor!: string

    @Prop()
    map!: ol.Map;

    @Prop()
    markerUrl!: string

    @Prop({ default: true })
    showMarker!: boolean

    // NOTE: If "v-model" is used, the "value" prop holds the value:
    @Prop({ default: null })
    value!: Coordinate | null
    //############### END Props ###############


    overlay_marker = new ol.Overlay({ autoPan: false });

    lonlat: Coordinate | null = null

    pMapPickState = false

    query = ""


    get dynamicClass(): any {

        return {
            "LocationInput__MapPickButton" : true,
            "Button": true,
            "Input": true,
            "Button--active": this.mapPickState
        }
    }


    //################# BEGIN Computed property mapPickState #################
    get mapPickState(): boolean {
        return this.pMapPickState
    }


    set mapPickState(newval: boolean) {

        if (!(this.map instanceof ol.Map)) {
            return
        }

        this.pMapPickState = newval


        let mapTarget = this.map.getTarget() as HTMLElement

        if (mapTarget == undefined) {
            return
        }

        if (this.pMapPickState) {
            mapTarget.style.cursor = this.cursor
            this.map.on('click', this.onMapClick)
        }
        else {
            mapTarget.style.cursor = ""
            this.map.un('click', this.onMapClick)
        }
    }

    //################# END Computed property mapPickState #################


    @Watch('map')
    onMapChange() {
        this.init()
    }


    beforeDestroy() {
        this.mapPickState = false

        if (!(this.map instanceof ol.Map)) {
            return
        }

        this.map.removeOverlay(this.overlay_marker)
    }


    init() {

        if (!(this.map instanceof ol.Map)) {
            return
        }

        let overlayDiv = this.$refs["overlay_marker"] as HTMLDivElement

        this.overlay_marker.setElement(overlayDiv)

        this.map.addOverlay(this.overlay_marker)

        if (this.alwaysEnabled) {
            this.mapPickState = true
        }
    }


    mounted() {

        this.init()

        this.setCoordinate(this.value)
    }


    onLocationSelect(evt : any) {
  

        let lon = parseFloat(evt.lon)
        let lat = parseFloat(evt.lat)

        this.setCoordinate([lon,lat])
    }


    onMapPick() {
        this.mapPickState = true
    }


    onMapClick(evt: ol.MapBrowserEvent) {

        if (evt.coordinate == null) {
            return
        }

        if (!this.alwaysEnabled) {
            this.mapPickState = false
        }

        let coords_4326 = ol_proj.transform(evt.coordinate, this.map.getView().getProjection(), 'EPSG:4326')

        this.query = ""
        
        // Update coordinates:        
        this.setCoordinate(coords_4326)
    }


    setCoordinate(coords_wgs84: Coordinate | null) {

        if (coords_wgs84 == null) {
            return
        }

        

        // Store coordinates for display:

        this.lonlat = coords_wgs84

        this.$emit('input', coords_wgs84)

        // Update overlay position:
        if (this.map instanceof ol.Map) {
            let coords_map = ol_proj.transform(coords_wgs84, 'EPSG:4326', this.map.getView().getProjection())
            this.overlay_marker.setPosition(coords_map);
        }
    }
}
