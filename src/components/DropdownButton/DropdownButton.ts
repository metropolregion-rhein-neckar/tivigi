import { Component, Prop, Vue } from 'vue-property-decorator';

import Superbutton from '../Superbutton/Superbutton'
import PopupMenu from '../PopupMenu/PopupMenu'

import './DropdownButton.scss'

import WithRender from './DropdownButton.html';

@WithRender
@Component({
    components: {
        Superbutton,
        PopupMenu
    }
})
export default class DropdownButton extends Vue {

    show = false

    activeChild: Superbutton | null = null


    get button_label(): string {

        if (this.activeChild != null) {
            return this.activeChild.label
        }

        return "Undefined"
    }


    get button_icon(): string {

        if (this.activeChild != null) {
            return this.activeChild.icon
        }

        return ""
    }

    get button_title(): string {
        if (this.activeChild != null) {
            return this.activeChild.title
        }

        return ""
    }

    get dynamicClass(): string {

        if (this.activeChild != null) {
            if (this.activeChild.checked) {
                return "Button--active"
            }
        }

        return ""
    }


    mounted() {

        this.$slots.default!.forEach(vNode => {

            if (vNode.componentInstance instanceof Superbutton) {

                if (this.activeChild == null) {
                    this.activeChild = vNode.componentInstance
                }

                vNode.componentInstance.$el.addEventListener('click', () => {
                    this.activeChild = vNode.componentInstance as Superbutton
                })
            }
        });
    }


    onShortcutButtonClick() {

        if (this.activeChild != null) {
            (this.activeChild.$el as HTMLElement).click()
        }
    }
}
