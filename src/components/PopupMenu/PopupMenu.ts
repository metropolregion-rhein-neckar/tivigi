import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import Modal from 'tivigi/src/components/Modal/Modal'


import './PopupMenu.scss'
import WithRender from './PopupMenu.html';

@WithRender
@Component({
    components: {
        Modal        
    }
})
export default class PopupMenu extends Vue {


    @Prop({ default: true })
    closeOnClick!: boolean

    @Prop({ default: true })
    show!: boolean


    pshow = this.show

    @Watch('show')
    onShowChange() {
        this.pshow = this.show        
    }

    @Watch('pshow')
    onPshowChange() {        
        this.$emit('update:show', this.pshow)
    }


    onClick() {

        if (this.closeOnClick) {
            this.pshow = false           
        }
    }
}
