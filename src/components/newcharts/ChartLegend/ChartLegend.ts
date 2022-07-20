import { Component, Prop, Vue, Watch } from 'vue-property-decorator';


import "./ChartLegend.scss"
import WithRender from './ChartLegend.html';
import { ChartLegendItem } from './ChartLegendItem';



@WithRender
@Component({
    components: {

    }
})
export default class ChartLegend extends Vue {

    @Prop()
    data! : any

    getLabel(entry : ChartLegendItem) {

        if (entry.shortLabel) {
            return entry.shortLabel
        }
        else {
            return entry.label
        }
    }

    
    getStyle(entry:ChartLegendItem) : any {
        return {
            "backgroundColor" : entry.color
        }
    }

}


