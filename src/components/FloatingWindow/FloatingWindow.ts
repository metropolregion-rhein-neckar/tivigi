import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import Superbutton from '../Superbutton/Superbutton'

import WithRender from './FloatingWindow.html';
import './FloatingWindow.scss'

@WithRender
@Component({
    components: {
        Superbutton
    }
})
export default class FloatingWindow extends Vue {

    //############# BEGIN Props #############
    @Prop({ default: false })
    docked!: boolean

    @Prop({ default: true })
    show!: boolean

    @Prop({ default: true })
    centerTrigger!: boolean

    @Prop({ default: 600 })
    width!: number

    @Prop({ default: 400 })
    height!: number

    @Prop({ default: true })
    closeButton!: boolean

    @Prop({ default: true })
    dockButton!: boolean

    @Prop({ default: true })
    fullscreenButton!: boolean

    @Prop({ default: 'Untitled Window' })
    title!: String;
    //##################### END Props #######################


    //############ BEGIN Panel properties ###########
    mobile = false
    fullscreen = false


    pWidth = this.width
    pHeight = this.height

    posX = -1
    posY = -1

    pshow = this.show

    mpdocked = false

    //############ END Panel properties ###########

    cfg_resizeGrabTolerance = 7

    //############ BEGIN Operational support variables ###########    
    drag = false
    mouseDragOffsetX = 0
    mouseDragOffsetY = 0
    panelRef!: HTMLDivElement
    //############ END Operational support variables ###########

    resize_right = false
    resize_left = false
    resize_bottom = false
    resize_top = false



    get pdocked(): boolean {
        return this.mpdocked;
    }


    set pdocked(newval: boolean) {

        if (newval == this.mpdocked) {
            return
        }

        this.mpdocked = newval

        if (this.mpdocked) {
            this.fullscreen = false
        }

        this.updateDockedState()

        // Emit 'docked' update event:
        this.$emit('update:docked', this.mpdocked)
    }


    get dynamicClass_slot(): any {
        return {
            "FloatingWindow": true,
            "FloatingWindow--fullscreen": (this.mobile || this.fullscreen) && !this.pdocked,
            "FloatingWindow--undocked": !this.pdocked && !this.mobile && !this.fullscreen,
        }
    }


    get dynamicClass_socket(): any {

        return {
            'FloatingWindow__Socket': true,
            'FloatingWindow__Socket--hidden': (!this.pdocked || !this.show)
        }
    }


    get closeButtonLabel(): string {

        return "Panel schließen"
    }


    get dockButtonLabel(): string {
        if (this.pdocked) {
            return "Panel loslösen"
        }

        return "Panel andocken"
    }


    get fullscreenButtonLabel(): string {
        if (this.fullscreen) {
            return "Panel verkleinern"

        }

        return "Panel maximieren"
    }


    //############################## BEGIN Watchers ################################
    @Watch('centerTrigger')
    center() {

        let x = (document.body.offsetWidth - this.pWidth) / 2
        let y = (document.body.offsetHeight - this.pHeight) / 2

        this.setPosition(x, y)
    }


    @Watch('docked')
    onDockedChange() {
        this.pdocked = this.docked
    }


    @Watch('show')
    onShowChange() {
        this.pshow = this.show
    }


    @Watch('pshow')
    onPshowChange() {

        if (this.pshow) {
            this.bringToFront()
        }

        // Emit 'show' update event:
        this.$emit('update:show', this.pshow)
    }
    //################################# END Watchers #################################


    beforeDestroy() {

        if (this.panelRef.parentElement != null) {
            this.panelRef.parentElement.removeChild(this.panelRef)
        }

        window.removeEventListener("resize", this.onWindowResize)

        document.body.removeEventListener('mousemove', this.onBodyMouseMove)
        document.body.removeEventListener('mouseup', this.onBodyMouseUp)
    }


    bringToFront() {

        if (this.pdocked || !this.pshow) {
            return
        }

        // NOTE: Just removing the panelRef and re-attaching it to the body seems like the simplest solution,
        // but it doesn't work as expected. It does the right thing in terms of z-index, but for some reason,
        // it completelybreaks focus and focus-switching with the keyboard. So we have to keep the solution
        // below for now.

        //############### BEGIN Bring current window to front ################
        let otherDraggables = document.getElementsByClassName("FloatingWindow");

        let max = 0

        for (let other of otherDraggables) {
            let zInt = parseInt((other as HTMLElement).style.zIndex)
            if (!isNaN(zInt)) {
                max = Math.max(max, zInt)
            }
        }

        this.panelRef.style.zIndex = (max + 1).toString()
        //############### END Bring current window to front ################
    }


