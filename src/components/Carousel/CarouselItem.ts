import { Component, Vue } from 'vue-property-decorator';
import Carousel from './Carousel';
import WithRender from './CarouselItem.html';
import "./CarouselItem.scss"

@WithRender
@Component
export default class CarouselItem extends Vue {




    onItemClick() {
        let parent = this.$parent as Carousel

        parent.setActiveItemIndex(parent.$children.indexOf(this))      
    }


    getClass() {
        let parent = this.$parent as Carousel

        let isActive = (parent.activeItemIndex == parent.$children.indexOf(this))

        return {
            "CarouselItem" : true,
            "CarouselItem--selected" : isActive
        }
    }

}
