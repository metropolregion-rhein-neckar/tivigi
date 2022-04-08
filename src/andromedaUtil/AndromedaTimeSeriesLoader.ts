class TimeFrame {
    out = false
    constructor(public begin: number, public end: number) {

    }
}



export class AndromedaTimeSeriesLoader {

    data: any = {
        minValue: null,
        maxValue: null,
        minTime: null,
        maxTime: null,
        data: {}
    }

    requested = Array<TimeFrame>()
    toLoad = Array<TimeFrame>()
    loaded = Array<TimeFrame>()


    constructor(public brokerBaseUrl: string, public attributes: Array<string>) { }


    async load(startTime: number, endTime: number) {

        /*
        //this.requested.push(new TimeFrame(startTime, endTime))
        this.requested.push(new TimeFrame(startTime, endTime))

        this.requested = this.mergeTimeFrames(this.requested)

        const diff = this.getTimeFramesDiff(this.requested, this.loaded)

        console.log(diff)

        for (const tf of diff) {
               const dateStart = new Date(tf.begin)
            const dateEnd = new Date(tf.end)

*/

        const dateStart = new Date(startTime)
        const dateEnd = new Date(endTime)


        const timeAt = dateStart.toISOString()
        const endTimeAt = dateEnd.toISOString()
        const timerel = "between"

        const einkaufszettel: any = {}

        for (const attrSourceString of this.attributes) {

            const offset = attrSourceString.lastIndexOf("/")
            const entityId = attrSourceString.substring(0, offset)
            const attrName = attrSourceString.substring(offset + 1)

            if (einkaufszettel[entityId] == undefined) {
                einkaufszettel[entityId] = []
            }

            einkaufszettel[entityId].push(attrName)
        }


        const promises = []

        for (const entityId in einkaufszettel) {

            const url = `${this.brokerBaseUrl}/temporal/entities/${entityId}?attrs=${einkaufszettel[entityId].join(",")}&timerel=${timerel}&timeAt=${timeAt}&endTimeAt=${endTimeAt}&options=temporalValues`
            promises.push(fetch(url))
        }

        const responses = await Promise.all(promises)

        await this.parseResponses(responses)

    }



    getTimeFramesDiff(requested: Array<TimeFrame>, loaded: Array<TimeFrame>) {

        requested = this.mergeTimeFrames(requested)
        loaded = this.mergeTimeFrames(loaded)

        let diffs = Array<TimeFrame>()

        for (const req of requested) {

            let req_added = false


            for (const exist of loaded) {


                // If req is entirely within exist, continue:
                if (exist.begin <= req.begin && exist.end >= req.end) {
                    req_added = true
                    continue
                }


                diffs.push(new TimeFrame(req.begin, Math.min(req.end, exist.begin)))
                diffs.push(new TimeFrame(Math.max(exist.end, req.begin), req.end))
                req_added = true

            }

            if (!req_added) {
                diffs.push(new TimeFrame(req.begin, req.end))
            }

        }

        diffs = this.mergeTimeFrames(diffs)

        //console.log(diffs)
        return diffs
    }


    mergeTimeFrames(tf: Array<TimeFrame>) {

        let original = tf.slice()

        for (let t of original) {
            t.out = false
        }


        while (true) {

            let merger = false

            for (let t0 of original) {

                if (t0.out) {
                    continue
                }

                for (let t1 of original) {

                    if (t1.out) {
                        continue
                    }

                    if (t0 == t1) {
                        continue
                    }


                    // If t0 and t1 don't overlap at all, continue:
                    if (t1.begin > t0.end || t1.end < t0.begin) {
                        continue
                    }

                    // If there is asymmetric overlap, create new timeframe by merging t0 and t1:
                    let min = Math.min(t0.begin, t1.begin)
                    let max = Math.max(t0.end, t1.end)

                    t0.begin = min
                    t0.end = max

                    t1.out = true

                    merger = true

                }
            }

            let newOriginal = []

            for (let t of original) {
                if (!t.out) {
                    newOriginal.push(t)
                }
            }

            original = newOriginal


            //console.log("boo")

            if (merger == false) {
                break
            }
        }

        return original
    }


    async parseResponses(responses: Array<Response>) {

        const promises = []

        for (const res of responses) {

            if (res.status == 200) {
                promises.push(res.text())
            }
        }

        const responses2 = await Promise.all(promises)
        await this.parseResponses2(responses2)
    }


    async parseResponses2(responseBodies: Array<string>) {

        for (const dataString of responseBodies) {

            let entityFragment: any = undefined

            try {
                entityFragment = JSON.parse(dataString)
            }
            catch (e) {
                continue
            }

            if (entityFragment == undefined) {
                continue
            }

            for (const attrName in entityFragment) {

                if (entityFragment[attrName].type != "Property") {
                    continue
                }


                const attrKey = entityFragment.id + "/" + attrName

                if (this.data.data[attrKey] == undefined) {
                    this.data.data[attrKey] = {
                        timeseries: {}
                    }
                }

                const foo = this.data.data[attrKey].timeseries


                let responseMinTime = Number.MAX_VALUE
                let responseMaxTime = Number.MIN_VALUE


                for (const kvp of entityFragment[attrName].values) {

                    const date = new Date(kvp[0])

                    const milliseconds = date.getTime()

                    responseMinTime = Math.min(responseMinTime, milliseconds)
                    responseMaxTime = Math.max(responseMaxTime, milliseconds)

                    foo[milliseconds] = kvp[1]
                }

                this.loaded.push(new TimeFrame(responseMinTime, responseMaxTime))

                this.loaded = this.mergeTimeFrames(this.loaded)

                // console.log(JSON.stringify(this.loaded))

                /*
                // Add random data for performance testing:
                for(let ii = 0; ii < 100000;ii++) {
                   let ts = lastMs - Math.round(Math.random() * 1000000000)
                   foo[ts] = Math.random() * 10
                }
                */




                this.data.data[attrKey].timeseries = this.sortTimestampsAlphabetically(foo)

                // NOTE: We cache the keys array here because it is often needed, and if the there are
                // many entries, generating the keys array takes a lot of time.
                this.data.data[attrKey].timestamps = Object.keys(this.data.data[attrKey].timeseries)

                this.updateMinMaxByAttrKey(attrKey)
            }
        }

        this.updateGlobalMinMax()
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
