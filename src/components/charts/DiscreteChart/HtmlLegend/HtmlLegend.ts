import { ChartData, Dataset, getDatasetStyle } from '../chartUtil';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './HtmlLegend.html';
import "./HtmlLegend.scss"

@WithRender
@Component({})
export default class HtmlLegend extends Vue {


    @Prop()
    data! : ChartData

    getSymbolStyle(dataset :Dataset) : any {
     
        let fillColor = "#000"

        if (dataset.style.color) {
            fillColor = dataset.style.color
        }

        let result : any = {
        }

        result["background-color"] = fillColor
        
        return result
    }


   
    getDatasetStyle(dataset: Dataset, strokeWidth: number): any {
        return getDatasetStyle(dataset, strokeWidth, "#000")
    }
}
