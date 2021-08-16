import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './ScrollMenu.html';

import './ScrollMenu.scss';

@WithRender
@Component({})
export default class ScrollMenu extends Vue {

    //########### BEGIN Props ############
    @Prop()
    containerId!: string
    //########### END Props ############

    gceTimer = 0

    container: HTMLElement | null = null

    getContainerElement() {

        const elem = document.getElementById(this.containerId)

        if (!(elem instanceof HTMLElement)) {
            return
        }

        console.log("element is there!")
        window.clearInterval(this.gceTimer)

        this.container = elem

        for(let child of this.container.children) {
     
            if (child instanceof HTMLAnchorElement) {
             
                const label = child.getAttribute("data-scrollmenu-label")
                const id = child.getAttribute("id")

                if (id == null || label == null) {
                    continue
                }
                console.log(label)
            }
        }

    }

    mounted() {


        this.gceTimer = window.setInterval(this.getContainerElement, 250)
    }
}
