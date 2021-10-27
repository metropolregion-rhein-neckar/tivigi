import AbstractChartElement from 'tivigi/src/components/charts/AbstractChartElement/AbstractChartElement';
import SvgChart from 'tivigi/src/components/charts/SvgChart/SvgChart';
import { DataPoint, Dataset } from 'tivigi/src/components/charts/chartUtil';
import { formatNumberString } from 'tivigi/src/util/formatters';
import { Component, Prop, Watch } from 'vue-property-decorator';

import WithRender from './StackedBars.html';
import { getHeight } from 'ol/extent';


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





    prepareData(): any {

        let result = []

        for (let ii = 0; ii < this.data.labelsX.length; ii++) {

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
                }
            }

            if (stack.length == 0) {
                continue
            }

            result.push(stack)
        }

        let min = Number.POSITIVE_INFINITY
        let max = Number.NEGATIVE_INFINITY

        for (const stack of result) {
            let positive = 0
            let negative = 0

            for(const element of stack) {
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
        

        // Send min/max to parent:        
        this.parent.overrideMinMax(min, max)

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

    getTooltip(point: any): string {
        return point.dataset.label + ': <strong>' + formatNumberString(point.height, point.dataset.numDecimalPlaces) + "</strong>"
    }


    getX(x: number): number {
        // ATTENTION: The +1 is required to align the bars with the x axis label steps. Without it,
        // all bars are shifted 1 step to the left
        return this.w2sX(x + 1) - (this.barWidth / 2)
    }



}
