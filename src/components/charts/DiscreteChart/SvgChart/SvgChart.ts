import { formatNumberString } from 'tivigi/src/util/formatters';
import { Vector2 } from 'tivigi/src/util/Vector2';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import Axis from '../Axis/Axis'

import { AxisLabel, ChartData, DataPoint, Dataset, getDatasetStyle } from '../chartUtil';

import "./SvgChart.scss"
import WithRender from './SvgChart.html';


@WithRender
@Component({
    components: {
        Axis
    }
})
export default class SvgChart extends Vue {

    //############ BEGIN Props #############
    @Prop({
        default: () => { return new ChartData() }
    })
    data!: ChartData



    @Prop({ default: false })
    debug!: boolean

    @Prop({ default: true })
    cropToYRange!: boolean
    //############ END Props #############




    


    paddingTop = 10
    paddingBottom = 45

    stackData: any = null

    crossSize = 5


 

    

    chartAreaSize = new Vector2()

    overrideMaxY = Number.NEGATIVE_INFINITY
    overrideMinY = Number.POSITIVE_INFINITY


    cached_minX = 0
    cached_minY = 0
    cached_maxX = 0
    cached_maxY = 0
    cached_yLabelsWidth = 0
    cached_axisLabelStepY = 0
    
    readonly cfg_fontSize = 13
    
