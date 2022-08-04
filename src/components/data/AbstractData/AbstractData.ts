import AbstractRenderlessComponent from 'tivigi/src/components/AbstractRenderlessComponent/AbstractRenderlessComponent';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

@Component({})
export default class AbstractData extends AbstractRenderlessComponent {

    @Prop()
    data!: any

  
}
