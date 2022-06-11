

// ATTENTION: This assumes that the entries of dataPoints are ordered by x

import { DataPoint } from "./chartDataClasses"


// TODO: 2 This does not work correctly
/*
export function getClosestIndex(dataPoints: Array<DataPoint>, x: number): number {

    if (dataPoints.length == 0) {
        return -1
    }

    let index = Math.round(dataPoints.length / 2)

    

    let add = Math.round(dataPoints.length / 4)

   

    while (add > 1) {

        index = Math.min(dataPoints.length - 1,index)
        index = Math.max(0,index)

        let item = dataPoints[index]

        if (item == undefined) {
            console.error("invalid index: " + index)
            return -1
        }
        
        if (dataPoints[index].x > x) {
            index -= add
        }
        else if (dataPoints[index].x < x) {
            index += add
        }

        
    
        add = Math.round(add / 2)

        
    }

    index = Math.min(dataPoints.length - 1,index)
    index = Math.max(0,index)


    return index
}
*/