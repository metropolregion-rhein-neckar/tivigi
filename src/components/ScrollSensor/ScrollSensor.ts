import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './ScrollSensor.html';


@WithRender
@Component({
    components: {}
})
export default class ScrollSensor extends Vue {

   

    @Prop({ default: false })
    value!: boolean


    container: HTMLElement|null = null

    isInView = false

    get dynamicClass(): any {
        return {
            "ScrollSensor": true,
            "ScrollSensor--active": this.isInView
        }
    }

    @Watch('containerId')
    onContainerChange() {
        this.init()
    }


    beforeDestroy() {
        if (this.container == null) {
            return
        }

        this.container.removeEventListener("scroll", this.onContainerScroll)
    }


    checkInView() {

        if (this.container == null) {
            return
        }

        let bbox_container = this.container.getBoundingClientRect()
        let bbox_element = this.$el.getBoundingClientRect()

        let container_center_y = bbox_container.top + bbox_container.height / 2

        const inViewNew = bbox_element.bottom > container_center_y && bbox_element.top < container_center_y

       // if (inViewNew != this.isInView) {
            this.isInView = inViewNew

            this.$emit("update:value", this.isInView)
        //}
    }


    init() {
        if (this.container != null) {
            this.container.removeEventListener("scroll", this.onContainerScroll, true)
        }


        let element = this.$el

        while(element.parentElement != null) {
            element = element.parentElement

            if (element.getAttribute("data-scroll-sensor-container") != null) {
             
                this.container = element as HTMLElement
                break

            }
        }

        if (this.container == null) {
            console.error("No scroll sensor container found")
            return
        }

      
        this.container.addEventListener("scroll", this.onContainerScroll)

        this.checkInView()
    }


    mounted() {
        this.init()
    }


    onContainerScroll(evt: Event) {     
        this.checkInView()

        return true
    }

    onResize() {
        this.checkInView()
    }

}


