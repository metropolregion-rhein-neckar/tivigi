import { AggregationMethod, AggregationPeriod, loadTimeSeriesInPieces, TimeSeriesLoaderTask } from "tivigi/src/andromedaUtil/andromedaTimeSeriesFunctions"



export class AndromedaTimeSeriesLoader {

    data: any = {
        minValue: null,
        maxValue: null,
        minTime: null,
        maxTime: null,
        data: {}
    }



    constructor(public brokerBaseUrl: string) {
        if (this.brokerBaseUrl == undefined) {
            console.error("Anromeda Time Series Loader: Broker base URL is undefined")
        }
    }



    async load(task: any, dateStart: Date, dateEnd: Date) {

        const promises = []

        for (const entityId in task) {
            const task2: TimeSeriesLoaderTask = {
                entityId: entityId,
            
                attrs: task[entityId]
            }

            promises.push(this.loadTask(task2, dateStart, dateEnd))
        }

        await Promise.all(promises)
    }


    async loadAggregated(task: any, dateStart: Date, dateEnd: Date, aggrMethod: AggregationMethod, aggrPeriodDuration: AggregationPeriod) {

        const promises = []

        for (const entityId in task) {
            
            const task2: TimeSeriesLoaderTask = {
                entityId: entityId,
                
                attrs: task[entityId],
                aggrMethod: aggrMethod,
                aggrPeriodDuration: aggrPeriodDuration
            }
            
            promises.push(this.loadTask(task2, dateStart, dateEnd))            
        }

        await Promise.all(promises)
    }


  

    private async loadTask(task : TimeSeriesLoaderTask, dateStart : Date, dateEnd : Date) {

        const response = await loadTimeSeriesInPieces(this.brokerBaseUrl, task, dateStart, dateEnd)

        if (response == undefined) {
            return
        }
        
        for (const attrName of task.attrs) {

            if (response[task.entityId] == undefined) {
                continue
            }

            const data = response[task.entityId][attrName]

            if (data == undefined) {
                continue
            }

            // NOTE: attrPath is used as the key to store the time series in the loader's cache
            const attrKey = task.entityId + "/" + attrName

            if (this.data.data[attrKey] == undefined) {
                this.data.data[attrKey] = {
                    timeseries: {}
                }
            }


            // These are just a shortcut variable for convenience

            const foo = this.data.data[attrKey]

            // Add data from response to collection of loaded data:
            for (const timestamp in data) {
                // ATTENTION: parseInt() is required here!
                const date = new Date(parseInt(timestamp))
                const milliseconds = date.getTime()
                foo.timeseries[milliseconds] = data[timestamp]
            }


            //#region Add response data to in-memory time series and update per-attribute min-max
            foo.timeseries = this.sortTimestampsAlphabetically(foo.timeseries)

            // NOTE: We cache the keys array here because it is often needed, and if the there are
            // many entries, generating the keys array takes a lot of time.
            foo.timestamps = Object.keys(foo.timeseries)

            this.updateMinMaxByAttrKey(attrKey)
        }

    }


    updateMinMaxByAttrKey(attrKey: string) {

        const foo = this.data.data[attrKey]

        let minValue = Number.MAX_VALUE
        let maxValue = Number.MIN_VALUE

        let minTime = null
        let maxTime = null

        const timeSeries = foo.timeseries

        for (const timestamp in timeSeries) {

            maxValue = Math.max(maxValue, timeSeries[timestamp])
            minValue = Math.min(minValue, timeSeries[timestamp])

            if (maxTime === null) {
                maxTime = timestamp
            }
            else if (timestamp > maxTime) {
                maxTime = timestamp
            }

            if (minTime === null) {
                minTime = timestamp
            }
            else if (timestamp < minTime) {
                minTime = timestamp
            }
        }

        foo.minValue = minValue
        foo.maxValue = maxValue

        foo.minTime = minTime
        foo.maxTime = maxTime

    }


    updateGlobalMinMax() {

        let minValue = Number.MAX_VALUE
        let maxValue = Number.MIN_VALUE

        let maxTime = null
        let minTime = null

        for (const attrKey in this.data.data) {
            const attribute = this.data.data[attrKey]

            maxValue = Math.max(maxValue, attribute.maxValue)
            minValue = Math.min(minValue, attribute.minValue)

            if (maxTime === null) {
                maxTime = attribute.maxTime
            }
            else if (attribute.maxTime > maxTime) {
                maxTime = attribute.maxTime
            }

            if (minTime === null) {
                minTime = attribute.minTime
            }
            else if (attribute.minTime < minTime) {
                minTime = attribute.minTime
            }
        }

        this.data.minTime = minTime
        this.data.maxTime = maxTime
        this.data.minValue = minValue
        this.data.maxValue = maxValue
    }



    sortTimestampsAlphabetically(object: any): any {

        return Object.keys(object).sort(

            (a, b) => { return a.localeCompare(b); }

        ).reduce(
            (obj: any, key: string) => {
                obj[key] = object[key];
                return obj;
            },
            {}
        );
    }
}
