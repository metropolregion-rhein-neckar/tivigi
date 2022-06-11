import { Vector2 } from "tivigi/src/util/Vector2"

export interface BoundingBox {
    minx : number
    maxx: number,
    miny:number,
    maxy:number
}

export interface NewChartDatasetStyle {
    fill? : string
    stroke? : string,
    
    
    numDecimals?: number 
}

export interface DataPoint {
    x : number,
    y : number
}

