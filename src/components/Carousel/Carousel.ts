import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import CarouselItem from './CarouselItem';
import WithRender from './Carousel.html';
import "./Carousel.scss"
import { Vector2 } from 'tivigi/src/util/Vector2';


@WithRender

@Component({
    components: {
        CarouselItem

    }
})
export default class Carousel extends Vue {


    @Prop()
    selectedIndex! : number

    activeItemIndex = -1;

    animationHandle = 0

    innerPosX = 0

    targetInnerPosX = 0

    touchStartX = -1
    touchStartInnerPosX = -1

    prevTouchX = -1

    animationStep() {



        let tolerance = 1

        let outer = this.$el as HTMLDivElement

        let cx = outer.offsetWidth / 2

        let inner = this.$refs.inner as HTMLDivElement


        let diff = cx - (inner.offsetLeft + this.targetInnerPosX)

        if (Math.abs(diff) > tolerance) {

            let speed = Math.sqrt(Math.abs(diff))
            //speed = Math.max(speed, 1)
            this.innerPosX += Math.sign(diff) * speed

            //window.requestAnimationFrame(this.animationStep)
        }
        else {
            this.innerPosX += diff
            window.clearInterval(this.animationHandle)
        }

        this.innerPosX = Math.round(this.innerPosX)


        inner.style.left = this.innerPosX + "px"



    }



    mounted() {
        let el = this.$refs.outer as HTMLDivElement

        /*
        el.addEventListener("mousedown", this.onMouseDown)
        el.addEventListener("mousemove", this.onMouseMove)
        document.addEventListener("mouseup", this.onMouseUp)
        */
        el.addEventListener("touchstart", this.onTouchStart)
        el.addEventListener("touchmove", this.onTouchMove)
        el.addEventListener("touchend", this.onTouchEnd)
    }


    onLeftButtonClick(evt: MouseEvent) {
        let outer = this.$el as HTMLDivElement
        this.setTargetPosX(this.targetInnerPosX - outer.offsetWidth / 2)

        evt.stopImmediatePropagation()
        evt.stopPropagation()

    }



    onRightButtonClick(evt: MouseEvent) {
        let outer = this.$el as HTMLDivElement
        this.setTargetPosX(this.targetInnerPosX + outer.offsetWidth / 2)

        evt.stopImmediatePropagation()
        evt.stopPropagation()

    }

    onResize() {
        //  this.startAnimation()
    }


    /*
    onMouseDown(evt:MouseEvent) {

        this.touchStartX = evt.clientX

        this.prevTouchX = -1
    }

    onMouseMove(evt:MouseEvent) {

        if (this.touchStartX == -1) {
            return
        }


        let diff = this.touchStartX - evt.clientX


        this.setTargetPosX(this.targetInnerPosX + diff)

        // NOTE: prevTouchX is required for inertia-based scrolling after the touch has ended
        this.prevTouchX = this.touchStartX
        this.touchStartX = evt.clientX
    }

    onMouseUp(evt:MouseEvent) {

        this.touchStartX = -1
        
        return
        if (this.prevTouchX == -1) {
            return
        }

        let diff = this.prevTouchX - this.touchStartX

        if (Math.abs(diff) > 0.5) {
            
            this.setTargetPosX(this.targetInnerPosX + Math.sign(diff) * Math.abs(Math.sqrt(Math.abs(diff))) * 50)
        }
    }
    */

    onTouchEnd(evt: TouchEvent) {

        if (this.prevTouchX == -1) {
            return
        }

        let diff = this.prevTouchX - this.touchStartX

        if (Math.abs(diff) > 0.5) {
            
            this.setTargetPosX(this.targetInnerPosX + Math.sign(diff) * Math.abs(Math.sqrt(Math.abs(diff))) * 50)
        }
    }


    onTouchMove(evt: TouchEvent) {

        if (this.touchStartX == -1) {
            return
        }

        let touchx = this.getTouchPos(evt.touches[0])

        let diff = this.touchStartX - touchx


        this.setTargetPosX(this.targetInnerPosX + diff)

        // NOTE: prevTouchX is required for inertia-based scrolling after the touch has ended
        this.prevTouchX = this.touchStartX
        this.touchStartX = touchx
    }


    onTouchStart(evt: TouchEvent) {


        this.touchStartX = this.getTouchPos(evt.touches[0])

        this.prevTouchX = -1

    }





    getTouchPos(touch: Touch) {
        const svg = this.$refs.outer as HTMLDivElement
        const rect = svg.getBoundingClientRect();

        const x1 = touch.pageX - rect.left;
        const y1 = touch.pageY - rect.top;

        return x1


        //return new Vector2(x1, y1).sub(this.chartAreaPos)
    }


    setTargetPosX(value: number) {
        let outer = this.$el as HTMLDivElement
        let inner = this.$refs.inner as HTMLDivElement

        //value = Math.max(value, outer.offsetWidth / 2 - 100)
        //value = Math.min(value, inner.offsetWidth - (outer.offsetWidth / 2 - 100))

        value = Math.max(value, 0)
        value = Math.min(value, inner.offsetWidth)

        this.targetInnerPosX = value
        this.startAnimation()
    }


    setActiveItemIndex(index: number) {
        this.activeItemIndex = index


        if (this.activeItemIndex < 0 || this.activeItemIndex > this.$children.length) {
            return
        }

        let activeChild = this.$children[this.activeItemIndex]

        let activeItemElement = activeChild.$el as HTMLDivElement

        let activeItemCenterX = activeItemElement.offsetLeft + activeItemElement.offsetWidth / 2

        this.setTargetPosX(activeItemCenterX)

        this.$emit("update:selectedIndex", this.activeItemIndex)

    }


    startAnimation() {

        window.clearInterval(this.animationHandle)
        this.animationHandle = window.setInterval(this.animationStep, 10)

        //window.requestAnimationFrame(this.animationStep)
    }
}
