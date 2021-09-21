// TODO: Don't recalculate min/max each time. Calculate them when the data changes and cache them in variables.

import { Vector2 } from 'tivigi/src/util/Vector2';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import Axis from 'tivigi/src/components/charts/Axis/Axis'
import Bars from 'tivigi/src/components/charts/Bars/Bars'
import StackedBars from 'tivigi/src/components/charts/StackedBars/StackedBars';
import Legend from 'tivigi/src/components/charts/Legend/Legend'
import Lines from 'tivigi/src/components/charts/Lines/Lines'
import WithRender from './BarChart.html';
import { AxisLabel, ChartData } from 'tivigi/src/components/charts/chartUtil';


@WithRender
@Component({
    components: {
        Axis,
        Bars,
        Legend,
        Lines,
        StackedBars
    }
})
export default class BarChart extends Vue {

    //############ BEGIN Props #############
    @Prop({
        default: () => { return new ChartData() }
    })
    data!: ChartData

    @Prop({ default: "bars" })
    displayMode!: string

    @Prop({ default: false })
    debug!: boolean

    @Prop({ default: false })
    cropToYRange!: boolean

    //############ END Props #############

    size = new Vector2(650, 450)


    overrideMaxY = Number.NEGATIVE_INFINITY
    overrideMinY = Number.POSITIVE_INFINITY



    cfg_fontSize = 15
    // top, right, bottom, left
    // NOTE: padding right and padding left currently have no effect.
    cfg_padding = [15, 0, 175, 0]
    cfg_ySteps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000]
    cfg_yPixelsPerStep = 50


    get height(): number {
        return this.size.y - this.cfg_padding[0] - this.cfg_padding[2]
    }


    @Watch("data")
    onConfigChange() {
        this.overrideMaxY = Number.NEGATIVE_INFINITY
        this.overrideMinY = Number.POSITIVE_INFINITY
    }


    getDynamicStyle(): any {

        let result: any = {}

        if (this.debug) {
            result["border"] = "2px dashed #ccc"
        }
        return result
    }


    getYLabelsWidth(): number {

        let result = 0

        for (let label of this.getLabelsY()) {

            if (label.text.length > result) {
                result = label.text.length
            }
        }


        return (result * this.cfg_fontSize) + 15
    }


    getViewBoxString(): string {
        return "0 0 " + this.size.x + " " + this.size.y
    }



    //###################### BEGIN This is not generic ###########################
    getAxisLabelStepY(): number {


        const numSteps = this.height / this.cfg_yPixelsPerStep

        const minY = this.getMinY()
        const maxY = this.getMaxY()

        const range = maxY - minY

        let result = Math.ceil(range / numSteps)

        for (let ii = 0; ii < this.cfg_ySteps.length; ii++) {
            if (this.cfg_ySteps[ii] >= result || ii == this.cfg_ySteps.length - 1) {
                result = this.cfg_ySteps[ii]
                break
            }
        }

        return result
    }


    getLabelsX(): Array<AxisLabel> {

        let result = Array<AxisLabel>()

        for (let ii = 0; ii < this.data.labelsX.length; ii++) {
            result.push({ pos: ii + 1, text: this.data.labelsX[ii] })
        }

        return result
    }


    getLabelsY(): Array<AxisLabel> {

        let result = Array<AxisLabel>()

        const a = this.getAxisLabelStepY()

        for (let y = this.getDisplayMinY(); y <= this.getDisplayMaxY(); y += a) {
            result.push({ pos: y, text: y.toString() })
        }

        return result
    }


    get scaleY(): number {
        return this.height / (this.getDisplayMaxY() - this.getDisplayMinY())
    }



    getDisplayMaxX() {
        return this.getMaxX()
    }

    getDisplayMinX() {
        return this.getMinX()
    }


    getDisplayMaxY() {
        let maxY = this.getMaxY()

        const a = this.getAxisLabelStepY()

        return Math.ceil(maxY / a) * a
    }


    getDisplayMinY() {

        let minY = this.getMinY()

        // NOTE: Setting 0 as the "maximal minimum" here is specific to bar charts, because
        // bar charts should always go all the way down to zero. 
        // For e.g. a line chart, something different may be used!

        if (!this.cropToYRange) {
            minY = Math.min(0, minY)
        }

        const a = this.getAxisLabelStepY()

        return Math.floor(minY / a) * a
    }


    getMaxX() {
        let result = Number.MIN_VALUE

        for (const dataset of this.data.datasets) {
            for (const point of dataset.points) {
                result = Math.max(result, point.x)
            }
        }

        return result
    }


    getMinX() {
        let result = Number.MAX_VALUE

        for (const dataset of this.data.datasets) {
            for (const point of dataset.points) {
                result = Math.min(result, point.x)
            }
        }

        return result
    }


    getMaxY() {

        //return this.overrideMaxY

        let result = Number.MIN_VALUE

        for (const dataset of this.data.datasets) {
            for (const point of dataset.points) {
                result = Math.max(result, point.y)
            }
        }

        return Math.max(result, this.overrideMaxY)
    }


    getMinY() {


        let result = Number.MAX_VALUE

        for (const dataset of this.data.datasets) {
            for (const point of dataset.points) {
                result = Math.min(result, point.y)
            }
        }

        // NOTE: Setting 0 as the "maximal minimum" here is specific to bar charts, because
        // bar charts should always go all the way down to zero. 
        // For e.g. a line chart, something different may be used!
        // TODO: Move this logic to bar chart component
        if (!this.cropToYRange) {
            result = Math.min(0, result)
        }

        return Math.min(result, this.overrideMinY)
    }


    overrideMinMax(newmin: number, newmax: number) {

        this.overrideMaxY = Math.max(this.overrideMaxY, newmax)
        this.overrideMinY = Math.min(this.overrideMinY, newmin)
    }
    //####################### END This is not generic ########################



    w2sX(value: number): number {
               
        const scaleX = (this.size.x - this.getYLabelsWidth()) / (this.data.labelsX.length+1)
        
        // ATTENTION: The rounding is required for clean (not anti-aliased where it is unnecessary and undesired) drawing
        //return value * this.scaleX       
        return Math.floor(value * scaleX)
    }


    w2sY(value: number): number {
        // ATTENTION: The rounding is required for clean (not anti-aliased where it is unnecessary and undesired) drawing
        //return -value * this.scaleY
        return Math.floor(-value * this.scaleY)
    }


}
