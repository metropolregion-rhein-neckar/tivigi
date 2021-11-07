import { Style } from 'ol/style';
import AbstractChartElement from 'tivigi/src/components/charts/AbstractChartElement/AbstractChartElement';
import { DataPoint, Dataset } from 'tivigi/src/components/charts/chartUtil';
import { formatNumberString } from 'tivigi/src/util/formatters';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './Lines.html';


@WithRender
@Component({})
export default class Lines extends AbstractChartElement {

    closestPoint: SVGCircleElement | undefined = undefined

    @Watch('data')
    onDataChange() {
        this.prepareData()
    }


    crossSize = 7
    barWidth = 15

    mounted() {
        
        this.prepareData()
    }


    getLineType(dataset : Dataset) : string {
        
        if (dataset.style == undefined) {
            return "line"
        }

        //@ts-ignore

        let result = dataset.style.lineType

        if (result == undefined) {
            result = "line"
        }

        return result
    }


    getCircleRadius(dataset: Dataset): number {
        let result = 5

        /*
        try {
            if (dataset.style.circleRadius != undefined) {
                result = dataset.style.circleRadius
            }
        }
        catch { }
        */
        return result
    }



    getTooltip(dataset: Dataset, point: DataPoint): string {
        return dataset.label + ': <strong>' + formatNumberString(point.y, dataset.numDecimalPlaces) + "</strong>"
    }


    getCircleStyle(dataset: Dataset): any {

        let strokeColor = "#000"

        if (dataset.style != undefined && dataset.style.color) {
            strokeColor = dataset.style.color
        }

        return {
            "--color": strokeColor,
            "--color-hover": strokeColor,
            "stroke": strokeColor,            
            "fill-hover": strokeColor
        }
    }

    getLineStyle(dataset: Dataset): any {

        let strokeColor = "#000"

        if (dataset.style.color) {
            strokeColor = dataset.style.color
        }

        return {
            "--color": strokeColor,
            "--color-hover": strokeColor,
            "stroke": strokeColor,
            "fill": "none",
            "fill-hover": strokeColor,
            "stroke-dasharray" : dataset.style.strokeDasharray
        }
    }

    // For bars:
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


    // For bars:
    getX(point: DataPoint, index: number): number {
        return this.w2sX(point.x) - (this.barWidth / 2)// + (index * this.barWidth)
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


    // For bars:
    getY(value: number): number {

        if (value >= 0) {
            return this.w2sY(value)
        }
        else {
            return this.w2sY(0)
        }
    }


    getPolygonUnderLine(dataset: Dataset): string {
        let result = ""

        if (dataset == undefined || dataset.points == undefined) {
            return result
        }

        let p0 = dataset.points[0]
        let p_end = dataset.points[dataset.points.length - 1]

        result = result + this.w2sX(p0.x) + "," + this.w2sY(0) + " "

        for (let point of dataset.points) {
            result = result + this.w2sX(point.x) + "," + this.w2sY(point.y) + " "
        }


        result = result + this.w2sX(p_end.x) + "," + this.w2sY(0) + " "


        return result
    }




    prepareData() {

        let min = Number.POSITIVE_INFINITY
        let max = Number.NEGATIVE_INFINITY

        for (const dataset of this.data.datasets) {
            for (const point of dataset.points) {
                max = Math.max(max, point.y)
                min = Math.min(min, point.y)
            }
        }

        // Send min/max to parent:           
        this.parent.overrideMinMax(min, max)

    }
}
