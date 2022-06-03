// NOTE:
// These functions implement the basic functionality of loading time series data from the Andromeda broker.
// You pass in a loading task and get the requested data as a return value. 
// It is purely procedural/functional code with no side effects and no additional features
// like client-side caching or "smart" logic to only request data that hasn't been loaded yet.
// Such features can be implemented elsewhere, on top of the functionality provided here.

// The main thought behind this modular approach is (apart from the well-known fact that it is generally
// a good idea to split code into small functional units) is that the efficient synchronization of
// time series data from the broker to the client is a complex topic where we are still far from having
// found really good solutions. Splitting up the involved functionality into smaller pieces allows us to
// recombine them in different ways and experiment with different approaches of how to manage this.

export enum AggregationPeriod {
    day = "day"
}

export enum AggregationMethod {
    sum = "sum"
}


export interface TimeSeriesLoaderTask {
    entityId: string,
    attrs: Array<string>,

    dateStart: Date,
    dateEnd: Date,

    // These are optional:
    aggrMethod?: "sum",
    aggrPeriodDuration?: "day"

}


export async function loadTimeSeries(brokerBaseUrl: string, tasks: Array<TimeSeriesLoaderTask>): Promise<any> {

    const result: any = {}

    const promises = []

    for (const task of tasks) {
        promises.push(loadTimeSeriesInPieces(brokerBaseUrl, task))
    }

    const results = await Promise.all(promises)


    for (const res of results) {

        if (res == undefined) {
            continue
        }


        for (const entityId in res) {
            if (result[entityId] == undefined) {
                result[entityId] = {}
            }

            for (const attrName in res[entityId]) {
                result[entityId][attrName] = res[entityId][attrName]
            }
        }

    }


    return result
}




export async function loadTimeSeriesInPieces(brokerBaseUrl: string, task: TimeSeriesLoaderTask) {

    let result: any = {

    }

    //result[task.entityId] = {}

    // ATTENTION: 
    // 'dateStart' is the BEGINNING, i.e. the EARLIER date.
    // 'dateEnd' is the END, i.e. the LATER date.

    const timeAt = task.dateStart.toISOString()
    const endTimeAt = task.dateEnd.toISOString()
    const timerel = "between_with_start"
    const lastN = 0

    let attrsJoined = ""

    if (!(task.attrs instanceof Array)) {
        console.error("task.attrs is not an Array")
        console.log(task.attrs)
        return
    }

    attrsJoined = task.attrs.join(",")

    let url = `${brokerBaseUrl}/temporal/entities/${task.entityId}/?attrs=${attrsJoined}&timerel=${timerel}&timeAt=${timeAt}&endTimeAt=${endTimeAt}`

    if (task.aggrMethod != undefined && task.aggrPeriodDuration != undefined) {
        url += `&options=aggregatedValues&aggrMethods=${task.aggrMethod}&aggrPeriodDuration=${task.aggrPeriodDuration}`
    }
    else {
        url += `&options=temporalValues`
    }

    if (lastN > 0) {
        url += "&lastN=" + lastN
    }

    const res = await fetch(url)

    if (res.status != 200) {
        //console.log("fail")
        return
    }


    //#region Parse response JSON
    const text = await res.text()

    let entityFragment: any = undefined

    try {
        entityFragment = JSON.parse(text)
    }
    catch (e) {
        console.error("Failed to parse response from: " + res.url)
        return
    }
    //#endregion Parse response JSON



    // TODO: Min/max should only be updated if the request was successful, but returned an empty
    // array. This needs to be implemented in the broker first.

    let nextRequestStartDate = new Date(task.dateStart.getTime());

    let attrsToCheck = Array<string>()

    let lastReturnedTimestamp = undefined

    for (const attrName of task.attrs) {

        if (entityFragment[attrName] == undefined) {
            continue
        }

        if (result[attrName] == undefined) {
            result[attrName] = {}
        }


        //#region Aggregated
        if (task.aggrMethod != undefined && task.aggrPeriodDuration != undefined) {

            if (entityFragment[attrName][task.aggrMethod] == undefined || entityFragment[attrName][task.aggrMethod].length == 0) {
                continue
            }


            // These are just a shortcut variable for convenience
            const intervals = entityFragment[attrName][task.aggrMethod]

            // Add data from response to collection of loaded data:
            for (const interval of intervals) {

                const dateStart = new Date(interval[1])
                //const dateEnd = new Date(interval[2])

                const value = interval[0]

                const timestamp = dateStart.getTime()
                result[attrName][timestamp] = Math.round(value * 1000) / 1000

            }

            lastReturnedTimestamp = intervals[intervals.length - 1][0]
            //#endregion aggregated
        }
        else {

            if (entityFragment[attrName].values.length == 0) {
                continue
            }

            const values = entityFragment[attrName].values

            for (const kvp of values) {
                const timestamp = new Date(kvp[0]).getTime()
                result[attrName][timestamp] = kvp[1]
            }

            lastReturnedTimestamp = values[values.length - 1][0]
        }


        //#region Check whether another request is required to load the complete times series

        // ATTENTION: This assumes that the returned time series instances are 
        // ordered by observedAt in DESCENDING order!

        const earliestDateOfCurrentAttribute = new Date(lastReturnedTimestamp)

        if (earliestDateOfCurrentAttribute > task.dateStart) {

            attrsToCheck.push(attrName)

            if (earliestDateOfCurrentAttribute > nextRequestStartDate) {
                nextRequestStartDate = earliestDateOfCurrentAttribute
            }
        }


        //#endregion Check whether another request is required to load the complete times series
    }




    if (attrsToCheck.length) {

        const newTask: TimeSeriesLoaderTask = {
            entityId: task.entityId,
            attrs: attrsToCheck,
            aggrMethod: task.aggrMethod,
            aggrPeriodDuration: task.aggrPeriodDuration,
            dateStart: task.dateStart,
            dateEnd: nextRequestStartDate
        }

        const moreData: any = await loadTimeSeriesInPieces(brokerBaseUrl, newTask)

        if (moreData != undefined && moreData[task.entityId] != undefined) {

            for (const attrName in moreData[task.entityId]) {

                if (result[attrName] == undefined) {
                    result[attrName] = []
                }

                for (const kvp of moreData[task.entityId][attrName].values) {
                    const timestamp = new Date(kvp[0]).getTime()
                    result[attrName][timestamp] = kvp[1]
                }
            }
        }
    }

    let res2: any = {}

    res2[task.entityId] = result

    return res2
}

