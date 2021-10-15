import { Component, Vue, Prop, Watch, PropSync } from 'vue-property-decorator';


import "./MultiSelect.scss"
import WithRender from './MultiSelect.html';


@WithRender
@Component({
    components: {}
})
export default class MultiSelect extends Vue {

    @Prop({default : ""})
    filterString!: string

    @Prop()
    labelFunc!: Function

    @Prop({ default: false })
    multiSelect!: Boolean

    @Prop()
    options!: Array<any>

    @Prop({ default: () => [] })
    selection!: Array<any>



    selected: Array<any> = this.selection

    @Watch("selection", {deep:true})
    onSelectionChange() {
        this.selected = this.selection
    }



    getDynamicClass(option: any): any {
        return {
            "MultiSelect__Option": true,
            "MultiSelect__Option--selected": this.selected.includes(option)
        }
    }

    getLabel(option : any) : string {

        return this.labelFunc ? this.labelFunc(option) : option
      
    }

    matches(option : any) : boolean {
        return this.getLabel(option).toLocaleLowerCase().includes(this.filterString.toLocaleLowerCase())
    }


    toggleSelect(entity: any) {

        if (this.multiSelect) {
            const index = this.selected.indexOf(entity);

            if (index > -1) {
                this.selected.splice(index, 1);
            }
            else {
                this.selected.push(entity)
            }            
        }
        else {
            this.selected = [entity]            
        }

        this.$emit("update:selection", this.selected)        
    }
}