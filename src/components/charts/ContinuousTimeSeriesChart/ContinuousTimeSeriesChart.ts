// TODO: FIX: Left edge of time series is not loaded under some circumstances

import { Vector2 } from 'tivigi/src/util/Vector2';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import "tivigi/src/directives/v-onresize"
import "tivigi/src/directives/v-on-no-drag-click"
import { zeroPad } from 'tivigi/src/util/formatters';

import "./ContinuousTimeSeriesChart.scss"
import WithRender from './ContinuousTimeSeriesChart.html';

enum AXIS_LABEL_MODE {
    _15_MIN,
    _1_HOUR,
    _1_DAY,
    _5_DAYS,
    _1_MONTH,
    _1_YEAR
}

@WithRender
@Component({
    components: {

    }
})
export default class ContinuousTimeSeriesChart extends Vue {

    @Prop({ default: null })
    data: any

    @Prop()
    startTime!: string

    @Prop()
    endTime!: string


    debug = false


    scaleY = 0

    //millisecondsPerPixel = 500000
    millisecondsPerPixel = 0

    size = new Vector2(10, 10)

    timestamps = Array<string>()

    timeLeftEdge = 0
    timeAtMouse = 0

    prevTimeLeftEdge = Number.MAX_VALUE
    prevTimeRightEdge = Number.MIN_VALUE

    cfg_zoomSpeed = 1.1


    mouseDragStartPos = -1

    bw = 75
    bh = 22
    labelHideTimeoutHandle = -1

    closestVertex: any = null


    altKeyPressed = false

    cachedSvgPaths: any = {}
    cached_axisLabelStepY = 0


    selectedDataSeries: string | null = null

    colors = [
        "#da4",
        "#88f",
        "#6a6"
    ]


