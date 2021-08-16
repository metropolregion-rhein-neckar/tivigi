import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import './Collapsible.scss'

import WithRender from './Collapsible.html';

@WithRender
@Component({
    components: {}
})
export default class Collapsible extends Vue {

    //################# BEGIN Props ###################
    @Prop({ default: () => { return "Aufklappbereich" } })
    title!: String;

    @Prop({ default: true })
    collapsed!: boolean

    @Prop({ default: false })
    exclusive!: boolean
    //################# END Props ###################


    pCollapsed = this.collapsed


    @Watch('collapsed')
    onCollapsedChange() {
        this.pCollapsed = this.collapsed
    }

    @Watch('pCollapsed')
    onPcollapsedChange() {

        if (!this.pCollapsed && this.exclusive) {

            for (let sibling of this.$parent.$children) {
                if (sibling instanceof Collapsible && sibling != this) {
                    sibling.pCollapsed = true
                }
            }
        }

        this.$emit('update:collapsed', this.pCollapsed)
    }

    
    get dynamicClass(): any {

        return {
            "Collapsible" : true,        
            "Collapsible--uncollapsed" : !this.pCollapsed         
        }
    }


    getCollapseButtonTitle() : string {
        if (this.pCollapsed) {
            return "Aufklappen"
        }

        return "Zuklappen"
    }

    onCollapseButtonClick() {
        this.pCollapsed = !this.pCollapsed
    }
}
