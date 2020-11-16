import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import "../../directives/v-onresize"

import WithRender from './Toolbar.html';

// TODO: 4 Move size checker functionality into a mixin?

import './Toolbar.scss'


@WithRender
@Component({
    components: {}
})
export default class Toolbar extends Vue {

    height_minimized = 0
    height_normal = 0
   
    minimized = false

    get dynamicClass(): any {
      
        return {
            "Toolbar" : true,
            "minimized" : this.minimized
        }
    }
   

    // ATTENTION: This needs to be a normal function, NOT a computed property!
    height() : number {
        return (this.$el as HTMLElement).offsetHeight
    }


    findBestMode() {        

        if (this.minimized) {
            this.height_minimized = this.height()
        }
        else {
            this.height_normal = this.height()
        }

        this.minimized = !this.minimized
    }


    onResize() {        
        this.findBestMode()
    }


    updated() {

        if (this.minimized) {
            this.height_minimized = this.height()            
        }
        else {
            this.height_normal = this.height()
        }
        
        // NOTE: We use a factor of 1.5 here since for some reason, 
        // height_minimized is always smaller than height_normal in some browsers.
        this.minimized = this.height_minimized * 1.5 < this.height_normal
    }
}
