import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import CarouselItem from './CarouselItem';
import WithRender from './Carousel.html';
import "./Carousel.scss"
import 'tivigi/src/directives/v-onresize'

@WithRender

@Component({
    components: {
        CarouselItem

    }
})
export default class Carousel extends Vue {


    @Prop({ default: 0 })
    selectedIndex!: number

    @Prop({ default: false })
    showNavDots!: boolean


    activeItemIndex = -1;

    animationHandle = -1

    innerPosX = 0

    targetInnerPosX = 0

    touchStartX = -1
    touchStartInnerPosX = -1

    prevTouchX = -1

    inertia = 23

    animationStep() {

        let tolerance = 1

        let outer = this.$refs.outer as HTMLDivElement

        let cx = outer.offsetWidth / 3

        let inner = this.$refs.inner as HTMLDivElement


        let diff = cx - (inner.offsetLeft + this.targetInnerPosX)

        if (Math.abs(diff) > tolerance) {

            let speed = Math.sqrt(Math.abs(diff))

            this.innerPosX += Math.sign(diff) * speed

            this.startAnimation()

        }
        else {
            this.innerPosX += diff
            window.cancelAnimationFrame(this.animationHandle)

        }

        this.innerPosX = Math.round(this.innerPosX)


        inner.style.left = this.innerPosX + "px"
    }


    getNumDots() {

        if (this.$children.length == 0) {
            return 0
        }

        let count = 0
        for (const child of this.$children) {
            if (!(child instanceof CarouselItem)) {
                continue
            }

            count++
        }

        return count - 1
    }


    getDotClass(index: number) {
        return {
            "Carousel__Dot--selected": index == this.activeItemIndex
        }
    }


    getItemCenter(itemIndex: number) {

        if (itemIndex < 0 || itemIndex > this.$children.length) {
            return -1
        }

        let activeChild = this.$children[itemIndex]

        if (activeChild == undefined) {
            return -1
        }

        let activeItemElement = activeChild.$el as HTMLDivElement

        return activeItemElement.offsetLeft + activeItemElement.offsetWidth / 2
    }


    getTouchPos(touch: Touch) {
        const svg = this.$refs.outer as HTMLDivElement
        const rect = svg.getBoundingClientRect();

        const x1 = touch.pageX - rect.left;
        const y1 = touch.pageY - rect.top;

        return x1
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

        // Required to display the navigation dots, because apparently, the children array is still empty
        // when getChildrenCount() is called to render the template for the first time:
        this.$forceUpdate()
    }


    onLeftButtonClick(evt: MouseEvent) {
        let outer = this.$refs.outer as HTMLDivElement
        this.setTargetPosX(this.targetInnerPosX - outer.offsetWidth / 3)
    }


    onOuterResize() {

        this.onResize()

    }


    onInnerResize() {

        this.onResize()

    }


    onResize() {

        if (this.selectedIndex != this.activeItemIndex) {
            this.setActiveItemIndex(this.selectedIndex)
        }
        const activeItemCenterX = this.getItemCenter(this.activeItemIndex)


        this.setTargetPosX(activeItemCenterX)
    }


    onRightButtonClick(evt: MouseEvent) {
        let outer = this.$refs.outer as HTMLDivElement
        this.setTargetPosX(this.targetInnerPosX + outer.offsetWidth / 3)
    }




    @Watch("selectedIndex")
    onSelectedIndexChange() {

      
      
        this.setActiveItemIndex(this.selectedIndex, false)

      

    }



    onTouchEnd(evt: TouchEvent) {

        if (this.prevTouchX == -1) {
            return
        }

        let diff = this.prevTouchX - this.touchStartX

        if (Math.abs(diff) > 0.5) {

            this.setTargetPosX(this.targetInnerPosX + diff * this.inertia)
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



    setActiveItemIndex(index: number, emit: boolean = true) {

        if (this.activeItemIndex == index) {
            return
        }
        
        this.activeItemIndex = index

        const activeItemCenterX = this.getItemCenter(this.activeItemIndex)

        this.setTargetPosX(activeItemCenterX)

        if (emit) {
            this.$emit("update:selectedIndex", this.activeItemIndex)
        }

    }


    setTargetPosX(value: number) {
        let outer = this.$refs.outer as HTMLDivElement
        let inner = this.$refs.inner as HTMLDivElement

        value = Math.max(value, 0)
        value = Math.min(value, inner.offsetWidth)

        this.targetInnerPosX = value
        this.startAnimation()
    }





    startAnimation() {
        window.cancelAnimationFrame(this.animationHandle)
        this.animationHandle = window.requestAnimationFrame(this.animationStep)
    }

}
