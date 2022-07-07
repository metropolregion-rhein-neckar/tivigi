import "tivigi/src/directives/v-onresize"

import { Vector2, vector2Max, vector2Min } from 'tivigi/src/util/Vector2';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import AbstractChartElement from '../AbstractChartElement/AbstractChartElement';
import * as uuid from 'uuid'

import AbstractChart from '../chart/AbstractChart/AbstractChart';
import AbstractAxis from '../axis/AbstractAxis/AbstractAxis';

import { BoundingBox } from '../chartDataClasses';


import "./ChartCanvas.scss"
import WithRender from './ChartCanvas.html';
import { ChartLegendItem } from "../ChartLegend/ChartLegendItem";

@WithRender
@Component({
    components: {

    }
})
export default class ChartCanvas extends Vue {

    //#region Props
    @Prop({ default: false })
    debug!: boolean

    @Prop({ default: 35 })
    xLabelsSpace!: number

    @Prop({ default: 60 })
    yLabelsSpace!: number

    //@Prop()
    //left!: number | undefined

    @Prop()
    right!: number | undefined

    @Prop({ default: 50 })
    scaleX!: number | string

    @Prop({ default: 50 })
    scaleY!: number | string

    @Prop()
    extent!: BoundingBox


    //BEGIN Control options
    @Prop({ default: true })
    allowPanX!: boolean

    @Prop({ default: true })
    allowPanY!: boolean

    @Prop({ default: true })
    allowZoomX!: boolean

    @Prop({ default: true })
    allowZoomY!: boolean

    @Prop()
    legend!: Array<ChartLegendItem>
    //END Control options

    //endregion Props

    targetScale = new Vector2()


    mousePos_world_at_pan_start = new Vector2()

    readonly cfg_zoomSpeed = 1.1


    viewBoxSize = new Vector2()

    scale = new Vector2(1, 1)

    chartAreaPos = new Vector2(this.yLabelsSpace, 10)

    chartAreaSize = new Vector2(100, 100)

    // bottomLeftWorld is the coordinates of the lower left corner of the chart area in world coordinates:
    bottomLeftWorld = new Vector2(0, 0)


    panGrabPos1_screen = new Vector2(-1, -1)
    panGrabPos2_screen = new Vector2(-1, -1)


    touchPos1_debug = new Vector2()
    touchPos2_debug = new Vector2()



    viewportChanged = false

    altKeyPressed = false

    readonly clipPathId = "id" + uuid.v4()


    scaleAtPinchStart = new Vector2()


    diff_original = new Vector2()

    prevExtent = ""


    autoScale(doX: boolean, doY: boolean) {

        let min = this.getDisplayMin()
        let max = this.getDisplayMax()

        for (const child of this.$children) {

            if (child instanceof AbstractAxis && child.dimension == "x" && doX) {

                //  max.x = Math.max(child.getNextAxisStep(max.x, false), max.x)
                //  min.x = Math.min(child.getNextAxisStep(min.x, true), min.x)
            }

            if (child instanceof AbstractAxis && child.dimension == "y" && doY) {
                max.y = Math.max(child.getNextAxisStep(max.y, false), max.y)
                min.y = Math.min(child.getNextAxisStep(min.y, true), min.y)
            }
        }

        const range = max.sub(min)



        if (doX) {
            this.bottomLeftWorld.x = min.x
            this.scale.x = this.chartAreaSize.x / range.x
        }

        if (doY) {
            this.bottomLeftWorld.y = min.y
            this.scale.y = this.chartAreaSize.y / range.y
        }


        this.updateChildElements()

    }


    beforeDestroy() {
        //#region Unregister DOM event handlers
        document.removeEventListener("keydown", this.onDocumentKeyDown)
        document.removeEventListener("keyup", this.onDocumentKeyUp)
        document.removeEventListener("mouseup", this.onDocumentMouseUp)
        document.removeEventListener("mousemove", this.onDocumentMouseUp)

        const svg = this.$refs.svg as SVGElement

        svg.removeEventListener("touchstart", this.onTouchStart)
        svg.removeEventListener("touchend", this.onTouchEnd)
        svg.removeEventListener("touchmove", this.onTouchMove)
        svg.removeEventListener("touchcancel", this.onTouchCancel)
        //#endregion Unregister DOM event handlers
    }




