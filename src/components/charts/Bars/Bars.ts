import AbstractChartElement from 'tivigi/src/components/charts/AbstractChartElement/AbstractChartElement';
import {  DataPoint, Dataset } from 'tivigi/src/components/charts/chartUtil';
import { formatNumberString } from 'tivigi/src/util/formatters';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './Bars.html';


@WithRender
@Component({

    components: {

    }
})
export default class Bars extends AbstractChartElement {

    //########## BEGIN Props ##########
    @Prop({ default: 25 })
    barWidth!: number


    //########## END Props ##########

    @Watch('data')
    onDataChange() {
        this.prepareData()
    }


    mounted() {
        this.prepareData()
    }



    getBarWidth(): number {
        return this.barWidth / this.data.datasets.length
    }


    getTooltip(dataset : Dataset, point : DataPoint) : string {
        return dataset.label + ': ' + formatNumberString(point.y, dataset.numDecimalPlaces)
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


    getX(point: DataPoint, index: number): number {
        return this.w2sX(point.x) - (this.barWidth / 2) + (index * this.getBarWidth())
    }


    getY(value: number): number {

        if (value >= 0) {
            return this.w2sY(value)
        }
        else {
            return this.w2sY(0)
        }
    }


    prepareData() {

        let min = Number.POSITIVE_INFINITY
        let max = Number.NEGATIVE_INFINITY

        for (const dataset of this.data.datasets) {
            for (let point of dataset.points) {
                max = Math.max(max, point.y)
                min = Math.min(min, point.y)
            }
        }

        // Send min/max to parent:           
        this.parent.overrideMinMax(min, max)

    }
}
