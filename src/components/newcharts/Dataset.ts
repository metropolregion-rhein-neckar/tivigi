import { Vector2 } from "tivigi/src/util/Vector2"
import { DataPoint, NewChartDatasetStyle } from "./chartDataClasses"


export class Dataset {

    numDecimals: number = 2
    shortLabel?: string
    unit : string = ""


    points: Array<DataPoint> = Array<DataPoint>()

    constructor(public label: string) { }


    min = new Vector2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)
    max = new Vector2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY)


    updateMinMax() {

        for(const p of this.points) {
            this.max.x =  Math.max(this.max.x, p.x)
            this.max.y =  Math.max(this.max.y, p.y)

            this.min.x =  Math.min(this.min.x, p.x)
            this.min.y =  Math.min(this.min.y, p.y)
        }
    }
}