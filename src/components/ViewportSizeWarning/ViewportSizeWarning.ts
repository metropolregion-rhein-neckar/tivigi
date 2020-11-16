import { Component, Prop, Vue } from 'vue-property-decorator';

import './ViewportSizeWarning.scss'
import WithRender from './ViewportSizeWarning.html';


@WithRender
@Component({
    components: {
       
    },
})
export default class Panel extends Vue {

   
    display :boolean = true;


    get dynamicStyle(): string {

        if (!this.display) {
            return "display:none"
        }
        else {
            return ""
        }
    }

    mounted() {
        
        window.addEventListener("resize", this.onWindowResize)

        this.onWindowResize()
    }

    onOkayClick(evt : MouseEvent) {
     

        this.display = false;
    }

    onWindowResize() {
       

        if (window.innerWidth < 1300 || window.innerHeight < 600) {
            this.display = true
        }
        else {
            this.display = false
        }
    }

}



