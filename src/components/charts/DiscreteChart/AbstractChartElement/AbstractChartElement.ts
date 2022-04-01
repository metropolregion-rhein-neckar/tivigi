import SvgChart from '../SvgChart/SvgChart';
import { ChartData } from '../chartUtil';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './AbstractChartElement.html';


@WithRender
@Component({})
export default  class AbstractChartElement extends Vue {


    @Prop()
    data! : ChartData


    w2sX!: Function
    w2sY!: Function


 
    get displayMinX(): number {        
        return  this.parent.getDisplayMinX()
    }

    
    get displayMaxX(): number {        
        return this.parent.getDisplayMaxX()
    }


    get displayMinY(): number {
        
        return this.parent.getDisplayMinY()
    }

 

    get displayMaxY(): number {        
        return this.parent.getDisplayMaxY()
    }


    get parent() : SvgChart {

        let parent = this.$parent

        while (!(parent instanceof SvgChart)) {
            parent = parent.$parent

            // TODO: Loop break condition?
        }

        return parent as SvgChart        
    }

    

    created() {
       
        this.w2sX = this.parent.w2sX
        this.w2sY = this.parent.w2sY
    }
}
