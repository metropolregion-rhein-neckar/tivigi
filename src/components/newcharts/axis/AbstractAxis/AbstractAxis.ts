// TODO: 2 Fix display of negative values when used as y axis if scale != 1.0

import { Component, Prop } from 'vue-property-decorator';
import { AxisLabel } from '../AxisLabel';
import AbstractChartElement from '../../AbstractChartElement/AbstractChartElement';

import "./AbstractAxis.scss"
import WithRender from './AbstractAxis.html';


@WithRender
@Component({})
export default class AbstractAxis extends AbstractChartElement {


    //#region Props
    @Prop()
    dimension!: string

    @Prop({ default: true })
    showLines!: boolean

    @Prop({default:0})
    labelAngle!:number
    //#endregion Props


    movingLabelText = ""
    movingLabelPos = 0

    showMovingLabel = false

    displayLabels = Array<AxisLabel>()


    beforeDestroy() {

    }

    getDisplayLabels(): Array<AxisLabel> {
        return []
    }


    getYAxisLabelStyle(label:AxisLabel) : any {
        return {
          //  "transform": "rotate(10deg)"
        }
    }

    getXAxisLabelStyle(label:AxisLabel) : any {

   

        let transform = `translate(${this.w2sx(label.pos)}px, ${this.canvas.chartAreaSize.y + 20}px) `

        let textAnchor = "middle"

        if (this.labelAngle != 0) {
            transform += `rotate(${this.labelAngle}deg)`
            textAnchor = "start"
        }

        return {
            "transform": transform,
            "text-anchor" : textAnchor
        }
    }


    getLineClass(pos : number) {
        return {
            "AxisZeroLine" : pos == 0
        }
    }

    getNextAxisStep(value: number, down: boolean): number {
        return 0
    }



    onCanvasExtentChange() {
        this.displayLabels = this.getDisplayLabels()
    }

}

