import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

//############### BEGIN OpenLayers imports #############
import * as ol from 'ol/'
import * as ol_proj from 'ol/proj'
import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import * as ol_interaction from 'ol/interaction'

import './ol.css'
import './ol-ext.css'
//############### END OpenLayers imports #############

import MapLoadingProgressBar from "../MapLoadingProgressBar/MapLoadingProgressBar"
import Superbutton from "../../Superbutton/Superbutton"
import FloatingWindow from "../../FloatingWindow/FloatingWindow"
import SidebarPanel from '../../SidebarPanel/SidebarPanel'
import { getUrlState, setUrlState } from 'tivigi/src/util/urlStateKeeping';


// Import element resize event directive:
import "../../../directives/v-onresize"


import './MapPanel.scss'

import WithRender from './MapPanel.html';
import { DragPan, MouseWheelZoom } from 'ol/interaction';
import { platformModifierKeyOnly } from 'ol/events/condition';



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
        FloatingWindow,
        MapLoadingProgressBar,
        Superbutton,
        SidebarPanel
    }
})
export default class MapPanel extends Vue {

    //################## BEGIN Props ##################
    @Prop()
    map!: ol.Map;

    @Prop({ default: () => { return [-180, -90, 180, 90] } })
    initialExtent!: Extent

    @Prop({ default: "EPSG:4326" })
    initialExtentSrs!: ol_proj.ProjectionLike

    @Prop({ default: true })
    showLoadingBar!: boolean

    @Prop({ default: true })
    showMobileButtons!: boolean

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

    showHelpWindow = false

    touchscreenMode: Boolean | null = null

    initialExtentSet = false


    @Watch('map')
    onMapChange() {
        this.init()
    }


    beforedestroy() {

        window.clearInterval(this.keyboardPanInterval)

        this.map.un('moveend', this.updateUrlExtent)

        window.removeEventListener('keydown', this.onWindowKeyDown)
        window.removeEventListener('mousedown', this.onWindowMouseDown)
    }


    getControlModeButtonTitle(): string {

        return "Umschalten auf " + (this.touchscreenMode ? 'Desktop' : 'Touchscreen') + "-Modus"
    }


    getControlModeIconUrl(): string {
        if (this.map == undefined) {
            return ""
        }

        return this.touchscreenMode ? "/tivigi/img/touchscreen.svg" : "/tivigi/img/mouse.svg"
    }


    init() {

        if (!(this.map instanceof ol.Map)) {
            return
        }

        this.touchscreenMode = this.map.get("touchscreenMode")


        // Remove old interval timer and event handlers before creating new ones:
        this.beforedestroy()

        // Get target HTML element:
        this.mapTargetElem = this.$refs['mapContainer'] as HTMLElement

        this.map.setTarget(this.mapTargetElem);

        // Fire "map mounted" event_
        // NOTE: Currently, only the "FileDropTool" component listens to this event
        this.map.dispatchEvent("mounted")



      //  this.setInitialMapExtent()

        if (this.map.get("setUrlState")) {
            this.map.on('moveend', this.updateUrlExtent)
        }

        // Add event listeners for accessibility features (toggle keyboard control):
        window.addEventListener('keydown', this.onWindowKeyDown);
        window.addEventListener('mousedown', this.onWindowMouseDown);

        this.keyboardPanInterval = window.setInterval(this.panStep, 50)
    }


    mounted() {
        this.init()
    }


    onDragover(evt: DragEvent) {

        // First, prevent the browser from performing the default action on drop, 
        // e.g. just opening a dropped file in the browser viewport;
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer!.dropEffect = 'copy';

        // Then, do our custom things:

        let mouseCoords = this.map.getCoordinateFromPixel([evt.offsetX, evt.offsetY])

        let coords2 = ol_proj.transform(mouseCoords, this.map.getView().getProjection(), 'EPSG:4326');

        this.$emit('dragover', new MapDragEvent(evt, coords2))
    }


    onDrop(evt: DragEvent) {
        let mouseCoords = this.map.getCoordinateFromPixel([evt.offsetX, evt.offsetY])

        let coords2 = ol_proj.transform(mouseCoords, this.map.getView().getProjection(), 'EPSG:4326');

        this.$emit('drop', new MapDropEvent(evt, coords2))
    }


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

    
        // Resize map to fit the size of its container element when the container was resized:        
        this.map.updateSize();

        if (!this.initialExtentSet) {
            this.setInitialMapExtent()
            this.initialExtentSet = true
        }
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


    setInitialMapExtent() {
        if (!(this.map instanceof ol.Map)) {
            return
        }

        //#################### BEGIN Try to read map extent from URL #######################
        let state = getUrlState()


        var name = this.map.get("name")


        // Set extent from URL:
        if (state[name] != undefined) {
            if (state[name].extent != undefined) {
                //this.map.getView().fit(state[name].extent, { size: this.map.getSize() })
                this.map.getView().fit(state[name].extent)
                return
            }
        }
        //#################### END Try to read map extent from URL #######################


        // If no extent for this map is defined in the URL, set extent to configured initial extent:
        // Set intial extent:
        let extent_transformed = ol_proj.transformExtent(this.initialExtent, this.initialExtentSrs, this.map.getView().getProjection())

        this.map.getView().fit(extent_transformed);
    }


    switchControlMode() {

        this.touchscreenMode = !this.touchscreenMode
        this.map.set("touchscreenMode", this.touchscreenMode)


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


        let interactions = this.touchscreenMode ? interactions_touchscreen : interactions_default


        for (let ia of this.map.getInteractions().getArray()) {
            this.map.removeInteraction(ia)
        }

        for (let ia of interactions.getArray()) {

            this.map.addInteraction(ia)
        }
    }


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
}
