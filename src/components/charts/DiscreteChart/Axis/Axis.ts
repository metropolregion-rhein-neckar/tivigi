import AbstractChartElement from '../AbstractChartElement/AbstractChartElement';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import WithRender from './Axis.html';


@WithRender
@Component({})
export default class Axis extends AbstractChartElement {

   

    @Prop()
    labels!: Array<string>

    @Prop()
    length! : number

    @Prop()
    dir!: string

  
    getYAxisClass(label : any) {
        let result: any = {
            "SvgChart__Axis__X--Zero" : label.pos == 0
        }
        return result
    }
}
