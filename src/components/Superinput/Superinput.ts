import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './Superinput.html';

import './Superinput.scss';

@WithRender
@Component({})
export default class Superinput extends Vue {

    //#region Props
    @Prop()
    cssClass : string|undefined

    @Prop()
    cssStyle : string|undefined

    @Prop()
    placeholder : string|undefined

    @Prop()
    value!: any    
    //#endregion Props

    

    pValue = ""

    
    @Watch('value')
    onValueChange() {
        this.pValue = this.value
    }


    @Watch('pValue')
    onPvalueChange() {        
        this.$emit('input',  this.pValue)
    }
  
    onBlur(evt : Event) {    
        this.$emit("blur", evt)
    }


    onClearButtonClick(evt : InputEvent) {
        evt.preventDefault()
        this.pValue = "";

        (this.$refs.input as HTMLInputElement).focus()
    }

    onInput(evt : InputEvent) {           
        this.pValue = (evt.target as HTMLInputElement).value        
    }

    onKeyUp(evt: KeyboardEvent) {
        if (evt.key === 'Enter') {
            this.$emit("enter", evt)
        }
    }
}
