import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import Slide from './Slide'

import WithRender from './Slideshow.html';
import "./Slideshow.scss"


@WithRender

@Component({
    components: {
      
        Slide
    }
})
export default class Slideshow extends Vue {

    slides = new Array<Slide>()

    activeSlide : Slide|null = null

    fullscreen = false


    get dynamicClass() : any {
        return {
            "Slideshow" : true,
            "Slideshow--fullscreen" : this.fullscreen,
            "Slideshow--non-fullscreen" : !this.fullscreen
        }
    }


    get dynamicStyle() : string {
        if (this.fullscreen) {
            return "cursor:default"
        }
        return ""
    }

    get dynamicTitle() : string {
        if (!this.fullscreen) {
            return "Slideshow in Vollbildmodus anzeigen"
        }

        return ""
    }


    mounted() {

        for(let child of this.$children) {
           
            if (child instanceof Slide){
            
                this.slides.push(child)
            }

            if (this.activeSlide == null && this.slides.length > 0) {

                this.activeSlide = this.slides[0]
            }
            
        }
      
    }


    onClick(evt : MouseEvent) {

        
        this.fullscreen = true
  
    }


    onFullscreenButtonClick(evt: MouseEvent) {
        this.fullscreen = false

    }


    onPrevButtonClick(evt: MouseEvent) {
        if (this.activeSlide == null) {
        
            return
        }

        let index = this.slides.indexOf(this.activeSlide)
        
        if (index > 0) {
            this.activeSlide = this.slides[index - 1]
        }
        else {
            this.activeSlide = this.slides[this.slides.length - 1]
        }


    }


    onNextButtonClick(evt: MouseEvent) {

        if (this.activeSlide == null) {
       
            return
        }

        let index = this.slides.indexOf(this.activeSlide)
        
        if (index >= 0 && index < this.slides.length - 1) {
            this.activeSlide = this.slides[index + 1]
        }
        else if (index == this.slides.length - 1) {
            this.activeSlide = this.slides[0]
        }

    }
}