    dragStart(x: number, y: number, target: EventTarget): boolean {

        let node = target as any;

        let allowDrag = false

        //############## BEGIN Traverse from the clicked element down towards the DOM root ############
        while (node != null) {

            if (node.classList != undefined && node.classList.contains("drag-handle")) {
                allowDrag = true
            }

            if (node == this.$refs.panel) {
                this.bringToFront()

                if (allowDrag) {

                    let panel = this.$refs.panel as HTMLDivElement;

                    this.mouseDragOffsetX = x - panel.offsetLeft;
                    this.mouseDragOffsetY = y - panel.offsetTop;

                    this.drag = true
                }

                break;
            }

            node = node.parentNode
        }
        //############## END Traverse from the clicked element down towards the DOM root ############

        return allowDrag
    }


    mounted() {

        window.addEventListener("resize", this.onWindowResize)
        this.onWindowResize()

        // Detach panel from parent element and re-attach it to the HTML body element. 
        // This is required to achieve proper overlapping / z-index management.
        this.panelRef = this.$refs.panel as HTMLDivElement;

        document.body.addEventListener('mousemove', this.onBodyMouseMove)
        document.body.addEventListener('mouseup', this.onBodyMouseUp)



        this.pdocked = this.docked

        this.updateDockedState()
    }


    onPanelMouseDown(evt: MouseEvent) {

        if (evt.target == null || this.pdocked) {
            return
        }


        let x = Math.min(Math.max(0, evt.clientX), window.innerWidth)
        let y = Math.min(Math.max(0, evt.clientY), window.innerHeight)

        let dragging = this.dragStart(x, y, evt.target)

        if (!dragging) {

            let bbox = this.panelRef.getBoundingClientRect()

            if (x >= bbox.left && x <= bbox.right && y >= bbox.top && y <= bbox.bottom) {

                let right = Math.abs(bbox.right - x)
                let left = Math.abs(x - bbox.left)
                let bottom = Math.abs(bbox.bottom - y)
                let top = y - Math.abs(bbox.top)


                if (right < this.cfg_resizeGrabTolerance) {
                    this.resize_right = true
                }
                else if (left < this.cfg_resizeGrabTolerance) {
                    this.resize_left = true
                }


                if (bottom < this.cfg_resizeGrabTolerance) {
                    this.resize_bottom = true
                }
                else if (top < this.cfg_resizeGrabTolerance) {
                    this.resize_top = true
                }
            }
        }
    }


    onBodyMouseMove(evt: MouseEvent) {

        // Don't handle mouse move events for docked or hidden panels:
        if (this.pdocked || !this.pshow) {
            return
        }

        let x = Math.min(Math.max(0, evt.clientX), window.innerWidth)
        let y = Math.min(Math.max(0, evt.clientY), window.innerHeight)


        // End dragging if no mouse button is pressed any more:
        if (evt.buttons == 0) {
            this.drag = false
        }

        if (this.drag) {
            this.setPosition(x - this.mouseDragOffsetX, y - this.mouseDragOffsetY)
        }
        else {

            if (!this.fullscreen && !this.mobile) {
                let bbox = this.panelRef.getBoundingClientRect()


                this.panelRef.classList.remove("cursor-ew-resize")
                this.panelRef.classList.remove("cursor-ns-resize")
                this.panelRef.classList.remove("cursor-nw-resize")
                this.panelRef.classList.remove("cursor-ne-resize")
                this.panelRef.classList.remove("cursor-sw-resize")
                this.panelRef.classList.remove("cursor-se-resize")


                let right = Math.abs(bbox.right - x)
                let left = Math.abs(x - bbox.left)
                let bottom = Math.abs(bbox.bottom - y)
                let top = y - Math.abs(bbox.top)


                let dright = right < this.cfg_resizeGrabTolerance
                let dleft = left < this.cfg_resizeGrabTolerance
                let dbottom = bottom < this.cfg_resizeGrabTolerance
                let dtop = top < this.cfg_resizeGrabTolerance

                if (dright && dtop) {
                    this.panelRef.classList.add("cursor-ne-resize")
                }
                else if (dright && dbottom) {
                    this.panelRef.classList.add("cursor-se-resize")
                }

                else if (dleft && dtop) {
                    this.panelRef.classList.add("cursor-nw-resize")
                }
                else if (dleft && dbottom) {
                    this.panelRef.classList.add("cursor-sw-resize")
                }

                else if (dleft) {
                    this.panelRef.classList.add("cursor-ew-resize")
                }
                else if (dright) {
                    this.panelRef.classList.add("cursor-ew-resize")
                }

                else if (dtop) {
                    this.panelRef.classList.add("cursor-ns-resize")
                }
                else if (dbottom) {
                    this.panelRef.classList.add("cursor-ns-resize")
                }


                if (this.resize_right) {
                    let width = x - bbox.left

                    this.setSize(width, this.pHeight)
                }
                else if (this.resize_left) {

                    let width = bbox.right - x

                    if (this.setSize(width, this.pHeight)) {
                        this.setPosition(x, this.posY)
                    }
                }

                if (this.resize_bottom) {

                    let height = y - bbox.top

                    this.setSize(this.pWidth, height)

                }
                else if (this.resize_top) {

                    let height = bbox.bottom - y

                    if (this.setSize(this.pWidth, height)) {
                        this.setPosition(this.posX, y)
                    }
                }
            }
        }
    }


