import { Component } from 'vue-property-decorator';
import AbstractChartElement from '../../AbstractChartElement/AbstractChartElement';
import { Vector2 } from 'tivigi/src/util/Vector2';

import WithRender from './AbstractChart.html';
import { ChartLegendItem } from '../../ChartLegend/ChartLegendItem';

@WithRender
@Component({
    components: {

    }
})
export default class AbstractChart extends AbstractChartElement {

    getDisplayMax() : Vector2 {
        return new Vector2()
    }
   
    getDisplayMin() : Vector2 {
        return new Vector2()
    }


    getLegendData() : Array<ChartLegendItem> {

        return []

    }
}

