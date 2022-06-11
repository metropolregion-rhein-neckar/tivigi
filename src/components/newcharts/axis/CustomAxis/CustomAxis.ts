import { Component, Prop } from 'vue-property-decorator';

import AbstractAxis from '../AbstractAxis/AbstractAxis';
import { AxisLabel } from '../AxisLabel';

@Component({})
export default class CustomAxis extends AbstractAxis {


    @Prop({default:() =>[]})
    labels! : Array<AxisLabel>

  


    public getDisplayLabels(): Array<AxisLabel> {
        // TODO: 2 Understand why the labels do not move when the axis is panned, 
        // unless we clone the labels array here
      //  return this.labels.slice()


        const dim = (this.dimension == "x") ? 0 : 1

        const result = Array<AxisLabel>()

       
        const lowestVisibleValue = this.canvas.bottomLeftWorld.values[dim]

        
        

        const canvasAxisLength_world = this.canvas.chartAreaSize.values[dim] / this.canvas.scale.values[dim]

        
        for(const label of this.labels) {
            // TODO: Implement axis label clipping in SVG so that this check is no longer required
            if (label.pos < lowestVisibleValue || label.pos > lowestVisibleValue + canvasAxisLength_world) {
                continue
            }

            result.push(label)
        }
      
      
        return result
       
    }


    getNextAxisStep(value: number, down: boolean): number {

      
        if (down) {
            for(let ii = this.labels.length - 1; ii > 0; ii--) {
                if (this.labels[ii].pos < value) {
                    return this.labels[ii].pos
                }
            }

            return this.labels[0].pos
        }
        else {
            for(let ii = 0; ii < this.labels.length; ii++) {
                if (this.labels[ii].pos > value) {
                    return this.labels[ii].pos
                }
            }

            return this.labels[this.labels.length - 1].pos
        }


        return -1
    }

    /*
    getLabelMax() : number {
        let result = Number.NEGATIVE_INFINITY

        for(const label of this.labels) {
            result = Math.max(result, label.pos)
        }

        return result
    }
   

    getLabelMin() : number {
        let result = Number.POSITIVE_INFINITY

        for(const label of this.labels) {
            result = Math.min(result, label.pos)
        }

        return result
    }
*/
}

