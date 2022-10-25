import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

//############### BEGIN OpenLayers imports #############
import * as ol from 'ol/'
import * as ol_proj from 'ol/proj'
import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import * as ol_interaction from 'ol/interaction'
import { DragPan, MouseWheelZoom } from 'ol/interaction';
import { platformModifierKeyOnly, altKeyOnly } from 'ol/events/condition';



import './ol.css'
import './ol-ext.css'
//############### END OpenLayers imports #############

import MapLoadingProgressBar from "tivigi/src/components/gis/MapLoadingProgressBar/MapLoadingProgressBar"
import { getUrlState, setUrlState } from 'tivigi/src/util/urlStateKeeping';
import "tivigi/src/directives/v-onresize"

import WithRender from './OlMap.html';
import './OlMap.scss'


//############### BEGIN Helper classes for drag & drop events #################
export class MapDragEvent {
    constructor(public dragEvent: DragEvent, public coordinate: Coordinate) { }
}

export class MapDropEvent {
    constructor(public dragEvent: DragEvent, public coordinate: Coordinate) { }
}
//############### END Helper classes for drag & drop events #################


@WithRender
@Component({
    components: {

        MapLoadingProgressBar
    }
})
export default class OlMap extends Vue {

    //################## BEGIN Props ##################
    @Prop(
        /*
        {
        
        default: () => {
            return new ol.Map({

                interactions: ol_interaction.defaults({ keyboard: false }),

                view: new ol.View({
                    center: [0, 0],
                    zoom: 19

                })
            })
        }
        
    }
    */
    )
    map!: ol.Map;

    //@Prop({ default: () => { return [-180, -90, 180, 90] } })
    @Prop()
    extent!: Extent

    @Prop({ default: "EPSG:4326" })
    extentSrs!: ol_proj.ProjectionLike

    @Prop({ default: true })
    showLoadingBar!: boolean
    //################## END Props ##################


    mapTargetElem!: HTMLElement

    panAccelInit = 0.3
    panDeltaInit = 2

    panAccel = this.panAccelInit
    panDelta = this.panDeltaInit

    panX = 0
    panY = 0

    hasFocus = false

    keyboardPanInterval = 0

    lastMouseMoveCoordinate: Coordinate = [0, 0]

    touchScreenMode: Boolean | null = null

   

    @Watch("extent")
    onHomeExtentChange() {
        //console.log(this.extent)
        this.setMapExtent(this.extent)
    }


    @Watch("map")
    onMapChange() {
        this.init()
    }


    beforedestroy() {

        window.clearInterval(this.keyboardPanInterval)

        //this.map.un('moveend', this.onMapMoveEnd)

        window.removeEventListener('keydown', this.onWindowKeyDown)
        window.removeEventListener('mousedown', this.onWindowMouseDown)
    }


    init() {

        if (!(this.map instanceof ol.Map)) {
            return
        }

        if (this.map == undefined) {
            return
        }
        
        this.setMapExtent(this.extent)


        this.touchScreenMode = this.map.get("touchScreenMode")


        // Remove old interval timer and event handlers before creating new ones:
        this.beforedestroy()

        // Get target HTML element:
        this.mapTargetElem = this.$refs['mapContainer'] as HTMLElement

        this.map.setTarget(this.mapTargetElem);

        
        // Fire "map mounted" event_
        // NOTE: Currently, only the "FileDropTool" component listens to this event
        this.map.dispatchEvent("mounted")

        //this.map.on('moveend', this.onMapMoveEnd)
        
        
        // ToDo: implement this corrrectly
        //this.map.on('change:size', this.onSizeChange)

        


        // Add event listeners for accessibility features (toggle keyboard control):
        window.addEventListener('keydown', this.onWindowKeyDown);
        window.addEventListener('mousedown', this.onWindowMouseDown);

        this.keyboardPanInterval = window.setInterval(this.panStep, 50)
    }


    mounted() {
        this.init()
    }


    // otherwise extent not stable for map fullscreen mode
    // onSizeChange(){
    //     
    //     window.setTimeout(()=>{
    //         this.map.getView().fit(this.map.getView().calculateExtent(this.map.getSize()), {size:this.map.getSize()})
    //     }, 0)
    // }

    onFocus(evt: FocusEvent) {
        this.hasFocus = true
        this.mapTargetElem.addEventListener("keydown", this.onKeyDown)
        this.mapTargetElem.addEventListener("keyup", this.onKeyUp)
    }


    onFocusOut(evt: FocusEvent) {

        this.hasFocus = false
        this.mapTargetElem.removeEventListener("keydown", this.onKeyDown)
        this.mapTargetElem.removeEventListener("keyup", this.onKeyUp)
    }


