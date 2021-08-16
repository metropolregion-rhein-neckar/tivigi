import BarChart from 'tivigi/src/components/charts/BarChart/BarChart';
import { ChartData } from 'tivigi/src/components/charts/chartUtil';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './AbstractChartElement.html';


@WithRender
@Component({})
export default class AbstractChartElement extends Vue {


    @Prop()
    data! : ChartData


    w2sX!: Function
    w2sY!: Function


 
    get displayMinX(): number {
        const parent = this.$parent as BarChart
        return  (this.$parent as BarChart).getDisplayMinX()
    }

    
    get displayMaxX(): number {        
        return (this.$parent as BarChart).getDisplayMaxX()
    }


    get displayMinY(): number {
        const parent = this.$parent as BarChart
        return parent.getDisplayMinY()
    }

 

    get displayMaxY(): number {
        const parent = this.$parent as BarChart
        return parent.getDisplayMaxY()
    }


    get parent() : BarChart {
        return this.$parent as BarChart        
    }

    
    created() {
       
        this.w2sX = this.parent.w2sX
        this.w2sY = this.parent.w2sY
    }
}
