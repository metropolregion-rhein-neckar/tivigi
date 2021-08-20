import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './ScrollSensor.html';


@WithRender
@Component({
    components: {}
})
export default class ScrollSensor extends Vue {

    @Prop()
    container!: HTMLElement

    @Prop({ default: false })
    value!: boolean


    pContainer : HTMLElement = this.container

    isInView = false

    get dynamicClass() : any {
        return {
            "ScrollSensor" : true,
            "ScrollSensor--active" : this.isInView
        }
    }

    @Watch('container')
    onContainerChange() {       
        this.init()
    }


    beforeDestroy() {
        this.pContainer.removeEventListener("scroll", this.onContainerScroll)
    }


    checkInView() {

        let bbox_container = this.pContainer.getBoundingClientRect()
        let bbox_element = this.$el.getBoundingClientRect()

        let container_center_y = bbox_container.top + bbox_container.height / 2

        this.isInView = bbox_element.bottom > container_center_y && bbox_element.top < container_center_y

        this.$emit("update:value", this.isInView)

    }


    init() {
        if (this.pContainer != null) {
            this.pContainer.removeEventListener("scroll", this.onContainerScroll)
        }

        this.pContainer = this.container

        if (this.pContainer == undefined) {
            this.pContainer = this.$el.parentElement!
        
        }

        
        this.pContainer.addEventListener("scroll", this.onContainerScroll)

        this.checkInView()
    }


    mounted() {
        this.init()
    }


    onContainerScroll(evt: Event) {
        this.checkInView()
    }

    onResize() {    
        this.checkInView()
    }

}


