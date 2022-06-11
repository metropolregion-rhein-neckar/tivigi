import { Component, Vue } from 'vue-property-decorator';
import "tivigi/src/directives/v-onresize"
import "tivigi/src/directives/v-on-no-drag-click"



import ChartCanvas from '../ChartCanvas/ChartCanvas';
import { Vector2 } from 'tivigi/src/util/Vector2';

import WithRender from './AbstractChartElement.html';


@WithRender
@Component({
    components: {

    }
})
export default class AbstractChartElement extends Vue {

   

    get canvas() : ChartCanvas {
        return this.$parent as ChartCanvas
    }

    get scale(): Vector2 {
        return this.canvas.scale
    }




    onCanvasExtentChange() {

    }


    w2sx(value: number) {
        return this.canvas.w2sx(value)
    }


    w2sy(value: number) {
        return this.canvas.w2sy(value)
    }

}

