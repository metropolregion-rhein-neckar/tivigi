import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './SliderSelect.html';

import './SliderSelect.scss';

@WithRender
@Component({})
export default class SliderSelect extends Vue {

    //################## BEGIN Props ###################
    @Prop({default: () => []})
    options! : Array<{label:string, value:any}>

    @Prop()
    value : any
    //################## END Props ###################

    index = 0

    @Watch("value")
    onValueChange(after : any, before : any) {
        this.updateIndex()
    }
  

    @Watch("options")
    onOptionsChange() {
        this.updateIndex()
    }

    
    @Watch("index")
    onIndexChange() {

        let entry = this.options[this.index]

        if (entry == undefined) {
            return
        }

        const value =  entry.value
        
        this.$emit("input", value)
    }


    getLabel() : string {
        if (this.options.length == 0) {
            return ""
        }
        return this.options[this.index].label
    }


    updateIndex() {
    
        for(let ii = 0; ii < this.options.length; ii++) {

            if (this.options[ii].value == this.value) {
                this.index = ii
                return
            }

        }

        this.index = 0

    }

}
