import { Component, Vue, Prop } from 'vue-property-decorator';

import WithRender from './Superbutton.html';

import './Superbutton.scss';

@WithRender
@Component({})
export default class Superbutton extends Vue {

    //################## BEGIN Props ###################
    @Prop()
    icon!: string

    @Prop()
    label!: string

    @Prop()
    set: any

    // NOTE: Although 'title' is a standard HTML attribute, we "catch" it as a property here in order to be able to pass the value
    // as a variable to other components. For example, this is used to display the title of the active item in the DropdownButton
    // component.

    // Also note that if an attribute is registered als a Vue.js prop, it does no longer fulfill its standard HTML function. This
    // means that in order to still have the default 'title' tooltip displayed, we need to "forward" it to the <button> element in the
    // SuperButton.html template.
    @Prop()
    title!: string

    @Prop()
    unset: any

    @Prop()
    value!: any
    //################## END Props ###################


    get altText(): string {
        let result = ""

        if (this.label != undefined) {
            result += this.label
        }

        if (this.checked) {
            result += " - aktiv"
        }

        return result
    }


    get checked(): boolean {
        if (this.value && this.set) {
            return this.value == this.set
        }
        return false
    }


    get disabled(): boolean {

        if (this.value == undefined) {
            return false
        }

        return (this.value == this.set) && (this.value == this.unset || this.unset == undefined)
    }


    get dynamicClass(): any {

        return {
            "Superbutton": true,
            "Button": true,
            "Input": true,
            "Button--active": (this.value != undefined) && (this.value == this.set)
        }
    }


    get hasState(): boolean {
        return this.value != undefined && (this.set != undefined || this.unset != undefined)
    }


    onClick(evt: MouseEvent) {

        if (!this.checked) {
            // If the button is not checked, fire input event (which *might* check it, if it has state):
            this.$emit('input', this.set)

        }
        else {
            // Otherwise, if possible, uncheck it.
            if (this.unset != undefined) {
                this.$emit('input', this.unset)
            }
        }

        // Finally, forward the click event to the parent for simple stateless actions:
        this.$emit('click', evt)
    }
}
