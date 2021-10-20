export class AxisLabel {
    constructor(public pos: number, public text: string) { }
}


export class ChartData {

    constructor(public labelsX: Array<string> = new Array<string>(), public datasets: Array<Dataset> = new Array<Dataset>()) { }
}


export class DataPoint {
    constructor(public x: number, public y: number) { }
}


export class Dataset {
    constructor(public label: string, public points: Array<DataPoint> = Array<DataPoint>(), public numDecimalPlaces: number, public style: SvgChartDatasetStyle) { }
}


export class SvgChartOptions {

}

export class SvgChartDatasetStyle {
    color : string|undefined = "#000"
    strokeDasharray : string|undefined = "0"
}