import { Component, Prop, Watch } from 'vue-property-decorator';
import AbstractChart from '../AbstractChart/AbstractChart';
import { Vector2 } from 'tivigi/src/util/Vector2';
import { formatNumberString } from 'tivigi/src/util/formatters';
import { Dataset } from '../../Dataset';
import { ChartLegendItem } from '../../ChartLegend/ChartLegendItem';
import { ColorRGBA } from 'tivigi/src/util/ColorRGBA';


import "./BarChart.scss"
import WithRender from './BarChart.html';


interface StackItem {
    dataset: Dataset,
    y: number,
    height: number,
    color: string
}

class Stack {
    positive: number = 0
    negative: number = 0
    items = Array<StackItem>()
}

@WithRender
@Component({ components: {} })
export default class BarChart extends AbstractChart {

    //#region Props
    @Prop({ default: () => [] })
    buckets!: Array<Array<Dataset>>

    @Prop({ default: 10 })
    barWidth!: number

    @Prop({ default: "screen" })
    barWidthUnit!: string

    @Prop()
    barStyle!:string

    @Prop()
    colors!:Array<any>
    //#endregion


    cfg_barSpacing_px = 5


    displayMax = new Vector2()
    displayMin = new Vector2()

    displayData = Array<any>()

    legendData = Array<Array<ChartLegendItem>>()

    colors_internal = Array<any>()


    created() {

        if (this.colors != undefined) {
            
            this.colors_internal = this.colors
        }
        else {
            this.colors_internal = [
                { start: [100, 100, 250, 255], end: [200, 200, 255, 255] },
                { start: [30, 200, 30, 255], end: [200, 255, 200, 255] },
                { start: [150, 100, 100, 255], end: [255, 200, 200, 255] },
                { start: [50, 50, 50, 255], end: [200, 200, 200, 255] }
            ]
        }

    }


    getStackItemStyle(stackItem: StackItem) : string {

        return `fill: ${stackItem.color}; ${this.barStyle}`
        
    }


    getDisplayMin(): Vector2 {

        let range = this.displayMax.sub(this.displayMin)

        // NOTE: The subtraction creates a padding for autoscale. 
        // The '+1' causes the chart to be horizontally centered on 
        // the canvas if there is only one data point.
        return this.displayMin.sub(new Vector2(range.x / 10 + 1, 0))
    }


    getDisplayMax(): Vector2 {
        let range = this.displayMax.sub(this.displayMin)

        // NOTE: The subtraction creates a padding for autoscale. 
        // The '+1' causes the chart to be horizontally centered on 
        // the canvas if there is only one data point.
        return this.displayMax.add(new Vector2(range.x / 10 + 1, 0))
    }


    getFormattedValue(series: Dataset, value: number) {

        let numDecimals = typeof series.numDecimals == "number" ? series.numDecimals : 1

        return formatNumberString(value, numDecimals)
    }



    getLegendData(): Array<Array<ChartLegendItem>> {


        return this.legendData

    }



    @Watch("buckets", { deep: true })
    onDataChange() {

        // ATTENTION: The order is important here! If we call canvas.onDataChange() before prepareDisplaySeries(),
        // the chart is often not drawn initially after the creation of the component. The exact reason for this
        // is still unknown.

        this.displayData = this.prepareDisplaySeries(this.buckets)

        this.canvas.onDataChange()
    }


    onCanvasExtentChange() {

        this.displayData = this.prepareDisplaySeries(this.buckets)

        // ATTENTION: Calling this.canvas.onDataChange() here causes and infinite recursion loop.
        // However, calling it isn't needed anyway, everything works as desired.        
    }


    prepareDisplaySeries(buckets: Array<Array<Dataset>>) {

        let result: any = {}

        this.displayMin.x = Number.POSITIVE_INFINITY
        this.displayMin.y = 0

        this.displayMax.x = Number.NEGATIVE_INFINITY
        this.displayMax.y = Number.NEGATIVE_INFINITY


        this.legendData = []

        for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex++) {

            const bucket = buckets[bucketIndex]

            let legendGroup = []

            const colorEnd = new ColorRGBA(this.colors_internal[bucketIndex].end)
            const colorStart = new ColorRGBA(this.colors_internal[bucketIndex].start)

            const colorDiff = colorEnd.sub(colorStart)

            for (let datasetIndex = 0; datasetIndex < bucket.length; datasetIndex++) {

                const dataset = bucket[datasetIndex]

                if (dataset == undefined) {
                    continue
                }


                let step = 0

                if (bucket.length > 1) {
                    step = datasetIndex / (bucket.length - 1)
                }

                const color_main = colorStart.add(colorDiff.mult(step)).round()


                //#region Add legend item
                let legendItem: ChartLegendItem = {
                    label: dataset.label,
                    shortLabel: dataset.shortLabel,
                    color: color_main.toHexString()
                }

                legendGroup.push(legendItem)

                //#endregion Add legend item

                for (const p of dataset.points) {

                    if (result[p.x] == undefined) {
                        result[p.x] = Array<Stack>()
                    }

                    if (result[p.x][bucketIndex] == undefined) {
                        result[p.x][bucketIndex] = new Stack()
                    }

                    let stack = result[p.x][bucketIndex] as Stack

                    this.displayMin.x = Math.min(this.displayMin.x, p.x)
                    this.displayMax.x = Math.max(this.displayMax.x, p.x)

                    if (p.y < 0) {

                        stack.items.push({
                            "dataset": dataset, "y": stack.negative, "height": p.y,
                            color: color_main.toHexString()
                        })

                        stack.negative += p.y

                        this.displayMin.y = Math.min(this.displayMin.y, stack.negative)

                    }
                    else if (p.y > 0) {
                        stack.positive += p.y

                        stack.items.push({
                            "dataset": dataset, "y": stack.positive, "height": p.y,
                            color: color_main.toHexString()
                        })

                        this.displayMax.y = Math.max(this.displayMax.y, stack.positive)
                    }
                }
            }

            this.legendData.push(legendGroup)
        }


        return result
    }
}