import AbstractChartElement from 'tivigi/src/components/charts/AbstractChartElement/AbstractChartElement';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import WithRender from './Axis.html';


@WithRender
@Component({

    components: {

    }
})
export default class Axis extends AbstractChartElement {

   

    @Prop()
    labels!: Array<string>

    @Prop()
    length! : number

    @Prop()
    dir!: string

  
   
}
