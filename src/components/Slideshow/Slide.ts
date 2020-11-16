import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import WithRender from './Slide.html';
import "./Slide.scss"
import Slideshow from 'tivigi/src/components/Slideshow/Slideshow';

@WithRender
@Component
export default class Slide extends Vue {


    get dynamicClass() : string {
   
        if (!(this.$parent instanceof Slideshow)) {
            return ""
        }

        if (this.$parent.activeSlide == this) {
            return "Slide--active"
        }

        return ""
    }

}
