
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


  
    async load(task : any, dateStart: Date, dateEnd: Date) {

        const promises = []

        for (const entityId in task) {
            promises.push(this.load2(entityId, task[entityId], dateStart,dateEnd))
        }

        await Promise.all(promises)
    }


    private async load2(entityId: string, attrNames: Array<string>, dateStart: Date, dateEnd: Date) {

        // ATTENTION: 
        // 'dateStart' is the BEGINNING, i.e. the EARLIER date.
        // 'dateEnd' is the END, i.e. the LATER date.

        const timeAt = dateStart.toISOString()
        const endTimeAt = dateEnd.toISOString()
        const timerel = "between_with_start"


        const url = `${this.brokerBaseUrl}/temporal/entities/${entityId}/?attrs=${attrNames.join(",")}&timerel=${timerel}&timeAt=${timeAt}&endTimeAt=${endTimeAt}&options=temporalValues`


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
            console.log("Failed to parse response from: " + res.url)
            return
        }
        //#endregion Parse response JSON



        // TODO: Min/max should only be updated if the request was successful, but returned an empty
        // array. This needs to be implemented in the broker first.

        let nextRequestStartDate = new Date(dateStart.getTime());

        let attrsToCheck = Array<string>()



        for (const attrName of attrNames) {

            if (entityFragment[attrName] == undefined) {
                continue
            }

            if (entityFragment[attrName].values.length == 0) {
                continue
            }


            // NOTE: attrPath is used as the key to store the time series in the loader's cache
            const attrKey = entityId + "/" + attrName

            if (this.data.data[attrKey] == undefined) {
                this.data.data[attrKey] = {
                    timeseries: {}
                }
            }


            // These are just a shortcut variable for convenience
            const values = entityFragment[attrName].values
            const foo = this.data.data[attrKey]

            // Add data from response to collection of loaded data:
            for (const kvp of values) {
                const date = new Date(kvp[0])
                const milliseconds = date.getTime()
                foo.timeseries[milliseconds] = kvp[1]
            }


            //#region Add response data to in-memory time series and update per-attribute min-max
            foo.timeseries = this.sortTimestampsAlphabetically(foo.timeseries)

            // NOTE: We cache the keys array here because it is often needed, and if the there are
            // many entries, generating the keys array takes a lot of time.
            foo.timestamps = Object.keys(foo.timeseries)

            this.updateMinMaxByAttrKey(attrKey)
            //#endregion Add response data to in-memory time series and update per-attribute min-max


            //#region Check whether another request is required to load the complete times series

            // ATTENTION: This assumes that the returned time series instances are 
            // ordered by observedAt in DESCENDING order!
            const lastReturnedItem = values[values.length - 1]

            const earliestDateOfCurrentAttribute = new Date(lastReturnedItem[0])

            if (earliestDateOfCurrentAttribute > dateStart) {

                attrsToCheck.push(attrName)

                if (earliestDateOfCurrentAttribute > nextRequestStartDate) {
                    nextRequestStartDate = earliestDateOfCurrentAttribute
                }
            }

            //#endregion Check whether another request is required to load the complete times series
        }


        this.updateGlobalMinMax()


        if (attrsToCheck.length > 0) {            
            await this.load2(entityId, attrsToCheck, dateStart, nextRequestStartDate)
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