    onKeyDown(evt: KeyboardEvent) {

        switch (evt.key) {
            case "ArrowLeft": {

                this.panX = -1
                break
            }
            case "ArrowRight": {

                this.panX = 1
                break
            }
            case "ArrowUp": {

                this.panY = 1
                break
            }
            case "ArrowDown": {

                this.panY = -1
                break;
            }

            case "Enter":
            case " ": {


                let center = this.map.getView().getCenter()

                if (center != undefined) {
                    let pointerEvent = new PointerEvent("click")
                    let mbpe = new ol.MapBrowserEvent("click", this.map, pointerEvent)
                    mbpe.coordinate = center
                    this.map.dispatchEvent(mbpe)
                }

                break;
            }
        }
    }


    onKeyUp(evt: KeyboardEvent) {

        switch (evt.key) {
            case "ArrowLeft":
            case "ArrowRight": {
                this.panAccel = this.panAccelInit

                if (this.panY == 0) {
                    this.panDelta = this.panDeltaInit
                }

                this.panX = 0
                break
            }

            case "ArrowUp":
            case "ArrowDown":
                this.panAccel = this.panAccelInit

                if (this.panX == 0) {
                    this.panDelta = this.panDeltaInit
                }

                this.panY = 0
                break
        }
    }


    onMapMoveEnd() {

        const extent = this.map.getView().calculateExtent()
     
        
        this.$emit("update:extent", extent)
    }


    onWindowKeyDown(evt: KeyboardEvent) {
        if (evt.key == 'Tab') {
            this.mapTargetElem.setAttribute("tabindex", "0")
        }
    }


    onWindowMouseDown(evt: MouseEvent) {
        this.mapTargetElem.removeAttribute("tabindex")
    }


    onResize() {

        if (!(this.map instanceof ol.Map)) {
            return
        }

        const extent = this.map.getView().calculateExtent()
        // Resize map to fit the size of its container element when the container was resized:        
        this.map.updateSize();

        this.map.getView().fit(extent)
    }


    panByPixels(x: number, y: number) {

        if (!(this.map instanceof ol.Map)) {
            return
        }

        let center = this.map.getView().getCenter();
        let resolution = this.map.getView().getResolution();

        if (center != undefined && resolution != undefined) {

            this.map.getView().setCenter([center[0] + x * resolution, center[1] + y * resolution]);
        }
    }


    panStep() {

        if (this.panX == 0 && this.panY == 0) {
            return
        }

        if (this.panDelta < 30) {
            this.panDelta += this.panAccel
        }

        this.panByPixels(this.panX * this.panDelta, this.panY * this.panDelta)
    }


    setMapExtent(extent: Extent) {

        if (!(this.map instanceof ol.Map)) {
            return
        }
      
        if (JSON.stringify(this.map.getView().calculateExtent()) == JSON.stringify(extent)) {
            return
        }

      
        //#################### BEGIN Try to read map extent from URL #######################
        /*
        const state = getUrlState()


        const name = this.map.get("name")


        // Set extent from URL:
        if (state[name] != undefined && state[name].extent != undefined) {
            this.map.getView().fit(state[name].extent)
            return

        }
        */
        //#################### END Try to read map extent from URL #######################


        if (extent == undefined) {
            return
        }

        // If no extent for this map is defined in the URL, set extent to configured initial extent:
        // Set intial extent:
        const extent_transformed = ol_proj.transformExtent(extent, this.extentSrs, this.map.getView().getProjection())

        
        this.map.getView().fit(extent_transformed);

        
    }


    switchControlMode() {

        this.touchScreenMode = !this.touchScreenMode
        this.map.set("touchScreenMode", this.touchScreenMode)


        // See https://openlayers.org/en/latest/examples/two-finger-pan-scroll.html

        const interactions_default = ol_interaction.defaults({ keyboard: false })

        const interactions_touchscreen = ol_interaction.defaults({ dragPan: false, mouseWheelZoom: false }).extend([
            new DragPan({
                condition: function (event) {
                    return this.getPointerCount() === 2 || platformModifierKeyOnly(event);
                },
            }),
            new MouseWheelZoom({
                condition: platformModifierKeyOnly,
            })])


        let interactions = this.touchScreenMode ? interactions_touchscreen : interactions_default


        for (let ia of this.map.getInteractions().getArray()) {
            this.map.removeInteraction(ia)
        }

        for (let ia of interactions.getArray()) {

            this.map.addInteraction(ia)
        }
    }


    /*
    updateUrlExtent() {

        if (!(this.map instanceof ol.Map)) {
            return
        }

        let name = this.map.get("name")


        if (name == undefined) {
            return
        }


        let state = getUrlState()

        //################### BEGIN Update map extent #######################        
        let extent = this.map.getView().calculateExtent()

        if (state[name] == undefined) {
            state[name] = {}
        }

        state[name].extent = extent

        //################### END Update map extent #######################

        setUrlState(state)
    }
    */
}

