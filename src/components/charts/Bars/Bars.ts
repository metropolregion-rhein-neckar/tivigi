import AbstractChartElement from 'tivigi/src/components/charts/AbstractChartElement/AbstractChartElement';
import { ChartData, DataPoint, Dataset } from 'tivigi/src/components/charts/chartUtil';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './Bars.html';


@WithRender
@Component({

    components: {
     
    }
})
export default class Bars extends AbstractChartElement {

    //########## BEGIN Props ##########
    @Prop({ default: 25 })
    barWidth!: number

  
   
    //########## END Props ##########

    getBarWidth() : number {
        return this.barWidth /this.data.datasets.length
    }

   

    getStyle(dataset : Dataset): any {

        let color = "#000"

        if (dataset.style.color) {
            color = dataset.style.color
        }

        return {
            "fill": color,
            "--color" : color
        }

        
    }


    getX(point: DataPoint, index : number): number {
       return this.w2sX(point.x) - (this.barWidth / 2) + (index * this.getBarWidth())
    }


    getY(value: number): number {

        if (value >= 0) {
            return this.w2sY(value)
        }
        else {
            return this.w2sY(0)
        }
    }
}
