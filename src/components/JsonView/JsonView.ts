import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import './JsonView.scss'

import WithRender from './JsonView.html';

@WithRender
@Component({
    name: 'JsonView',
    components: {}
})
export default class JsonView extends Vue {

    @Prop()
    data: any

    @Prop()
    label!: string


    collapsed = false

    get dynamicClass(): any {
        return { 
            collapsible: this.isObject(this.data) ,
           // highlighted : this.highlighted
        }

    }


    charOpenElement(data:any) {

        if (this.isString(data)) {
            return '"'
        }

        if (data instanceof Array) {
            return "["
        }

        if (data instanceof Object) {
            return "{"
        }
        return ""
    }


    charCloseElement(data:any) {
        
        if (this.isString(data)) {
            return '"'
        }

        if (data instanceof Array) {
            return "]"
        }

        if (data instanceof Object) {
            return "}"
        }
        
        return "" 
    }


    isObject(obj: any): boolean {
        return (typeof obj === 'object' && obj !== null)
    }


    isString(obj: any): boolean {
        return (typeof obj === 'string' && obj !== null)
    }


    onLabelClick(evt: MouseEvent) {
        this.collapsed = !this.collapsed

        this.$emit("labelClick", this.data)
    }
}
