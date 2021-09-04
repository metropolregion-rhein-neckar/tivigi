import { commonJSAvailable } from 'tivigi/node_modules/lzutf8';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './ScrollMenu.html';

@WithRender
@Component({})
export default class ScrollMenu extends Vue {

    //########### BEGIN Props ############
    @Prop()
    containerId!: string
    //########### END Props ############

    gceTimer = 0

    container: HTMLElement | null = null

    jumpLabels = Array<HTMLElement>()

    highlightIndex = -1

    
 

    get selectedLabel() {
        return this.jumpLabels[this.highlightIndex]
    }

    set selectedLabel(newval : HTMLElement) {
        
        if (newval == this.jumpLabels[this.highlightIndex]) {
            return
        }

        this.onEntryClick(newval)
    }


    getDynamicClass_label(index: number): any {
        let result = {
            "ScrollMenu__Button": true,
            "ScrollMenu__Button--Active": index == this.highlightIndex
        }

        return result
    }


    beforeDestroy() {
        if (this.container != null) {
            this.container.removeEventListener("scroll", this.onContainerScroll)
        }

        window.clearInterval(this.gceTimer)
    }


    getContainerElement() {

        const elem = document.getElementById(this.containerId)

        if (!(elem instanceof HTMLElement)) {
            return
        }


        window.clearInterval(this.gceTimer)

        this.container = elem

        this.jumpLabels = []

        let children = this.container.querySelectorAll("[data-jump-label]")

        for (let child of children) {
            const label = child.getAttribute("data-jump-label")
            this.jumpLabels.push(child as HTMLElement)
        }


        this.container.addEventListener("scroll", this.onContainerScroll, true)

       
        this.onContainerScroll()

    }


    mounted() {
        this.gceTimer = window.setInterval(this.getContainerElement, 100)
    }


    onContainerScroll() {
        
        
        if (this.container == null) {
            return
        }

        console.log("container scroll")
        

        let bbox_container = this.container.getBoundingClientRect()

        let index = 0

        for (const label of this.jumpLabels) {
            let bbox_element = label.getBoundingClientRect()

            let container_center_y = bbox_container.top + bbox_container.height / 2

            if (bbox_element.bottom > container_center_y && bbox_element.top < container_center_y) {
                this.highlightIndex = index
                break
            }

            index++
        } 

        console.log(this.highlightIndex)
        
        this.selectedLabel = this.jumpLabels[this.highlightIndex]   
        
        
    }


    onEntryClick(label: HTMLElement) {
        
        label.scrollIntoView({
          //  behavior: "smooth",
            block: 'center'         
        })
    }
}
