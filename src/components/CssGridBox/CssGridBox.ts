import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import WithRender from './CssGridBox.html';
import "./CssGridBox.scss"

@WithRender
@Component({})
export default class CssGridBox extends Vue {

    
    onResize() {
        
        const parent = (this.$el as HTMLElement).parentElement

        if (parent == null) {
            return
        }

        const style = getComputedStyle(parent)

        const gridAutoRows_px = parseInt(style.gridAutoRows.replace("px", ""))
        const gridRowGap_px = parseInt(style.gridRowGap.replace("px", ""))
        
        const inner = this.$refs.inner as HTMLDivElement

        // NOTE: 
        // The gridRowGap_px added to *inner.offsetHeight* is the actual gap below the box.         
        // The gridRowGap_px added to *gridAutoRows_px* are the "imaginary" gaps between each stretch
        // of gridAutoRows_px pixels of height *within* the box.
        const rowspan = Math.ceil((inner.offsetHeight + gridRowGap_px) / (gridAutoRows_px + gridRowGap_px))

        const el = this.$el as HTMLDivElement

        el.style.gridRow = "span " + rowspan
    }
}
