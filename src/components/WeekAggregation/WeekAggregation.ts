import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { sortKeysAlphabetically } from 'tivigi/src/andromedaUtil/andromedaUtil';
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

    //#endregion Props
    color2 = new ColorRGBA([255, 255, 255, 255])
    color1 = new ColorRGBA([100, 100, 255, 255])



    buckets: any = {}

    timestrings = Array<string>()

    created() {
        this.onTimeSeriesChange()
    }

    weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

    min = 0
    max = 0

    startDateString = ""
    endDateString = ""

    @Watch("timeSeries")
    onTimeSeriesChange() {

        let ts = Object.keys(this.timeSeries)
        
        

        let startDate = new Date(parseInt(ts[0]))
        let endDate = new Date(parseInt(ts[ts.length - 1]))
        
        this.startDateString = `${zeroPad(startDate.getUTCDate(),2)}.${zeroPad(startDate.getUTCMonth() + 1,2)}.${startDate.getUTCFullYear()}`
        this.endDateString = `${zeroPad(endDate.getUTCDate(),2)}.${zeroPad(endDate.getUTCMonth() + 1,2)}.${endDate.getUTCFullYear()}`
        

        this.buckets = this.getBucketsByWeekday()
    }


    getBucketsByWeekday() {
        const buckets: any = {}
        const sums: any = {}

        let min = Number.MAX_VALUE
        let max = Number.MIN_VALUE

        for (const ts in this.timeSeries) {

            const date = new Date(parseInt(ts))

            const dateString = date.toISOString()


            const pieces = dateString.split("T")
            const timeString = pieces[1].substring(0, 5)

            if (!this.timestrings.includes(timeString))
                this.timestrings.push(timeString)

            // Shift day indices so that Monday has index 0 and Sunday has index 6:
            let weekday = date.getDay() - 1

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

        for (const weekday in buckets) {
           
            for (const ts in buckets[weekday]) {
                buckets[weekday][ts] /= sums[weekday][ts]

                min = Math.min(min, buckets[weekday][ts])
                max = Math.max(max, buckets[weekday][ts])
            }
        }

        this.timestrings = this.timestrings.sort()

        // TODO: It's not clean to do this here
        this.min = min
        this.max = max

        return buckets
    }



    getLabel(wdindex: any, ts: any) {

        if (this.buckets[wdindex] == undefined || this.buckets[wdindex][ts] == undefined) {
            return "-"
        }

        let value = this.buckets[wdindex][ts]

        return formatNumberString(value, 2)
    }


    getTooltip(wdindex:any, ts:any) {
        if (this.buckets[wdindex] == undefined || this.buckets[wdindex][ts] == undefined) {
            return "Keine Daten verfügbar"
        }
 
        return ""
    }


    getTdStyle(wdindex: any, ts: any) {


        if (this.buckets[wdindex] == undefined) {
            return ""
        }

        let value = this.buckets[wdindex][ts]

        if (value == undefined) {
            return {}
        }

        let range = this.max - this.min

        let distance = value - this.min

        let factor = distance / range

        let startColor, endColor

        if (this.invertColorRamp) {
            startColor = this.color1
            endColor = this.color2
        }
        else {
            startColor = this.color2
            endColor = this.color1
        }


        let diffColor = endColor.sub(startColor)


        let backgroundColor = startColor.add(diffColor.mult(factor))

        backgroundColor = backgroundColor.round()

        let textColor = new ColorRGBA([255, 255, 255, 255]).sub(backgroundColor)
        textColor.a = 180

        textColor = new ColorRGBA([0, 0, 0, 180])
        return {
            backgroundColor: backgroundColor.toHexString(),
            color: textColor.toHexString()
        }
    }


}

