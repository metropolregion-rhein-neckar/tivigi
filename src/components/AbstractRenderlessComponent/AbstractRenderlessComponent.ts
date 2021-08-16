import { Component, Vue, Prop, Watch } from 'vue-property-decorator';


import WithRender from './AbstractRenderlessComponent.html'

@WithRender
@Component({})
export default class AbstractRenderlessComponent extends Vue {

}
