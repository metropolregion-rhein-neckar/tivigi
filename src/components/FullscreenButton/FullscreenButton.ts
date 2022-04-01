import { Component, Vue, Prop } from 'vue-property-decorator';

import SmartButton from 'tivigi/src/components/SmartButton/SmartButton'
import WithRender from './FullscreenButton.html';


@WithRender
@Component({
    components: {
        SmartButton
    }
})
export default class FullscreenButton extends Vue {

    is_fullscreen : boolean = false

    get fullscreen() : boolean {
        return this.is_fullscreen
    }

    set fullscreen(newval) {
        if (this.fullscreen) {            
            document.exitFullscreen();
           
        }
        else { 
            
            document.body.requestFullscreen()

        }
    }

    
    beforeDestroy() {
        document.removeEventListener("fullscreenchange", this.onFullscreenChange)
    }


    mounted() {

        document.addEventListener("fullscreenchange", this.onFullscreenChange)

        this.is_fullscreen = document.fullscreenElement != null
    }


    onFullscreenChange(evt : Event) {
        this.is_fullscreen = (document.fullscreenElement != null)
    }

}
