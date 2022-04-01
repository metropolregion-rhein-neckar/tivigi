export class AxisLabel {
    constructor(public pos: number, public text: string) { }
}


export class ChartData {

    constructor(public labelsX: Array<string> = new Array<string>(), public datasetBuckets: Array<DatasetBucket> = new Array<DatasetBucket>()) { }
}


export class DatasetBucket {
    constructor(public datasets: Array<Dataset> = new Array<Dataset>()) {

    }
}

export class Dataset {
    constructor(public label: string, public shortLabel: string, public points: Array<DataPoint> = Array<DataPoint>(), public numDecimalPlaces: number, public style: SvgChartDatasetStyle) { }
}


export class DataPoint {
    constructor(public x: number, public y: number) { }
}




export class SvgChartDatasetStyle {
    color: string | undefined = "#000"
    strokeDasharray: string | undefined = "0"
    chartType = "line"
}





export function getDatasetStyle(dataset: Dataset, strokeWidth: number, strokeOverride: string|undefined = undefined): any {

    let result: any = {
        "stroke": "#000",
        "fill": "#fff",
        "stroke-width": strokeWidth
    }


    if (dataset.style == undefined) {
        return result
    }



    result.fill = dataset.style.color
    result.stroke = dataset.style.color

    if (strokeOverride != undefined) {
        result.stroke = strokeOverride
    }


    return result
}