import { Component, Vue, Prop,Watch } from 'vue-property-decorator';

import WithRender from './RangeSlider.html';

import './RangeSlider.scss';

@WithRender
@Component({})
export default class RangeSlider extends Vue {

    //########### BEGIN Props ############
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
    //########### END Props ############
    

    onInput(evt : InputEvent) {

        if (evt.target != null) {
                  
            const target = evt.target as HTMLInputElement
            const tooltipEvent = new CustomEvent('tooltip', { detail: target.value + " " + this.unit });
            
            window.dispatchEvent(tooltipEvent)

            this.$emit('input', parseFloat(target.value))
        }
    }

}
