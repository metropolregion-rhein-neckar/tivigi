import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import Modal from '../Modal/Modal'
import Superbutton from '../Superbutton/Superbutton'
import PopupMenu from '../PopupMenu/PopupMenu'

import './DropdownMenu.scss'

import WithRender from './DropdownMenu.html';


@WithRender
@Component({
    components: {
        Modal,
        Superbutton,
        PopupMenu
    }
})
export default class DropdownMenu extends Vue {

    @Prop({ default: false })
    checked! : boolean

    @Prop({ default: "" })
    icon!: string

    @Prop({ default: () => { return "Menu" } })
    label!: String;

    show = false

    get dynamicClass(): any {

        return {
            "DropdownMenu__Button" : true,
            "Superbutton--checked" : this.checked
        }
    }

}
