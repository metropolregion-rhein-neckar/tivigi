import { Vector2 } from 'tivigi/src/util/Vector2';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import Axis from 'tivigi/src/components/charts/Axis/Axis'
import Bars from 'tivigi/src/components/charts/Bars/Bars'
import StackedBars from 'tivigi/src/components/charts/StackedBars/StackedBars';
import Legend from 'tivigi/src/components/charts/Legend/Legend'
import Lines from 'tivigi/src/components/charts/Lines/Lines'
import WithRender from './BarChart.html';
import { AxisLabel, ChartData } from 'tivigi/src/components/charts/chartUtil';
import AbstractChartElement from 'tivigi/src/components/charts/AbstractChartElement/AbstractChartElement';

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
    config: any

    @Prop({ default: 100 })
    scaleX!: number

    @Prop({ default: "bars" })
    displayMode!: string

    @Prop({ default: false })
    debug!: boolean

    @Prop({ default: false })
    cropToYRange!: boolean

    //############ END Props #############

    size = new Vector2(850, 450)


    overrideMax =  Number.NEGATIVE_INFINITY
    overrideMin = Number.POSITIVE_INFINITY

    // top, right, bottom, left
    // NOTE: padding right and padding left currently have no effect.


    cfg_fontSize = 15
    cfg_padding = [15, 0, 175, 0]
    cfg_ySteps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000]
    cfg_yPixelsPerStep = 50


    get height(): number {
        return this.size.y - this.cfg_padding[0] - this.cfg_padding[2]
    }


    @Watch("config")
    onConfigChange() {
        this.overrideMax = Number.NEGATIVE_INFINITY
        this.overrideMin = Number.POSITIVE_INFINITY
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


    w2sX(value: number): number {
        // ATTENTION: The rounding is required for clean (not anti-aliased where it is unnecessary and undesired) drawing
        //return value * this.scaleX
        return Math.floor(value * this.scaleX)
    }


    w2sY(value: number): number {
        // ATTENTION: The rounding is required for clean (not anti-aliased where it is unnecessary and undesired) drawing
        //return -value * this.scaleY
        return Math.floor(-value * this.scaleY)
    }



    //###################### BEGIN This is not generic ###########################
    getAxisLabelStepY(): number {


        const numSteps = this.height / this.cfg_yPixelsPerStep

        let minY = this.getMinY()

        // NOTE: Setting 0 as the "maximal minimum" here is specific to bar charts, because
        // bar charts should always go all the way down to zero. 
        // For e.g. a line chart, something different may be used!
        if (!this.cropToYRange) {
            minY = Math.min(0, minY)
        }

        const max = this.getMaxY()

        const range = max - minY

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

        for (let ii = 0; ii < this.config.labelsX.length; ii++) {
            result.push({ pos: ii + 1, text: this.config.labelsX[ii] })
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


    getDisplayMinX() {
        return this.getMinX()
    }


    getDisplayMaxX() {
        return this.getMaxX()
    }


    getDisplayMinY() {

        // NOTE: Setting 0 as the "maximal minimum" here is specific to bar charts, because
        // bar charts should always go all the way down to zero. 
        // For e.g. a line chart, something different may be used!

        let minY = this.getMinY()

        if (!this.cropToYRange) {
            minY = Math.min(0, minY)
        }


        if (this.overrideMin != Number.POSITIVE_INFINITY) {
            minY = Math.min(minY, this.overrideMin)
        }

        const a = this.getAxisLabelStepY()

        const result = Math.floor(minY / a) * a

        return result

    }


    getDisplayMaxY() {
        let max = this.getMaxY()

        if (this.overrideMax != Number.NEGATIVE_INFINITY) {
            max = Math.max(max, this.overrideMax)
        }

        const a = this.getAxisLabelStepY()

        return Math.ceil(max / a) * a
    }



    getMaxX() {
        let result = Number.MIN_VALUE

        for (const dataset of this.config.datasets) {
            for (let point of dataset.points) {
                result = Math.max(result, point.x)
            }
        }

        return result
    }


    getMinX() {
        let result = Number.MAX_VALUE

        for (const dataset of this.config.datasets) {
            for (let point of dataset.points) {
                result = Math.min(result, point.x)
            }
        }

        result = Math.min(result, this.overrideMin)

        return result
    }


    getMaxY() {
        
        let result = Number.MIN_VALUE

        for (const dataset of this.config.datasets) {
            for (let point of dataset.points) {
                result = Math.max(result, point.y)
            }
        }


        result = Math.max(result, this.overrideMax)
       
        return result
    }


    getMinY() {
        let result = Number.MAX_VALUE

        for (const dataset of this.config.datasets) {
            for (let point of dataset.points) {
                result = Math.min(result, point.y)
            }
        }

        return result
    }


    overrideMinMax(newmin : number, newmax: number) {
        
        this.overrideMax = Math.max(this.overrideMax,newmax)
        this.overrideMin = Math.min(this.overrideMin,newmin)        
    }
    //####################### END This is not generic ########################
}
