import { Component, Prop } from 'vue-property-decorator';
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

const stepSizes = {
    [AXIS_LABEL_MODE._1_YEAR]: msPerDay,
    [AXIS_LABEL_MODE._1_MONTH]: msPerDay,
    [AXIS_LABEL_MODE._5_DAYS]: msPerDay,
    [AXIS_LABEL_MODE._1_DAY]: msPerDay,
    [AXIS_LABEL_MODE._1_HOUR]: msPerHour,
    [AXIS_LABEL_MODE._15_MIN]: msPerQuarterHour,
    [AXIS_LABEL_MODE._1_MIN]: msPerMinute

}


@Component({
    components: {

    }
})
export default class DatetimeAxis extends AbstractAxis {

    @Prop()
    forceLabelScale!: string


    getNextAxisStep(value: number, down: boolean): number {
        const dim = (this.dimension == "x") ? 0 : 1

        const scale = 1.0 / this.canvas.scale.values[dim]


        const mode = this.getMode(scale)

        const stepSize = stepSizes[mode]


        let result = Math.ceil(value / stepSize) * stepSize

        if (down && value < result) {
            result -= stepSize
        }

        return result
    }



    getMode(scale: number) {

        if (typeof this.forceLabelScale == 'string') {

            switch(this.forceLabelScale) {
                case "year" :
                    return AXIS_LABEL_MODE._1_YEAR
            }
        }
        
        let mode = AXIS_LABEL_MODE._1_MIN

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

        return mode
    }


    getDisplayLabels(): Array<AxisLabel> {

        const result = Array<AxisLabel>()

        const dim = (this.dimension == "x") ? 0 : 1

        const scale = 1.0 / this.canvas.scale.values[dim]

        const mode = this.getMode(scale)

        const stepSize = stepSizes[mode]

        const lowestVisibleValue = this.canvas.bottomLeftWorld.values[dim]

        let pos = (Math.ceil(lowestVisibleValue / stepSize)) * stepSize


        const canvasAxisLength_world = this.canvas.chartAreaSize.values[dim] / this.scale.values[dim]



        while (pos <= lowestVisibleValue + canvasAxisLength_world) {

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

            let tooltip = d.toLocaleDateString() + ", " + d.toLocaleTimeString()

            tooltip = `${zeroPad(d.getUTCDate(),2)}.${zeroPad(d.getUTCMonth() + 1,2)}.${d.getUTCFullYear()}, ${zeroPad(d.getUTCHours(),2)}:${zeroPad(d.getUTCMinutes(),2)}:${zeroPad(d.getUTCSeconds(),2)}` 

            if (text != "") {

                result.push({
                    "pos": pos,
                    "text": text,
                    "tooltip": tooltip
                })
            }

            pos += stepSize

        }


        return result
    }

    
    beforeDestroy() {
        this.canvas.$el.removeEventListener("mousemove", this.onMouseMove)  
        this.canvas.$el.removeEventListener("mouseout", this.onMouseOut)       
    }


    mounted() {
        this.canvas.$el.addEventListener("mousemove", this.onMouseMove)       
        this.canvas.$el.addEventListener("mouseout", this.onMouseOut) 
    }

    onMouseMove(evt : Event) {

        
        // TODO: Implement x vs y axis difference
        const pos = (evt as MouseEvent).offsetX - this.canvas.chartAreaPos.x

        if (pos > 0) {
        this.mShowMovingLabel = true

    }
    else {
        this.mShowMovingLabel = false
        return
    }

        let wx = this.s2wx(pos)

        

        let d = new Date(wx)

       

        this.movingLabelText =  `${zeroPad(d.getUTCDate(), 2)}.${zeroPad(d.getUTCMonth() + 1, 2)}.${d.getUTCFullYear()}` + ", " + `${zeroPad(d.getUTCHours(), 2)}:${zeroPad(d.getUTCMinutes(), 2)}`
        this.movingLabelPos = pos
    }

    onMouseOut() {
        this.mShowMovingLabel = false
    }
}