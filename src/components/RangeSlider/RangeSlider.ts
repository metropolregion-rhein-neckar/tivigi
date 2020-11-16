import { Component, Vue, Prop,Watch } from 'vue-property-decorator';

import WithRender from './RangeSlider.html';

import './RangeSlider.scss';

@WithRender
@Component({})
export default class RangeSlider extends Vue {

    
    @Prop({ default: 0 })
    value!: number

    @Prop({ default: 0 })
    min!:number

    @Prop({ default: 1 })
    max!:number


    @Prop({ default: 1 })
    step!:number

    @Prop( { default : ""})
    unit! : string
    
    mounted() {

    }
    onInput(evt : InputEvent) {

        

        if (evt.target != null) {
        
          
            let target = evt.target as HTMLInputElement
            var tooltipEvent = new CustomEvent('tooltip', { detail: target.value + " " + this.unit });
            window.dispatchEvent(tooltipEvent)

            this.$emit('input', parseFloat(target.value))
        }
    }

}
