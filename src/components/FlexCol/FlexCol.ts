import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import WithRender from './FlexCol.html';
import './FlexCol.scss'

@WithRender
@Component({
    components: {}
})
export default class FlexCol extends Vue {

    // NOTE: 'subtree' needs to be set to 'true', because we need to observe changes of the children's style.display value.
    // TODO: 4 Perhaps we could achieve a slight performance improvement here if we attach separate observers to each
    // child element (to watch its style.display), but disable subtree watching.
  
    // ATTENTION: This is how it needs to be configured to work correctly in Edge Legacy:
    //config : MutationObserverInit = { attributes: true, childList: true, subtree: true, characterData:false };
    
    config : MutationObserverInit = { attributes: true, childList: true, subtree: true, characterData:false };

    observer = new MutationObserver(this.observerCallback);


    beforeDestroy() {

        this.observer.disconnect();
    }


    mounted() {

        this.updateVisibility()
      
        // Start observing the target node for configured mutations
        this.observer.observe(this.$el, this.config);
    }


    observerCallback(mutationsList: MutationRecord[], observer: MutationObserver) {    
       this.updateVisibility()
    }


    updateVisibility() {
        let count = 0
        
        for (let child of this.$el.childNodes) {
            
            if (!(child instanceof HTMLElement)) {
                continue
            }

            if (getComputedStyle(child).display == "none") {
                continue
            }

            count++           
        }

        let newStyle = (count == 0) ? "none" : ""

   
        if ((this.$el as HTMLElement).style.display != newStyle) {

            // ATTENTION: Here, we first need to disconnect the DOM observer before we change the style. This is because
            // changing the style would trigger another observer event, which would trigger another call of the callback
            // method (this code here), and so on, which might result in an infinite callback loop in some browsers.
            // While I haven't noticed actual problems in Firefox and Chome, it appears that Microsoft Edge Legacy
            // does indeed have problems with this (freezing of the application). So, to be on the safe side, we disable
            // the observer, then change the syle, and finally re-enable the observer again:

            // Disconnect observer:
            this.observer.disconnect();
            
            // Set style:
            (this.$el as HTMLElement).style.display = newStyle
            
            // Reconnect observer:
            this.observer.observe(this.$el, this.config);         
        }            
    }
}