    readonly cfg_ySteps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000]
    readonly cfg_yPixelsPerStep = 40
    cfg_barWidth = 18
    cfg_barSpacing = 5


    @Watch("data")
    onConfigChange() {
        this.overrideMaxY = Number.NEGATIVE_INFINITY
        this.overrideMinY = Number.POSITIVE_INFINITY

        this.onMinMaxChange()

        this.cached_yLabelsWidth = this.getYLabelsWidth()

        
        // Update chart area size:
        this.onResize()
        
        this.stackData = this.prepareStackData()
    
    }


    private onMinMaxChange() {

        this.cached_minX = this.getMinX()
        this.cached_minY = this.getMinY()
        this.cached_maxX = this.getMaxX()
        this.cached_maxY = this.getMaxY()

        this.cached_axisLabelStepY = this.getAxisLabelStepY()        
    }
    

    getBarHeight(height : number) : number {
        return Math.max(0, Math.abs(this.w2sY(height)))
    }


    getDataPointTooltip(dataset: Dataset, y: number): string {
        let result = dataset.label

        result += ": "

        result += '<strong>' + formatNumberString(y, dataset.numDecimalPlaces) + '</strong>'

        return result
    }


    getDatasetStyle(dataset: Dataset, strokeWidth: number, strokeOverride : string|undefined = undefined): any {
        return getDatasetStyle(dataset, strokeWidth, strokeOverride)
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

        for (const label of this.getLabelsY()) {

            if (label.text.length > result) {
                result = label.text.length             
            }
        }

        return (result * this.cfg_fontSize) + 10
    }



    //###################### BEGIN This is not generic ###########################
    getAxisLabelStepY(): number {

        const numSteps = this.chartAreaSize.y / this.cfg_yPixelsPerStep

        const range = this.cached_maxY - this.cached_minY

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

        for (let y = this.getDisplayMinY(); y <= this.getDisplayMaxY(); y += this.cached_axisLabelStepY) {
            result.push({ pos: y, text: y.toString() })
        }

        return result
    }


    getDisplayMaxX() {
        return this.cached_maxX
    }

    getDisplayMinX() {
        return this.cached_minX
    }


    getDisplayMaxY() {

        return Math.ceil(this.cached_maxY / this.cached_axisLabelStepY) * this.cached_axisLabelStepY
    }


    getDisplayMinY() {

        let minY = this.cached_minY

        // NOTE: Setting 0 as the "maximal minimum" here is specific to bar charts, because
        // bar charts should always go all the way down to zero. 
        // For e.g. a line chart, something different may be used!

        if (!this.cropToYRange) {
            minY = Math.min(0, minY)
        }

        return Math.floor(minY / this.cached_axisLabelStepY) * this.cached_axisLabelStepY
    }


    private getMaxX() {
        let result = Number.MIN_VALUE

        for (const bucket of this.data.datasetBuckets) {


            for (const dataset of bucket.datasets) {
                for (const point of dataset.points) {
                    result = Math.max(result, point.x)
                }
            }
        }
        return result
    }


    private getMinX() {
        let result = Number.MAX_VALUE

        for (const bucket of this.data.datasetBuckets) {

            for (const dataset of bucket.datasets) {
                for (const point of dataset.points) {
                    result = Math.min(result, point.x)
                }
            }
        }

        return result
    }


    private getMaxY() {

        let result = Number.MIN_VALUE

        for (const bucket of this.data.datasetBuckets) {


            for (const dataset of bucket.datasets) {


                for (const point of dataset.points) {
                    result = Math.max(result, point.y)
                }
            }
        }

        return Math.max(result, this.overrideMaxY)
    }



    private getMinY() {

        let result = Number.MAX_VALUE

        for (const bucket of this.data.datasetBuckets) {


            for (const dataset of bucket.datasets) {

                for (const point of dataset.points) {
                    result = Math.min(result, point.y)
                }
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


    mounted() {
        this.onResize()
    }



    overrideMinMax(newmin: number, newmax: number) {
        this.overrideMaxY = Math.max(this.overrideMaxY, newmax)
        this.overrideMinY = Math.min(this.overrideMinY, newmin)

        this.onMinMaxChange()
    }
    //####################### END This is not generic ########################





    prepareStackData(): any {

        // ATTENTION: The purpose of this method is only to find out the min/max values of stacked bars, i.e.
        // the sum of the heights of individual bars that are stacked on top of each other!

        let result = []

        //############# BEGIN Loop over x-axis steps ##############
        for (let ii = 0; ii <= this.data.labelsX.length; ii++) {



            const stackBucket = []

            //############# BEGIN Loop over buckets ##############
            for (const bucket of this.data.datasetBuckets) {

                let stack = []

                let negativeY = 0
                let positiveY = 0

                //############# BEGIN Loop over datasets ##############
                for (const dataset of bucket.datasets) {

                    if (dataset.style.chartType != "bars") {
                        continue
                    }

                    for (const point of dataset.points) {

                        if (point.x != ii) {
                            continue
                        }

                        const y =  point.y

                        // ATTENTION: The order of commands (increase of positiveY/negativeY vs. push to stack) is important here!
                        if (y > 0) {
                            positiveY += y
                            stack.push({ "dataset": dataset, "y": positiveY, "height": y })
                        }
                        else if (y < 0) {
                            stack.push({ "dataset": dataset, "y": negativeY, "height": y })
                            negativeY += y
                        }
                    }
                }
                //############# END Loop over datasets ##############

                stackBucket.push(stack)

            }
            //############# END Loop over buckets ##############

            result.push(stackBucket)



        }
        //############# END Loop over x-axis steps ##############


        let min = Number.POSITIVE_INFINITY
        let max = Number.NEGATIVE_INFINITY

        for (const labelStacks of result) {

            for (const stack of labelStacks) {

                let positive = 0
                let negative = 0

                for (const element of stack) {
                    if (element.height < 0) {
                        negative += element.height
                    }
                    else {
                        positive += element.height
                    }
                }

                max = Math.max(max, positive)
                min = Math.min(min, negative)
            }
        }

        // Send min/max to parent:        
        this.overrideMinMax(min, max)

        return result
    }



    w2sX(value: number): number {
        const scaleX = this.chartAreaSize.x / (this.data.labelsX.length + 1)

        // ATTENTION: The rounding is required for clean drawing (not anti-aliased where it is unnecessary and undesired)   
        return Math.floor(value * scaleX)
    }


    w2sY(value: number): number {

        // ATTENTION: For some reason, pre-calculating scaleY in onMinMaxChange(), storing it in a cache variable
        // and using it here causes scaleY to be computed wrongly. Thus, we always calculate the current value
        // for scaleY here:
       
        const result = -value * this.getScaleY()
        //const result = (-value + this.getDisplayMinY()) * this.getScaleY()

        if (isNaN(result)) {
            // TODO: 3 Understand when and why result is not a number
            return 0
        }

        return result
    }


    getScaleY() {
        return (this.chartAreaSize.y / (this.getDisplayMaxY() - this.getDisplayMinY())) 

    }

    getX(point: DataPoint, index: number): number {
        let barWidth = 15
        return this.w2sX(point.x) - (barWidth / 2) + (index * barWidth)
    }


    getY(value: number): number {

        if (value >= 0) {
            return this.w2sY(value)
        }
        else {
            return this.w2sY(0)
        }
    }




    getPath(dataset: Dataset): string {
        let result = ""


        if (dataset == undefined || dataset.points == undefined) {
            return result
        }

        let point = dataset.points[0]

        result = "M " + this.w2sX(point.x) + " " + this.w2sY(point.y)

        for (let ii = 1; ii < dataset.points.length; ii++) {
            let p = dataset.points[ii]

            result += " L " + this.w2sX(p.x) + " " + this.w2sY(p.y)
        }


        return result
    }


    onResize() {
    
      
        this.updateChartAreaSize()
        
    }


    updateChartAreaSize() {

        const el = this.$el as SVGElement
        const bbox = el.getBoundingClientRect()

        const sx = bbox.width
        const sy = bbox.height
      
        this.chartAreaSize = new Vector2(sx - this.cached_yLabelsWidth, sy - this.paddingBottom - this.paddingTop)
   
    }

}