    emitExtentChangeEvent() {

        const extent_world = new Vector2(this.chartAreaSize.x / this.scale.x, this.chartAreaSize.y / this.scale.y)

        const max = this.bottomLeftWorld.add(extent_world)


        const bbox_extent = {
            minx: this.bottomLeftWorld.x,
            maxx: max.x,
            miny: this.bottomLeftWorld.y,
            maxy: max.y
        }

        this.$emit("update:extent", bbox_extent)


        //this.$emit("extentChange", bbox_extent)
    }


    getDisplayMax(): Vector2 {
        let result = new Vector2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY)

        for (const child of this.$children) {
            if (child instanceof AbstractChart) {
                result = vector2Max(result, child.getDisplayMax())
            }
        }

        return result
    }



    getDisplayMin(): Vector2 {
        let result = new Vector2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)

        for (const child of this.$children) {
            if (child instanceof AbstractChart) {
                result = vector2Min(result, child.getDisplayMin())
            }
        }

        return result
    }



    getMousePos(evt: MouseEvent): Vector2 {

        return new Vector2(evt.offsetX, evt.offsetY).sub(this.chartAreaPos)
    }


    getStyle() {
        let result: any = {}

        if ((this.allowPanX || this.allowPanY) && (this.scaleX != "auto" || this.scaleY != "auto")) {

            if (this.panGrabPos1_screen.x == -1) {
                result["cursor"] = "grab"
            }
            else {
                result["cursor"] = "grabbing"
            }

        }

        // Not needed:
        //result["width"] = this.viewBoxSize.x + "px"
        //result["height"] = this.viewBoxSize.y + "px"

        return result
    }


    getTouchPos(touch: Touch) {
        const svg = this.$refs.svg as SVGElement
        const rect = svg.getBoundingClientRect();

        const x1 = touch.pageX - rect.left;
        const y1 = touch.pageY - rect.top;

        return new Vector2(x1, y1).sub(this.chartAreaPos)
    }


    getViewBoxString(): string {
        return `0 0 ${this.viewBoxSize.x} ${this.viewBoxSize.y}`
    }


    mounted() {

        if (typeof this.scaleX == "number") {
            this.scale.x = this.scaleX

        }

        if (typeof this.scaleY == "number") {
            this.scale.y = this.scaleY
        }

        this.updateChartAreaSize()

        if (this.extent != undefined && this.extent.maxx != undefined) {
            this.bottomLeftWorld.x = this.extent.maxx - this.chartAreaSize.x / this.scale.x

        }

        this.onExtentPropChange()



        //#region Register DOM event handlers
        document.addEventListener("keydown", this.onDocumentKeyDown)
        document.addEventListener("keyup", this.onDocumentKeyUp)
        document.addEventListener("mouseup", this.onDocumentMouseUp)
        document.addEventListener("mousemove", this.onDocumentMouseMove)

        const svg = this.$refs.svg as SVGElement

        svg.addEventListener("touchstart", this.onTouchStart)
        svg.addEventListener("touchend", this.onTouchEnd)
        svg.addEventListener("touchmove", this.onTouchMove)
        svg.addEventListener("touchcancel", this.onTouchCancel)
        //#endregion Register DOM event handlers
    }



    mousePan(mousePos: Vector2) {

        if (this.panGrabPos1_screen.x == -1 || this.altKeyPressed) {
            return
        }

        const mousePosBefore = this.s2w(mousePos)

        this.pan(mousePosBefore)
    }


    mousePanEnd() {
        if (this.panGrabPos1_screen.x == -1) {
            return
        }

        this.panGrabPos1_screen.x = -1

        if (this.viewportChanged) {

            this.updateChildElements()

            this.emitExtentChangeEvent()

            this.viewportChanged = false
        }
    }



    mousePanStart(pos: Vector2) {
        this.panGrabPos1_screen = pos

        this.mousePos_world_at_pan_start = this.s2w(pos)

    }


    onDataChange() {
        
        this.autoScale(this.scaleX == "auto", this.scaleY == "auto")

        let legend = Array<Array<ChartLegendItem>>()


        for (const child of this.$children) {
            if (child instanceof AbstractChart) {
                legend = legend.concat(child.getLegendData())
            }
        }


        this.$emit("update:legend", legend)
    }


    onDocumentKeyDown(evt: KeyboardEvent) {

        if (evt.code == "AltLeft" || evt.code == "AltRight") {
            this.altKeyPressed = true
        }
    }


    onDocumentKeyUp(evt: KeyboardEvent) {
        if (evt.code == "AltLeft" || evt.code == "AltRight") {
            this.altKeyPressed = false
        }
    }


    onDocumentMouseMove(evt: MouseEvent) {
        const mousePos = new Vector2(evt.clientX, evt.clientY)

        this.mousePan(mousePos)
    }


    onDocumentMouseUp(evt: MouseEvent) {
        this.mousePanEnd()
    }



    @Watch("extent")
    onExtentPropChange() {

        if (this.extent == undefined) {
            return
        }

        if (this.extent.maxx != undefined) {
            this.bottomLeftWorld.x = this.extent.maxx - this.chartAreaSize.x / this.scale.x
        }


        //#region Check whether new extent is same as old. If yes, do nothing
        const extent_world = new Vector2(this.chartAreaSize.x / this.scale.x, this.chartAreaSize.y / this.scale.y)

        const max = this.bottomLeftWorld.add(extent_world)


        const bbox_extent = {
            minx: this.bottomLeftWorld.x,
            maxx: max.x,
            miny: this.bottomLeftWorld.y,
            maxy: max.y
        }
        

        let newExtent = JSON.stringify(this.extent)

        if (newExtent == JSON.stringify(bbox_extent)) {            
            return
        }
        //#endregion Check whether new extent is same as old. If yes, do nothing

        
        // TODO: Apply extent.minx?

        this.updateChildElements()

        this.$forceUpdate()

    }


    onMouseDown(evt: MouseEvent) {
        const pos = new Vector2(evt.clientX, evt.clientY)

        this.mousePanStart(pos)
    }


    onResize(resizeEntry: ResizeObserverEntry) {

        this.updateChartAreaSize()

        this.autoScale(this.scaleX == "auto", this.scaleY == "auto")
    }


    onTouchCancel(evt: TouchEvent) {
        this.mousePanEnd()
    }


    onTouchEnd(evt: TouchEvent) {
        this.mousePanEnd()
    }


    onTouchMove(evt: TouchEvent) {

        if (evt.touches.length != 2) {
            return
        }

        // Don't scroll the page when we pan the chart:
        // Firefox for Android does by default not scroll the page if more than one finger is on the screen,
        // but the Android standard browser (and probably Chrome too?) does, so we need to prevent the
        // event default here:
        evt.preventDefault()

        const pos1 = this.getTouchPos(evt.touches[0])
        const pos2 = this.getTouchPos(evt.touches[1])

        this.touchZoom(pos1, pos2)
    }


    onTouchStart(evt: TouchEvent) {

        if (evt.touches.length != 2) {
            return
        }

        // Don't scroll the page when we pan the chart:
        // Firefox for Android does by default not scroll the page if more than one finger is on the screen,
        // but the Android standard browser (and probably Chrome too?) does, so we need to prevent the
        // event default here:
        evt.preventDefault()

        const pos1 = this.getTouchPos(evt.touches[0])
        const pos2 = this.getTouchPos(evt.touches[1])

        this.touchZoomStart(pos1, pos2)
    }


    onWheel(evt: WheelEvent) {

        if (!this.altKeyPressed) {
            return
        }

        evt.preventDefault()

        const mousePos_screen = this.getMousePos(evt)

        this.mousePos_world_at_pan_start = this.s2w(mousePos_screen)

        this.targetScale = this.scale.clone()

        if (this.allowZoomX && this.scaleX != "auto") {
            if (evt.deltaY < 0) {
                this.scale.x *= this.cfg_zoomSpeed
                this.targetScale.x *= this.cfg_zoomSpeed
            }
            else if (evt.deltaY > 0) {
                this.scale.x /= this.cfg_zoomSpeed
                this.targetScale.x /= this.cfg_zoomSpeed
            }
        }

        // NOTE: The result of s2w is different after scale was changed, 
        // so mousePos_world_now is not the same as this.mousePos_world_at_pan_start       

        this.pan(this.s2w(mousePos_screen))


        this.emitExtentChangeEvent()
    }


    pan(mousePos_world_now: Vector2) {

        const diff = mousePos_world_now.sub(this.mousePos_world_at_pan_start)

        if (!this.allowPanX || this.scaleX == "auto") {
            diff.x = 0
        }
        if (!this.allowPanY || this.scaleY == "auto") {
            diff.y = 0
        }

        if (diff.x == 0 && diff.y == 0) {
            return
        }
        
        this.bottomLeftWorld = this.bottomLeftWorld.sub(diff)

        this.viewportChanged = true

        this.updateChildElements()
    }


    touchZoomStart(pos1: Vector2, pos2: Vector2) {

        this.panGrabPos1_screen = pos1.clone()
        this.panGrabPos2_screen = pos2.clone()

        this.scaleAtPinchStart = this.scale.clone()

        this.mousePos_world_at_pan_start = this.s2w((pos1).add(pos2).scalarMult(0.5))

        this.diff_original = this.panGrabPos1_screen.sub(this.panGrabPos2_screen)
    }


    touchZoom(touchPos1: Vector2, touchPos2: Vector2) {

        this.touchPos1_debug = touchPos1
        this.touchPos2_debug = touchPos2


        if (this.panGrabPos1_screen.x == -1 || this.altKeyPressed) {
            return
        }

        const diff_now = touchPos1.sub(touchPos2)

        const d = new Vector2(diff_now.x / this.diff_original.x, diff_now.y / this.diff_original.y)

        let override = false

        let diff_test = this.diff_original

        
        if (Math.abs(diff_test.x) > Math.abs(diff_test.y) || override) {
            if (this.allowZoomX && this.scaleX != "auto") {
                this.scale.x = this.scaleAtPinchStart.x * d.x
            }
        }
        if (Math.abs(diff_test.x) < Math.abs(diff_test.y) || override) {
            if (this.allowZoomY && this.scaleY != "auto") {
                this.scale.y = this.scaleAtPinchStart.y * d.y
            }
        }


        const mousePos_world_now = this.s2w(touchPos1.add(touchPos2).scalarMult(0.5))

        this.pan(mousePos_world_now)
    }


    touchZoomEnd() {

    }



    updateChartAreaSize() {

        const el = this.$refs.wrapper as HTMLDivElement

        const sx = el.offsetWidth
        const sy = el.offsetHeight

        this.viewBoxSize = new Vector2(sx, sy)

        this.chartAreaSize.x = sx - this.yLabelsSpace
        this.chartAreaSize.y = sy - this.xLabelsSpace

        this.updateChildElements()
    }


    updateChildElements() {
        for (const child of this.$children) {
            if (child instanceof AbstractChartElement) {
                child.onCanvasExtentChange()
            }
        }
    }


    // NOTE: World-to-screen and screen-to-world functions do not take into account the position offset of
    // the chart (chartAreaPos). This must be explicitly added/subtracted for drawing and for pointer input processing.

    s2w(v: Vector2): Vector2 {

        const x = (v.x / this.scale.x) + this.bottomLeftWorld.x
        const y = (this.chartAreaSize.y - v.y) / this.scale.y + this.bottomLeftWorld.y

        return new Vector2(x, y)
    }

    // TODO: w2s()?

    s2wx(pixels: number): number {
        return (pixels / this.scale.x) + this.bottomLeftWorld.x
    }


    s2wy(pixels: number): number {
        return (this.chartAreaSize.y - pixels) / this.scale.y + this.bottomLeftWorld.y
    }


    w2sx(value: number): number {
        return (value - this.bottomLeftWorld.x) * this.scale.x
    }


    w2sy(value: number): number {
        return this.chartAreaSize.y - (value - this.bottomLeftWorld.y) * this.scale.y
    }
}