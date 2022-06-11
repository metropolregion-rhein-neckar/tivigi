import { Component } from 'vue-property-decorator';

import AbstractAxis from '../AbstractAxis/AbstractAxis';


import { AxisLabel } from '../AxisLabel';



import { zeroPad } from 'tivigi/src/util/formatters';



enum AXIS_LABEL_MODE {
    _1_MIN,
    _15_MIN,
    _1_HOUR,
    _1_DAY,
    _5_DAYS,
    _1_MONTH,
    _1_YEAR
}

const monthNames = [
    "Jan",
    "Feb",
    "Mär",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dez"
]

const msPerDay = 86400000
const msPerHour = 3600000
const msPerQuarterHour = 900000
const msPerMinute = 60000



@Component({
    components: {

    }
})
export default class DatetimeAxis extends AbstractAxis {


    getNextAxisStep(value: number, down: boolean): number {


        const stepSize = this.getLabelStep()


        let result = Math.ceil(value / stepSize) * stepSize

        if (down && value < result) {
            result -= stepSize
        }

        return result
    }


    getLabelStep(): number {
        const dim = (this.dimension == "x") ? 0 : 1


        let stepSize = msPerQuarterHour

        let mode: AXIS_LABEL_MODE = AXIS_LABEL_MODE._15_MIN

        let scale = 1.0 / this.canvas.scale.values[dim]

        if (scale > 40000000) {
            stepSize = msPerDay
            mode = AXIS_LABEL_MODE._1_YEAR
        }

        else if (scale > 7000000) {
            stepSize = msPerDay
            mode = AXIS_LABEL_MODE._1_MONTH
        }
        else if (scale > 2000000) {
            stepSize = msPerDay
            mode = AXIS_LABEL_MODE._5_DAYS
        }
        else if (scale > 70000) {
            stepSize = msPerDay
            mode = AXIS_LABEL_MODE._1_DAY
        }
        else if (scale > 15000) {
            stepSize = msPerHour
            mode = AXIS_LABEL_MODE._1_HOUR
        }
        else if (scale > 1400) {
            stepSize = msPerQuarterHour
            mode = AXIS_LABEL_MODE._15_MIN
        }
        else if (scale > 0) {
            stepSize = msPerMinute
            mode = AXIS_LABEL_MODE._1_MIN
        }

        return stepSize
    }


    getDisplayLabels(): Array<AxisLabel> {

        const result = Array<AxisLabel>()

        const dim = (this.dimension == "x") ? 0 : 1


        // TODO: Remove code duplication in getLabelStep()

        let mode: AXIS_LABEL_MODE = AXIS_LABEL_MODE._15_MIN

        let scale = 1.0 / this.canvas.scale.values[dim]

        if (scale > 40000000) {

            mode = AXIS_LABEL_MODE._1_YEAR
        }

        else if (scale > 7000000) {

            mode = AXIS_LABEL_MODE._1_MONTH
        }
        else if (scale > 2000000) {

            mode = AXIS_LABEL_MODE._5_DAYS
        }
        else if (scale > 70000) {

            mode = AXIS_LABEL_MODE._1_DAY
        }
        else if (scale > 15000) {

            mode = AXIS_LABEL_MODE._1_HOUR
        }
        else if (scale > 1400) {

            mode = AXIS_LABEL_MODE._15_MIN
        }
        else if (scale > 0) {

            mode = AXIS_LABEL_MODE._1_MIN
        }


        const stepSize = this.getLabelStep()
        const lowestVisibleValue = this.canvas.bottomLeftWorld.values[dim]

        let pos = (Math.ceil(lowestVisibleValue / stepSize)) * stepSize


        const canvasAxisLength_world = this.canvas.chartAreaSize.values[dim] / this.scale.values[dim]



        while (pos <= lowestVisibleValue + canvasAxisLength_world ) {

            const d = new Date(pos)
            let text = ""


            switch (mode) {

                case AXIS_LABEL_MODE._1_YEAR:
                    if (d.getUTCDate() == 1 && d.getUTCMonth() == 0) {
                        //text = `01.01.${zeroPad(d.getUTCFullYear(), 2)}`
                        text = d.getUTCFullYear().toString()
                    }

                    break


                case AXIS_LABEL_MODE._1_MONTH:
                    if (d.getUTCDate() == 1) {
                        // text = `${monthNames[d.getUTCMonth()]} ${zeroPad(d.getUTCFullYear(), 2)}`
                        let year = d.getUTCFullYear().toString()
                        //year = year.substring(0,2)
                        text = `${monthNames[d.getUTCMonth()]} ${year}`
                    }

                    break

                case AXIS_LABEL_MODE._1_DAY:
                    text = `${zeroPad(d.getUTCDate(), 2)}.${zeroPad(d.getUTCMonth() + 1, 2)}.`
                    break

                case AXIS_LABEL_MODE._5_DAYS:

                    if (d.getUTCDate() % 5 == 0) {
                        let year = d.getUTCFullYear().toString()
                        year = year.substring(0, 2)
                        year = ""
                        text = `${zeroPad(d.getUTCDate(), 2)}.${zeroPad(d.getUTCMonth() + 1, 2)}.${year}`
                    }

                    break;


                case AXIS_LABEL_MODE._1_HOUR:
                case AXIS_LABEL_MODE._15_MIN:
                case AXIS_LABEL_MODE._1_MIN:

                    text = `${zeroPad(d.getUTCHours(), 2)}:${zeroPad(d.getUTCMinutes(), 2)}`
                    break
            }



            if (text != "") {

                result.push({
                    "pos": pos,
                    "text": text
                })
            }

            pos += stepSize

        }


        return result
    }

}