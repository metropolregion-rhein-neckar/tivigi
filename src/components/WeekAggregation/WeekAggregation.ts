import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { ColorRGBA } from 'tivigi/src/util/ColorRGBA';
import { formatNumberString, zeroPad } from 'tivigi/src/util/formatters';


import "./WeekAggregation.scss"
import WithRender from './WeekAggregation.html';


@WithRender
@Component({
    components: {


    }
})
export default class WeekAggregation extends Vue {

    //#region Props
    @Prop()
    timeSeries: any

    @Prop({ default: false })
    invertColorRamp!: boolean

    @Prop({default: [100, 100, 255, 255]})
    color1! : Array<number>

    @Prop({default: [255, 255, 255, 255]})
    color2! :  Array<number>

  
    //#endregion Props
  
  
    color1_internal = new ColorRGBA([100, 100, 255, 255])
    color2_internal = new ColorRGBA([255, 255, 255, 255])
    



    buckets: any = {}

    timestrings = Array<string>()



    weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

    min = 0
    max = 0

    startDateString = ""
    endDateString = ""


    created() {

  
        this.color1_internal = new ColorRGBA(this.color1)
        this.color2_internal = new ColorRGBA(this.color2)
        

        this.onTimeSeriesChange()
    }


    @Watch("timeSeries")
    onTimeSeriesChange() {

        let ts = Object.keys(this.timeSeries)



        let startDate = new Date(parseInt(ts[0]))
        let endDate = new Date(parseInt(ts[ts.length - 1]))

        this.startDateString = `${zeroPad(startDate.getUTCDate(), 2)}.${zeroPad(startDate.getUTCMonth() + 1, 2)}.${startDate.getUTCFullYear()}`
        this.endDateString = `${zeroPad(endDate.getUTCDate(), 2)}.${zeroPad(endDate.getUTCMonth() + 1, 2)}.${endDate.getUTCFullYear()}`


        this.updateBuckets()
    }


    updateBuckets() {


        const buckets: any = {}
        const sums: any = {}

        this.min = Number.MAX_VALUE
        this.max = Number.MIN_VALUE

        this.timestrings = []

        for (const ts in this.timeSeries) {

            const date = new Date(parseInt(ts))

            const dateString = date.toISOString()


            const pieces = dateString.split("T")
            const timeString = pieces[1].substring(0, 5)

            if (!this.timestrings.includes(timeString)) {
                this.timestrings.push(timeString)
            }

            // Shift day indices so that Monday has index 0 and Sunday has index 6:
            let weekday = date.getUTCDay() - 1

            if (weekday == -1) {
                weekday = 6
            }


            if (buckets[weekday] == undefined) {
                buckets[weekday] = {}
                sums[weekday] = {}
            }

            if (buckets[weekday][timeString] == undefined) {
                buckets[weekday][timeString] = 0
                sums[weekday][timeString] = 0
            }

            const value = this.timeSeries[ts]


            buckets[weekday][timeString] += value
            sums[weekday][timeString]++


        }

        //#region calculate arithmetic mean
        for (const weekday in buckets) {

            for (const ts in buckets[weekday]) {
                buckets[weekday][ts] /= sums[weekday][ts]
            }
        }
        //#endregion calculate arithmetic mean


        //#region Determine min/max
        for (const weekday in buckets) {

            for (const ts in buckets[weekday]) {

                this.min = Math.min(this.min, buckets[weekday][ts])
                this.max = Math.max(this.max, buckets[weekday][ts])
            }
        }
        //#endregion Determine min/max





        this.timestrings = this.timestrings.sort()

        this.buckets = buckets

    }




    getLabel(wdindex: any, ts: any) {

        if (this.buckets[wdindex] == undefined || this.buckets[wdindex][ts] == undefined) {
            return "-"
        }

        let value = this.buckets[wdindex][ts]

        return formatNumberString(value, 2)
    }


    getTooltip(wdindex: any, ts: any) {
        if (this.buckets[wdindex] == undefined || this.buckets[wdindex][ts] == undefined) {
            return "Keine Daten verfügbar"
        }

        return this.buckets[wdindex][ts]
    }


    getTdStyle(wdindex: any, ts: any) {

        let result = {
            backgroundColor: "#fff",
            color: "rgba(0,0,0,0.7)"
        }

        if (this.buckets[wdindex] == undefined) {
            return result
        }

        let value = this.buckets[wdindex][ts]

        if (value == undefined) {
            return result
        }

        let range = this.max - this.min

        if (range < 0.000001) {
            return result
        }


        let distance = value - this.min

        let factor = distance / range



        let startColor, endColor

        if (this.invertColorRamp) {
            startColor = this.color1_internal
            endColor = this.color2_internal
        }
        else {
            startColor = this.color2_internal
            endColor = this.color1_internal
        }


        let diffColor = endColor.sub(startColor)


        let backgroundColor = startColor.add(diffColor.mult(factor))

        backgroundColor = backgroundColor.round()



        result.backgroundColor = backgroundColor.toHexString()

        return result

    }


}

