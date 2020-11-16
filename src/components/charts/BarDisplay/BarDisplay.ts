import { Component, Vue, Prop } from 'vue-property-decorator';
import WithRender from './BarDisplay.html';
import "./BarDisplay.scss"

@WithRender
@Component
export default class BarDisplay extends Vue {

    @Prop()
    value!: number
  
    @Prop()
    max!: number

    @Prop()
    min!: number


    get barWidthOffset() : number{

        if (this.value < 0) {
            return this.zeroPercent - this.barWidthPercent
        }

        return this.zeroPercent;        
    }

    get barWidthPercent(): number {        
        return (Math.abs(this.value) / this.range) * 100;
    }

    get range() : number {
        return Math.abs(this.max) + Math.abs(this.min)
    }

    get zeroPercent() : number {

        if (this.min >= 0) {
            return 0;
        }
        
        return (Math.abs(this.min) / this.range) * 100;
    }
}
