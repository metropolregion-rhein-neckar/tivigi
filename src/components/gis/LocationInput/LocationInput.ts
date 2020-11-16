import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

//############ BEGIN OpenLayers imports ############
import * as ol from 'ol'
import * as ol_proj from 'ol/proj'
import { Coordinate } from 'ol/coordinate';
//############ END OpenLayers imports ############

import WithRender from './LocationInput.html';

import './LocationInput.scss';

@WithRender
@Component({})
export default class LocationInput extends Vue {

    //############### BEGIN Props ###############
    @Prop({ default: false })
    alwaysEnabled!: boolean

    @Prop({ default: undefined })
    crs!: string

    @Prop({ default: "crosshair" })
    cursor!: string

    @Prop()
    map!: ol.Map;

    /*
    @Prop({ default: 0 })
    markerOffsetX!: number

    @Prop({ default: 0 })
    markerOffsetY!: number
*/
    @Prop({ default: true })
    showMarker!: boolean

    @Prop({default:40})
    markerWidth!: number
    
    @Prop({default:40})
    markerHeight!: number


    @Prop()
    markerUrl!: string
    //############### END Props ###############

    overlay_marker = new ol.Overlay({ autoPan: false });

    coords: Coordinate | null = null

    lonlat: Coordinate | null = null

    pMapPickState = false


    get dynamicClass(): any {        

        return {
            "Button" : true,
            "Input": true,
            "Button--active" : this.mapPickState
        }
    }


    get dynamicStyle_marker(): any {

        return {
            "left": -this.markerWidth/2 + "px",
            "top": -this.markerHeight + "px",
            "width" : this.markerWidth + "px",
            "height" : this.markerHeight + "px"
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
    }


    onMapPick() {
        this.mapPickState = true
    }


    onMapClick(evt: ol.MapBrowserEvent) {


        if (!(this.map instanceof ol.Map)) {
            return
        }

        if (evt.coordinate == null) {
            return
        }

        if (!this.alwaysEnabled) {
            this.mapPickState = false
        }

        // Update coordinates:
        this.coords = evt.coordinate

        if (this.coords != null) {

            // Also store coordinates in WGS 84 for display:
            this.lonlat = ol_proj.transform(this.coords, this.map.getView().getProjection(), 'EPSG:4326')

            // Update overlay position:
            this.overlay_marker.setPosition(this.coords);


            //############# BEGIN Communicate selected coordinates through input event ##############
            let exportCoords = [this.coords[0], this.coords[1]]

            if (this.crs != undefined) {
                exportCoords = ol_proj.transform(this.coords, this.map.getView().getProjection(), this.crs)
            }

            this.$emit('input', exportCoords)
        }
        //############# END Communicate selected coordinates through input event ##############
    }
}
