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


    async load(attrSourceString: string, dateStart: Date, dateEnd: Date) {

        // ATTENTION: 
        // 'dateStart' is the BEGINNING, i.e. the EARLIER date.
        // 'dateEnd' is the END, i.e. the LATER date.

        const timeAt = dateStart.toISOString()
        const endTimeAt = dateEnd.toISOString()
        const timerel = "between_with_start"



        const offset = attrSourceString.lastIndexOf("/")
        const entityId = attrSourceString.substring(0, offset)
        const attrName = attrSourceString.substring(offset + 1)
        
        const url = `${this.brokerBaseUrl}/temporal/entities/${entityId}/?attrs=${attrName}&timerel=${timerel}&timeAt=${timeAt}&endTimeAt=${endTimeAt}&options=temporalValues`

        //console.log("Loading from " + timeAt + " to " + endTimeAt)
        //console.log(url)

        const attrKey = attrSourceString

        
        if (this.data.data[attrKey] == undefined) {
            this.data.data[attrKey] = {
                timeseries: {}
            }
        }

        // This is just a shortcut variable for convenience
        const foo = this.data.data[attrKey].timeseries


        const res = await fetch(url)

        if (res.status != 200) {
        
            // TODO: Refactor this to reduce copy-paste 
            this.data.data[attrKey].timeseries = this.sortTimestampsAlphabetically(foo)

            // NOTE: We cache the keys array here because it is often needed, and if the there are
            // many entries, generating the keys array takes a lot of time.
            this.data.data[attrKey].timestamps = Object.keys(this.data.data[attrKey].timeseries)

            this.updateMinMaxByAttrKey(attrKey)

            this.updateGlobalMinMax()
            return
        }



        let text = await res.text()


        let entityFragment: any = undefined

        try {
            entityFragment = JSON.parse(text)
        }
        catch (e) {
            console.log("Failed to parse response from: " + res.url)

        }


        if (entityFragment == undefined) {
            console.error("Failed to parse time series JSON")
            return
        }




        // TODO: Min/max should only be updated if the request was successful, but returned an empty
        // array. This needs to be implemented in the broker first.

        if (entityFragment[attrName] == undefined) {
            //console.error("Response contains no time series data for the requested attribute")

            //console.log("Everything loaded")


            this.data.data[attrKey].timeseries = this.sortTimestampsAlphabetically(foo)

            // NOTE: We cache the keys array here because it is often needed, and if the there are
            // many entries, generating the keys array takes a lot of time.
            this.data.data[attrKey].timestamps = Object.keys(this.data.data[attrKey].timeseries)

            this.updateMinMaxByAttrKey(attrKey)

            this.updateGlobalMinMax()
            return
        }

        // TODO: 2 Differentiate between failed request and no more data (requires changes in broker code)
        if (entityFragment[attrName].values.length == 0) {
            console.log("Nothing returned")
            return
        }



        // This is just a shortcut variable for convenience
        const values = entityFragment[attrName].values

        


        for (const kvp of values) {

            const date = new Date(kvp[0])

            const milliseconds = date.getTime()

          
            foo[milliseconds] = kvp[1]
        }


        const lastReturnedItem = values[values.length - 1]

        const earliestReturnedDate = new Date(lastReturnedItem[0])

        if (earliestReturnedDate > dateStart) {
            //console.log(lastReturnedItem[0] + " <-> " + timeAt)
            //console.log("Checking for more data")


            await this.load(attrSourceString, dateStart, earliestReturnedDate)
        }
        else {
            this.data.data[attrKey].timeseries = this.sortTimestampsAlphabetically(foo)

            // NOTE: We cache the keys array here because it is often needed, and if the there are
            // many entries, generating the keys array takes a lot of time.
            this.data.data[attrKey].timestamps = Object.keys(this.data.data[attrKey].timeseries)

            this.updateMinMaxByAttrKey(attrKey)

            this.updateGlobalMinMax()
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
