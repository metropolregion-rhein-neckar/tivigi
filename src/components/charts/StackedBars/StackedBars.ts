import AbstractChartElement from 'tivigi/src/components/charts/AbstractChartElement/AbstractChartElement';
import BarChart from 'tivigi/src/components/charts/BarChart/BarChart';
import { DataPoint, Dataset } from 'tivigi/src/components/charts/chartUtil';
import { formatNumberString } from 'tivigi/src/util/formatters';
import { Component, Prop, Watch } from 'vue-property-decorator';

import WithRender from './StackedBars.html';


@WithRender
@Component({})
export default class StackedBars extends AbstractChartElement {


    //########## BEGIN Props ##########
    @Prop({ default: 25 })
    barWidth!: number

    //########## END Props ##########

    preparedData: any = null

    @Watch('data')
    onDataChange() {
        this.preparedData = this.prepareData()
    }


    mounted() {
        this.onDataChange()
    }


    getBarWidth() {
        return 10
    }



    prepareData(): any {

        let sumMin = Number.POSITIVE_INFINITY
        let sumMax = Number.NEGATIVE_INFINITY

        let min = Number.POSITIVE_INFINITY
        let max = Number.NEGATIVE_INFINITY

        let result = []


        // TODO: 1 Do we need to start at 0 or 1 here?

        for (let ii = 0; ii <= this.data.labelsX.length; ii++) {


            let negativeY = 0
            let positiveY = 0

            let stack = []

            for (const dataset of this.data.datasets) {

                for (const point of dataset.points) {

                    if (point.x != ii) {

                        continue
                    }

                    // ATTENTION: The order of commands (increase of positiveY/negativeY vs. push to stack) is important here!
                    if (point.y > 0) {
                        positiveY += point.y
                        stack.push({ "dataset": dataset, "y": positiveY, "height": point.y })
                    }
                    else if (point.y < 0) {
                        stack.push({ "dataset": dataset, "y": negativeY, "height": point.y })
                        negativeY += point.y
                    }

                    max = Math.max(max, positiveY)
                    min = Math.min(min, negativeY)
                }
            }

            if (stack.length == 0) {
                continue
            }

            result.push(stack)

            sumMax = Math.max(sumMax, this.getStackHeightSum(stack))
            sumMin = Math.min(sumMin, this.getStackHeightSum(stack))
        }


        // Send min/max to parent:        
        this.parent.overrideMinMax(sumMin, sumMax)

        return result
    }


    getStackHeightSum(stack: Array<any>): number {

        let result = 0

        for (const item of stack) {

            result += item.height
        }

        return result
    }


    getStyle(dataset: Dataset): any {

        let color = "#000"

        if (dataset.style.color) {
            color = dataset.style.color
        }

        return {
            "fill": color,
            "--color": color
        }
    }

    getTooltip(point : any) : string{
        return point.dataset.label + ': <strong>' + formatNumberString(point.height, point.dataset.numDecimalPlaces) + "</strong>"
    }


    getX(x: number): number {
        // ATTENTION: The +1 is required to align the bars with the x axis label steps. Without it,
        // all bars are shifted 1 step to the left
        return this.w2sX(x + 1) - (this.barWidth / 2)
    }



    onMouseOver(evt: MouseEvent) {
        // NOTE: This brings the element under the mouse to the front by moving all other siblings
        // above the element in the DOM

        let el = evt.target as SVGRectElement

        let parent = el.parentElement as Element

        for (let elem of parent.children) {

            if (elem != el) {
                parent.removeChild(elem)
                parent.prepend(elem)
            }
        }
    }
}
