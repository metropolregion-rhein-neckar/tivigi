import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import WithRender from './ListView.html';
import './ListView.scss'

@WithRender
@Component({
    components: {}
})
export default class ListView extends Vue {

    @Prop({default:() => {return []}})
    items!: Array<any>

    @Prop({default:10})
    limit! : number

    @Prop()
    view! : string
}