    readonly cfg_ySteps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000]
    readonly cfg_yPixelsPerStep = 50


    beforeDestroy() {
        document.removeEventListener("keydown", this.onDocumentKeyDown)
        document.removeEventListener("keyup", this.onDocumentKeyUp)
        document.removeEventListener("mouseup", this.onDocumentMouseUp)
        document.removeEventListener("mousemove", this.onDocumentMouseUp)
    }




    fireTimeFrameChangedEvent() {

        

        const timeRightEdge = this.timeLeftEdge + (this.millisecondsPerPixel * this.size.x)

        // NOTE: This check prevents unnecessary data requests when zooming in. In this case,
        // all required data should already be loaded.
        if (this.timeLeftEdge < this.prevTimeLeftEdge || timeRightEdge > this.prevTimeRightEdge) {

            this.$emit("dataRequest",
                {
                    left: this.timeLeftEdge - (this.size.x * this.millisecondsPerPixel),
                    right: timeRightEdge + (this.size.x * this.millisecondsPerPixel)
                })

            this.prevTimeLeftEdge = this.timeLeftEdge
            this.prevTimeRightEdge = timeRightEdge
        }

    }


    getAxisLabelStepY(): number {

        const numSteps = this.getChartHeight() / this.cfg_yPixelsPerStep

        const range = this.data.maxValue - this.data.minValue

        let result = Math.ceil(range / numSteps)

        for (let ii = 0; ii < this.cfg_ySteps.length; ii++) {
            if (this.cfg_ySteps[ii] >= result || ii == this.cfg_ySteps.length - 1) {
                result = this.cfg_ySteps[ii]
                break
            }
        }

        return result
    }



    getChartHeight(): number {
        return this.size.y - 25
    }



    getClosestIndex(attrKey: string, timestamp: number): number {

        if (this.data.data[attrKey] == undefined) {
            return -1
        }

        const timestampString = timestamp.toString()

        const timestamps = this.data.data[attrKey].timestamps

        let index = Math.round(timestamps.length / 2)

        let add = Math.round(timestamps.length / 4)

        while (add > 1) {

            if (timestamps[index] > timestampString) {
                index -= add
            }
            else if (timestamps[index] < timestampString) {
                index += add
            }

            add = Math.round(add / 2)
        }

        return index
    }


    getClosestLabel() {
        if (this.closestVertex == null) {
            return ""
        }

        return this.getTimeString(this.closestVertex.timestamp)
    }


    getClosestLabelY() {
        const dist = 50

        if (this.w2sY(this.closestVertex.value) < this.getChartHeight() / 2) {
            return dist
        }
        else {
            return -dist
        }
    }


    getDisplayMaxY() {
        return Math.ceil(this.data.maxValue / this.cached_axisLabelStepY) * this.cached_axisLabelStepY
    }


    getDisplayMinY() {
        return Math.floor(this.data.minValue / this.cached_axisLabelStepY) * this.cached_axisLabelStepY
    }


    getEndIndex(attrKey: string): number {

        const timeRightEdge = this.timeLeftEdge + this.millisecondsPerPixel * this.size.x

        let endIndex = this.getClosestIndex(attrKey, timeRightEdge)

        // ATTENTION: Ideally, it should be sufficient to increase endIndex by just 1 to prevent
        // the graph from being "cut off" before it reaches the right edge of the viewport.
        // However, we still observed rendering artifacts, and it appears to work better with
        // endIndex += 2

        endIndex += 2

        endIndex = Math.min(endIndex, this.data.data[attrKey].timestamps.length - 1)

        return endIndex
    }


    getAxisLabelsX() {

        const result: any = []

        const msPerDay = 86400000
        const msPerHour = 3600000
        const msPerQuarterHour = 900000


        let timestep = msPerQuarterHour

        let mode: AXIS_LABEL_MODE = AXIS_LABEL_MODE._15_MIN

        if (this.millisecondsPerPixel > 20000000) {
            timestep = msPerDay
            mode = AXIS_LABEL_MODE._1_YEAR
        }

        else if (this.millisecondsPerPixel > 5000000) {
            timestep = msPerDay
            mode = AXIS_LABEL_MODE._1_MONTH
        }
        else if (this.millisecondsPerPixel > 1800000) {
            timestep = msPerDay
            mode = AXIS_LABEL_MODE._5_DAYS
        }
        else if (this.millisecondsPerPixel > 70000) {
            timestep = msPerDay
            mode = AXIS_LABEL_MODE._1_DAY
        }
        else if (this.millisecondsPerPixel > 15000) {
            timestep = msPerHour
            mode = AXIS_LABEL_MODE._1_HOUR
        }
        else if (this.millisecondsPerPixel > 0) {
            timestep = msPerQuarterHour
            mode = AXIS_LABEL_MODE._15_MIN
        }




        let labelDate = this.timeLeftEdge - (this.timeLeftEdge % timestep)

        const timeRightEdge = this.timeLeftEdge + this.millisecondsPerPixel * this.size.x

        const monthNames = [
            "Januar",
            "Februar",
            "März",
            "April",
            "Mai",
            "Juni",
            "Juli",
            "August",
            "September",
            "Oktober",
            "November",
            "Dezember"
        ]

        while (labelDate < timeRightEdge + timestep) {

            const d = new Date(labelDate)
            let text = ""
            let x = this.w2sX(labelDate.toString())

            switch (mode) {

                case AXIS_LABEL_MODE._1_YEAR:
                    if (d.getDate() == 1 && d.getMonth() == 0) {


                        text = `01.01.${zeroPad(d.getUTCFullYear(), 2)}`
                    }

                    break


                case AXIS_LABEL_MODE._1_MONTH:
                    if (d.getDate() == 1) {

                        //text = `${zeroPad(d.getDate(), 2)}.${zeroPad(d.getMonth() + 1, 2)}.${zeroPad(d.getUTCFullYear(), 2)}`
                        text = `${monthNames[d.getMonth()]} ${zeroPad(d.getUTCFullYear(), 2)}`
                    }

                    break

                case AXIS_LABEL_MODE._1_DAY:
                    text = `${zeroPad(d.getDate(), 2)}.${zeroPad(d.getMonth() + 1, 2)}.`
                    break

                case AXIS_LABEL_MODE._5_DAYS:

                    if (d.getDate() % 5 == 0) {

                        text = `${zeroPad(d.getDate(), 2)}.${zeroPad(d.getMonth() + 1, 2)}.${zeroPad(d.getUTCFullYear(), 2)}`

                    }

                    break;


                case AXIS_LABEL_MODE._1_HOUR:

                case AXIS_LABEL_MODE._15_MIN:
                    text = `${zeroPad(d.getHours(), 2)}:${zeroPad(d.getMinutes(), 2)}`
                    break
            }

            labelDate += timestep

            if (!isNaN(x)) {

                result.push({
                    "x": x,
                    "text": text
                })
            }
        }


        return result
    }


    getDataSeriesClass(attrKey: string) {

        let result: any = {
            "ContinousTimeSeriesChart__DataSeries": true,
            "ContinousTimeSeriesChart__DataSeries--selected": this.selectedDataSeries == attrKey
        }

        if (this.selectedDataSeries != null && this.selectedDataSeries != attrKey) {
            result["ContinousTimeSeriesChart__DataSeries--not-selected"] = true
        }

        return result
    }


    getDataSeriesStyle(attrKey: string) {
        let attrKeys = Object.keys(this.data.data)

        let result: any = {}

        let index = attrKeys.indexOf(attrKey)

        if (index > -1 && this.colors.length >= index) {
            result["stroke"] = this.colors[index] + " !important"
        }

        return result
    }


    getTimeString(timestamp: any): string {
        let date = new Date(parseInt(timestamp))

        let d = zeroPad(date.getDate(), 2)
        let m = zeroPad(date.getMonth() + 1, 2)
        let h = zeroPad(date.getHours(), 2)
        let y = date.getUTCFullYear()
        let min = zeroPad(date.getMinutes(), 2)
        let sec = zeroPad(date.getSeconds(), 2)

        return `${d}.${m}.${y} - ${h}:${min} UTC`
    }


    getPath(attrKey: string): string {

        if (this.cachedSvgPaths[attrKey] != undefined) {
            return this.cachedSvgPaths[attrKey]
        }

        if (this.data.data[attrKey] == undefined) {
            this.cachedSvgPaths[attrKey] = ""
            return ""
        }

        const timeseries = this.data.data[attrKey].timeseries
        const timestamps = this.data.data[attrKey].timestamps


        let startIndex = this.getStartIndex(attrKey)
        let endIndex = this.getEndIndex(attrKey)

        let result = ""

        //#region Build path string   
        let vertexCount = 0

        for (let index = startIndex; index <= endIndex; index++) {

            const timestamp = timestamps[index]
            const value = timeseries[timestamp]

            let x = this.w2sX(timestamp)
            let y = this.w2sY(value)

            if (index == startIndex) {
                result = "M "
            }
            else {
                result += " L "
            }

            result += (x + " " + y)

            vertexCount++
        }

        //#endregion

        this.cachedSvgPaths[attrKey] = result

        return result
    }


    getStartIndex(attrKey: string): number {
        let startIndex = this.getClosestIndex(attrKey, this.timeLeftEdge)

        startIndex--

        startIndex = Math.max(0, startIndex)

        return startIndex
    }


    getStyle() {
        let result: any = {

        }

        if (this.mouseDragStartPos != -1) {
            result["cursor"] = "grab"
        }

        return result
    }


    getVertexClosestToMouse(evt: MouseEvent) {

        let minDist = Number.MAX_VALUE

        let result = null

        // NOTE: Here, we have moved as many calculation steps as possible out of the for loop,
        // i.e. from the calculation terms for "a" and "b" to the calculation terms for "mx" and "my"
        const mx = (evt.offsetX * this.millisecondsPerPixel) + this.timeLeftEdge
        const my = (evt.offsetY - this.getChartHeight()) / this.scaleY - this.data.minValue


        for (const attrKey in this.data.data) {

            if (this.selectedDataSeries != null && this.selectedDataSeries != attrKey) {
                continue
            }

            const timeseries = this.data.data[attrKey].timeseries
            const timestamps = this.data.data[attrKey].timestamps


            let startIndex = this.getStartIndex(attrKey)
            let endIndex = this.getEndIndex(attrKey)


            for (let ii = startIndex; ii <= endIndex; ii++) {

                const ts = timestamps[ii]

                let a = (parseInt(ts) - mx) / this.millisecondsPerPixel
                let b = (-timeseries[ts] - my) * this.scaleY

                // NOTE: We don't need to calculate the square root in order to compare the distances.
                // This saves computing time!

                const dist = a * a + b * b

                if (dist < minDist) {
                    minDist = dist

                    result = {
                        "attrKey": attrKey,
                        "timestamp": ts,
                        "value": timeseries[ts]
                    }
                }
            }
        }

        return result
    }


    isInViewport(timestamp: string): boolean {
        const timeRightEdge = this.timeLeftEdge + this.millisecondsPerPixel * this.size.x

        return parseInt(timestamp) > this.timeLeftEdge && parseInt(timestamp) < timeRightEdge
    }



    mounted() {

        //#region Register DOM event handlers
        document.addEventListener("keydown", this.onDocumentKeyDown)
        document.addEventListener("keyup", this.onDocumentKeyUp)
        document.addEventListener("mouseup", this.onDocumentMouseUp)
        document.addEventListener("mousemove", this.onDocumentMouseMove)
        //#endregion Register DOM event handlers


        //#region set start (left edge) time
        if (this.startTime != undefined) {

            const startTime_unix = new Date(this.startTime)

            this.timeLeftEdge = startTime_unix.getTime()
        }
        else {
            const now = new Date()
            this.timeLeftEdge = now.getTime() - this.millisecondsPerPixel * 1000


        }
        //#endregion

        const el = this.$el as SVGElement


        let width = el.clientWidth
        let height = el.clientHeight

        this.size = new Vector2(width, height)



        // TODO: What if endtime < starttime?

        //#region set end (right edge) time
        if (this.endTime != undefined) {            


            const endTime_unix = new Date(this.endTime)

            const diff_milliseconds = endTime_unix.getTime() - this.timeLeftEdge

            this.millisecondsPerPixel = 500000
            //console.log(diff_milliseconds / 1000 / 60 / 60 / 24)
            this.millisecondsPerPixel = (diff_milliseconds / this.size.x)
        }
        //#endregion set end (right edge) time

        this.update()

        window.setTimeout(this.fireTimeFrameChangedEvent, 0)

    }



    @Watch('data', { deep: true })
    onDataChange() {
        this.update()
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

        if (this.mouseDragStartPos == -1) {
            return
        }

        let mousePos = evt.clientX

        const diff = this.mouseDragStartPos - mousePos

        this.timeLeftEdge = this.timeLeftEdge + diff * this.millisecondsPerPixel


        this.mouseDragStartPos = mousePos

        this.update()
    }


    onDocumentMouseUp(evt: MouseEvent) {
        this.mouseDragStartPos = -1
    }


    onMouseDown(evt: MouseEvent) {
        this.mouseDragStartPos = evt.clientX
    }


    onMouseLeave() {

        this.timeAtMouse = -1

        this.labelHideTimeoutHandle = window.setTimeout(() => { this.closestVertex = null }, 700)
    }



    onMouseMove(evt: MouseEvent) {

        this.timeAtMouse = this.timeLeftEdge + evt.offsetX * this.millisecondsPerPixel

        // Update closest vertex:
        this.closestVertex = this.getVertexClosestToMouse(evt)


        if (this.mouseDragStartPos == -1) {
            return
        }

        let mousePos = evt.clientX

        const diff = this.mouseDragStartPos - mousePos

        this.timeLeftEdge = this.timeLeftEdge + diff * this.millisecondsPerPixel

        this.mouseDragStartPos = mousePos


        this.update()
    }


    onMouseUp(evt: MouseEvent) {

        if (this.mouseDragStartPos != -1) {
            this.mouseDragStartPos = -1

            this.fireTimeFrameChangedEvent()
        }
    }


    onNoDragClick(attrKey: string, evt: MouseEvent) {
        if (this.selectedDataSeries == attrKey) {
            this.selectedDataSeries = null

        }
        else {
            this.selectedDataSeries = attrKey
        }

        this.closestVertex = this.getVertexClosestToMouse(evt)
    }


    onResize(resizeEntry: ResizeObserverEntry) {

        const el = this.$el as SVGElement

        let width = el.clientWidth
        let height = el.clientHeight

        this.size = new Vector2(width, height)


        this.update()

        this.fireTimeFrameChangedEvent()
    }



    onWheel(evt: WheelEvent) {

        if (this.mouseDragStartPos == -1) {
            return
        }

        evt.preventDefault()

        const timeAtMouse = this.timeLeftEdge + evt.offsetX * this.millisecondsPerPixel

        if (evt.deltaY < 0) {
            this.millisecondsPerPixel /= this.cfg_zoomSpeed
        }
        else if (evt.deltaY > 0) {
            this.millisecondsPerPixel *= this.cfg_zoomSpeed

        }

        this.timeLeftEdge = timeAtMouse - evt.offsetX * this.millisecondsPerPixel

        this.update()
    }


    update() {



        this.cachedSvgPaths = {}

        const valueSpan = this.data.maxValue - this.data.minValue


        this.scaleY = this.getChartHeight() / valueSpan

        this.cached_axisLabelStepY = this.getAxisLabelStepY()

        this.$forceUpdate()
    }


    /*
    s2wX(x: number): number {
        return x * this.millisecondsPerPixel + this.timeLeftEdge
    }


    s2wY(y: number): number {
        return -((y - this.getChartHeight()) / this.scaleY + this.data.minValue)
    }
    */


    w2sX(timestamp: string): number {
        return Math.round((parseInt(timestamp) - this.timeLeftEdge) / this.millisecondsPerPixel)
    }


    w2sY(value: number): number {
        return Math.round(-(value - this.data.minValue) * this.scaleY + this.getChartHeight())
    }

}

