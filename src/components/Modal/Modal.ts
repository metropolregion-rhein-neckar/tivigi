import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './Modal.html';

import './Modal.scss'

// TODO: 4 "allowOutsideInteraction" is not initialized correctly.

// TODO: 2 Accessibility improvement: 
// If outside interaction is blocked, prevent outside elements from being focused through e.g. keyboard input.

@WithRender
@Component({
    components: {

    }
})
export default class Modal extends Vue {

    //################ BEGIN Props ################
    @Prop({ default: () => { return true } })
    show!: boolean

    @Prop({ default: () => { return true } })
    autoCollapse!: boolean

    @Prop({ default: () => { return false } })
    allowOutsideInteraction!: boolean
    //################ END Props #################

    mouseDownPos = [0, 0]

    mouseDragCloseThreshold = 15

    pshow = this.show

    previouslyFocusedElement: Element | null = null    

    // ATTENTION:
    // For a very specific reason, we must implement the not-displaying of the Modal by using
    // a class. We can NOT use 'v-show' for this, and neither can we use a dynamic style.

    // The reason: 
    // Users should be able to specify a Modal's 'display' mode via the HTML 'style' attribute.
    // However, settings in the 'style' attribute always override Vue.js dynamic styles (using the ':style' attribute).

    // This means that we can not apply 'display:none' (i.e. not hide the Modal) through a Vue.js dynamic style 
    // if another value for 'display' is already defined in the static standard HTML "style" attribute.
    // This doesn't work even if we use '!important'.

    // However, at least with '!important', styles which are defined in classes *do* override styles defined in the
    // 'style' attribute. That's why we have to use this solution here.

    get dynamicClass(): any {

        return {
            "Modal": true,
            "Modal--display-none": !this.pshow
        }
    }


    @Watch('autoCollapse')
    onAutoCollapseChange() {

        if (this.pshow && this.autoCollapse) {
            window.addEventListener("keydown", this.onWindowKeyDown)
            window.addEventListener("mousedown", this.onWindowMouseDown)
            window.addEventListener("mouseup", this.onWindowMouseUp)
        }
        else {
            window.removeEventListener("keydown", this.onWindowKeyDown)
            window.removeEventListener("mousedown", this.onWindowMouseDown)
            window.removeEventListener("mouseup", this.onWindowMouseUp)
        }
    }


    @Watch('show')
    onShowChange() {
        this.pshow = this.show
    }


    @Watch('pshow')
    onPshowChange() {

        if (this.pshow) {

            this.focus()

            //########## BEGIN Block all interaction outside of the modal, if enabled ###########
            if (!this.allowOutsideInteraction) {

                // Make entire page ignore mouse events...
                document.body.style.pointerEvents = 'none';

                // ... except for the modal panel, by override:
                (this.$el as HTMLElement).style.pointerEvents = "all"
            }
            //########## END Block all interaction outside of the modal, if enabled ###########
        }
        else {

            // Re-enable mouse events for whole page:
            document.body.style.pointerEvents = "initial"

            if (this.previouslyFocusedElement instanceof HTMLElement) {
                this.previouslyFocusedElement.focus()
            }
        }

        this.onAutoCollapseChange()

        // ATTENTION:
        // Here, we delay the firing of the update event for the "show" prop by a little amount 
        // of time in order to solve the following problem: If the modal's show state is changed 
        // by a click outside of the modal, but at the same time, the same click immediately triggers a change of the show
        // state *to the contrary* (hiding if we want to show, or vice versa), then modal does not show or hide as desired,
        // because the action is overridden by the second handling of the click event. 
        // The delay caused by setTimeout() makes sure that the state change command which is given *here* "has the last word".
        setTimeout(() => { this.$emit('update:show', this.pshow) }, 0)
    }


    beforeDestroy() {
        // Close the modal before it is destroyed, so that all things are applied which should be
        // applied when the modal is closed:
        this.pshow = false
        
        // ATTENTION: Calling onPshowChange() manually before the component is destroyed is REQUIRED to prevent a UI freeze under
        // some cirumstances. Apparently, the 'Watch' which should call this method automatically when this.pshow is changed
        // (see above) does no longer work at this point. However, it is required to re-enable mouse interaction for
        // everything outside of the modal, if outside interaction was blocked.
        this.onPshowChange()
    }


    focus() {
        // Put focus on the Modal

        this.previouslyFocusedElement = document.activeElement

        // NOTE: The timeout is required as a workaround. Without it, focus setting does not work.
        window.setTimeout(() => { (this.$el as HTMLElement).focus() }, 0)
    }


    mounted() {
        this.pshow = this.show

        //this.modalDiv = this.$refs.modal as HTMLElement

        // Charge autocollapse:
        this.onAutoCollapseChange()

        // Register event handlers if modal is visible:
        this.onPshowChange()
    }


    onWindowMouseDown(evt: MouseEvent) {
        this.mouseDownPos = [evt.screenX, evt.screenY]
    }


    onWindowMouseUp(evt: MouseEvent) {

        if (!this.autoCollapse) {
            return
        }

        //######### BEGIN Don't close if mouse was moved too far between mousedown and mouseup (drag interaction) #######
        let a = evt.screenX - this.mouseDownPos[0]
        let b = evt.screenY - this.mouseDownPos[1]

        let diff = Math.sqrt(a * a + b * b)

        if (diff > this.mouseDragCloseThreshold) {
            return
        }
        //######### END Don't close if mouse was moved too far between mousedown and mouseup (drag interaction) #######


        // Go up the DOM tree, starting at the clicked element, until we arrive
        // either at the root (=> clicked element is *not* child of the modal element),
        // or at the modal element (=> clicked element *is* child of the modal element):

        let eventTarget: HTMLElement = evt.target as HTMLElement

        while (eventTarget != this.$el) {
            if (eventTarget.parentElement != null) {
                eventTarget = eventTarget.parentElement
            }
            else {
                break
            }
        }

        if (eventTarget != this.$el) {
            this.pshow = false
        }
    }


    onWindowKeyDown(evt: KeyboardEvent) {

        if (!this.autoCollapse) {
            return
        }

        if (evt.key === "Escape") {
            this.pshow = false
        }
    }
}
