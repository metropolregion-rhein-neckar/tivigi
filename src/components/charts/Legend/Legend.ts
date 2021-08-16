import AbstractChartElement from 'tivigi/src/components/charts/AbstractChartElement/AbstractChartElement';
import { ChartData, Dataset } from 'tivigi/src/components/charts/chartUtil';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './Legend.html';


@WithRender
@Component({})
export default class Legend extends AbstractChartElement {

    boxHeight = 15
    boxWidth = 15

    itemWidth = 250

    getStyle(dataset :Dataset) : any {
     
        let fillColor = "#000"

        if (dataset.style.color) {
            fillColor = dataset.style.color
        }

        return {
            fill : fillColor
        }
    }
}