    onBodyMouseUp(evt: MouseEvent) {
        this.resize_right = false
        this.resize_left = false
        this.resize_top = false
        this.resize_bottom = false
    }


    onBodyTouchEnd(evt: TouchEvent) {

        if (this.pdocked) return

        this.drag = false

        window.removeEventListener('touchmove', this.onBodyTouchMove)
        window.removeEventListener('touchend', this.onBodyTouchEnd)
    }


    onBodyTouchMove(evt: TouchEvent) {

        if (this.pdocked || !this.drag) {
            return
        }

        this.setPosition(evt.touches[0].clientX - this.mouseDragOffsetX, evt.touches[0].clientY - this.mouseDragOffsetY)
    }




    onCloseButtonClick(evt: MouseEvent) {
        this.pshow = false
        this.$emit('closeButtonClick')
    }



    onTouchStart(evt: TouchEvent) {

        if (evt.target == null || this.pdocked) {
            return
        }

        window.addEventListener('touchmove', this.onBodyTouchMove)
        window.addEventListener('touchend', this.onBodyTouchEnd)

        this.dragStart(evt.touches[0].clientX, evt.touches[0].clientY, evt.target)
    }


    onFocus(evt: FocusEvent) {
        if (this.pdocked) return

        this.bringToFront()

        this.panelRef.addEventListener("keydown", this.onKeyDown)
    }


    onFocusOut(evt: FocusEvent) {
        if (this.pdocked) return

        this.panelRef.removeEventListener("keydown", this.onKeyDown)
    }


    onKeyDown(evt: KeyboardEvent) {

        if (this.pdocked) {
            return
        }

        let movePixels = 15

        switch (evt.key) {
            case 'ArrowLeft': {
                this.setPosition(this.posX - movePixels, this.posY)
                break;
            }
            case 'ArrowRight': {
                this.setPosition(this.posX + movePixels, this.posY)
                break;
            }
            case 'ArrowUp': {
                this.setPosition(this.posX, this.posY - movePixels)
                break;
            }
            case 'ArrowDown': {
                this.setPosition(this.posX, this.posY + movePixels)
                break;
            }
            case 'd': {
                this.pdocked = true
                break;
            }
            case 'Escape': {
                this.pshow = false
                break;
            }
        }
    }



    onWindowResize() {
        this.mobile = document.documentElement.offsetWidth < 800
    }


    setPosition(newX: number, newY: number) {

        let panel = this.panelRef

        //################ BEGIN Keep Draggable within viewport borders ###############
        /*
        if (newX < 0) {
            newX = 0
        }
        if (newX + panel.offsetWidth > document.body.offsetWidth) {
            newX = document.body.offsetWidth - panel.offsetWidth
        }
        */
        if (newY < 0) {
            newY = 0
        }
        /*
        if (newY + panel.offsetHeight > document.body.offsetHeight) {
            newY = document.body.offsetHeight - panel.offsetHeight
        }
        */
        //################ END Keep Draggable within viewport borders ###############     

        this.posX = newX
        this.posY = newY

        panel.style.left = newX + "px"
        panel.style.top = newY + "px"
        panel.style.right = ""
        panel.style.bottom = ""
    }


    setSize(width: number, height: number) {

        let result = true

        if (width < 200) {
            return false
            width = 200
            result = false
        }

        if (height < 200) {
            return false
            height = 200
            result = false
        }

        this.pWidth = width
        this.pHeight = height

        this.panelRef.style.width = width + "px"
        this.panelRef.style.height = height + "px"

        return result
    }


    updateDockedState() {

        let panel = this.panelRef

        if (!this.pdocked) {

            // Make panel focusable:
            panel.setAttribute("tabindex", "0")

            // Detach element from its socket (happens automatically) and re-attach it to the <body> element:
            document.body.appendChild(this.panelRef)

            this.setSize(this.pWidth, this.pHeight)

            if (this.posX == -1) {
                this.center()
            }
            else {
                this.setPosition(this.posX, this.posY)
            }

            this.panelRef.focus()

        }
        else {

            // Make panel non-focusable:
            panel.removeAttribute("tabindex")

            // Reset panel position, size other CSS attributes to defaults so that the
            // panel flows with the layout again:
            panel.style.left = ""
            panel.style.top = ""
            panel.style.width = ""
            panel.style.height = ""
            panel.style.right = ""
            panel.style.bottom = "";
            panel.style.zIndex = "";

            // Re-attach panel to socket:
            this.$el.appendChild(this.panelRef)
        }
    }
}
