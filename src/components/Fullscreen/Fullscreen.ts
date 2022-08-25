import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import SmartButton from 'tivigi/src/components/SmartButton/SmartButton'
import WithRender from './Fullscreen.html';

import "./Fullscreen.scss"

const fullscreenClass = "a-v-fullscreen"
const hideClass = "a-v-fullscreen-force-display-none"

@WithRender
@Component({
    components: {
        SmartButton
    }
})
export default class Fullscreen extends Vue {

    @Prop({default:false})
    enabled!:boolean
   

    @Watch("enabled")
    toggle() {
        const allElems = document.getElementsByTagName("*")

        const fullscreenElem = this.$el as HTMLElement

        if (this.enabled) {

            //#region Hide all other elements by applying a class that sets "display:none"

            for (let ii = 0; ii < allElems.length; ii++) {

                const elem = allElems.item(ii)

                if (!(elem instanceof HTMLElement)) {
                    continue
                }

                if (elem.contains(fullscreenElem) || fullscreenElem.contains(elem)) {
                    continue
                }

                elem.classList.add(hideClass)
            }
            //#endregion Hide all other elements by applying a class that sets "display:none"

            fullscreenElem.classList.add(fullscreenClass)
        }
        else {

            fullscreenElem.classList.remove(fullscreenClass)

            //#region Restore display mode of all other elements

            for (let ii = 0; ii < allElems.length; ii++) {
                const elem = allElems.item(ii)

                if (!(elem instanceof HTMLElement)) {
                    continue
                }

                if (elem.contains(fullscreenElem) || fullscreenElem.contains(elem)) {
                    continue
                }

                elem.classList.remove(hideClass)
            }
            //#endregion Restore display mode of all other elements
        }
    }

}
