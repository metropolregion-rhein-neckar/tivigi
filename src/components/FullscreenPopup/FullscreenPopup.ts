import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import './FullscreenPopup.scss'

import WithRender from './FullscreenPopup.html';

@WithRender
@Component({
    components: {}
})
export default class FullscreenPopup extends Vue {

    
    @Prop({  })
    show!: boolean


    onCloseButtonClick() {        
        
        this.$emit('update:show', false)
    }
  
}
