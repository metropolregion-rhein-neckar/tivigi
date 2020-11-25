import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import WithRender from './FeatureListItem.html';
import './FeatureListItem.scss'

@WithRender
@Component({
    components: {}
})
export default class FeatureListItem extends Vue {

    @Prop({default:() => {return {}}})
    item!: any

    @Prop({default:() => {return ()=>{}}})
    urlFunc! : Function

    @Prop({default:() => {return ()=>{}}})
    labelFunc! : Function

    @Prop({default:() => {return ()=>{}}})
    titleFunc! : Function



    get p() : any {
        return this.item.getProperties()
    }

   

    
    getTitle() {
        return this.titleFunc(this.p)
    }


    getLabel() {
        return this.labelFunc(this.p)
    }


    getUrl() {
        return this.urlFunc(this.p)
    }
  
    

    onMouseOver(evt : MouseEvent) {
        this.item.set("hover", true)
       // this.item.changed()        
    }

    onMouseOut(evt : MouseEvent) {
        this.item.unset("hover")
        //this.item.changed()
    }
}
