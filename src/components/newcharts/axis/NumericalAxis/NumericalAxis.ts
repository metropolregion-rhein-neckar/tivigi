// TODO: Cache labelStep

import { Component, Prop } from 'vue-property-decorator';
import { AxisLabel } from '../AxisLabel';

import AbstractAxis from '../AbstractAxis/AbstractAxis';
import { formatNumberString } from 'tivigi/src/util/formatters';


@Component({})
export default class NumericalAxis extends AbstractAxis {

    //#region Props
    @Prop({default:0})
    numDecimals! : number
    //#endregion Props

    readonly cfg_axisSteps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000,
        500000, 1000000, 2500000, 5000000, 10000000, 25000000, 50000000]
    readonly cfg_targetPixelsPerAxisStep = 40


    protected getLabelStep(): number {

        const dim = (this.dimension == "x") ? 0 : 1


        const numSteps = this.canvas.chartAreaSize.values[dim] / this.cfg_targetPixelsPerAxisStep

        const displayRange = this.canvas.getDisplayMax().sub(this.canvas.getDisplayMin())

        let result = Math.ceil(displayRange.values[dim] / numSteps)

        for (let ii = 0; ii < this.cfg_axisSteps.length; ii++) {
            if (this.cfg_axisSteps[ii] >= result || ii == this.cfg_axisSteps.length - 1) {
                result = this.cfg_axisSteps[ii]
                break
            }
        }

        return result
    }



    getNextAxisStep(value: number, down: boolean): number {


        const stepSize = this.getLabelStep()


        let result = Math.ceil(value / stepSize) * stepSize

        if (down && value < result) {
            result -= stepSize
        }



        return result
    }


    public getDisplayLabels(): Array<AxisLabel> {

        const dim = (this.dimension == "x") ? 0 : 1

        const result = Array<AxisLabel>()

        const stepSize = this.getLabelStep()

        const lowestVisibleValue = this.canvas.bottomLeftWorld.values[dim]

        let pos = this.getNextAxisStep(lowestVisibleValue, false)


        const canvasAxisLength_world = this.canvas.chartAreaSize.values[dim] / this.canvas.scale.values[dim]




        const reduceSteps = [{ num: 1000000000, label: "Mrd." }, { num: 1000000, label: "Mio." }, { num: 1000, label: "Tsd." }]

        while (pos <= lowestVisibleValue + canvasAxisLength_world + 1) {

            let value = pos
            let text = formatNumberString(pos, this.numDecimals, ",", ".")

            for (const rs of reduceSteps) {

                if (value < -rs.num || value > rs.num) {
                    value /= rs.num
                    text = value + " " + rs.label
                }
            }


            result.push({ pos: pos, text: text })


            pos += stepSize
        }


        return result
    }
}