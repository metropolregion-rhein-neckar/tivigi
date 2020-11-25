import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import WithRender from './List.html';


@WithRender
@Component({
    components: {}
})
export default class List extends Vue {

    @Prop({default:() => {return []}})
    items!: Array<any>

    @Prop({default:10})
    limit! : number
}
