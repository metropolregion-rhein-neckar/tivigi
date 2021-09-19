import AbstractChartElement from 'tivigi/src/components/charts/AbstractChartElement/AbstractChartElement';
import BarChart from 'tivigi/src/components/charts/BarChart/BarChart';
import { Dataset } from 'tivigi/src/components/charts/chartUtil';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './Lines.html';


@WithRender
@Component({})
export default class Lines extends AbstractChartElement {
  

    @Watch('data')
    onDataChange() {
        this.prepareData()
    }


    mounted() {
        this.prepareData()
    }



    getCircleRadius(dataset : Dataset): number {
        let result = 5

        try {
            if (dataset.style.circleRadius != undefined) {
                result = dataset.style.circleRadius
            }
        }
        catch { }

        return result
    }



    getTooltip(dataset:any, point : any) : string {
        return dataset.label + ': <strong>' + point.y + "</strong>"
    }


    getCircleStyle(dataset : Dataset): any {

        let strokeColor = "#000"

        if (dataset.style.color) {
            strokeColor = dataset.style.color
        }

        return {
            "--color": strokeColor,
            "--color-hover": strokeColor,
            "stroke": strokeColor,          
            "fill-hover": strokeColor
        }
    }

    getLineStyle(dataset : Dataset): any {

        let strokeColor = "#000"

        if (dataset.style.color) {
            strokeColor = dataset.style.color
        }

        return {
            "--color": strokeColor,
            "--color-hover": strokeColor,
            "stroke": strokeColor,
            "fill" : "none",
            "fill-hover": strokeColor
        }
    }


    getPath(dataset : Dataset): string {
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


    getPolygonUnderLine(dataset : Dataset): string {
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
            for (let point of dataset.points) {
                max = Math.max(max, point.y)
                min = Math.min(min, point.y)
            }
        }

        // Send min/max to parent:           
        this.parent.overrideMinMax(min, max)

    }
}
