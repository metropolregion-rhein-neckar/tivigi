import { Component, Vue, Prop } from 'vue-property-decorator';

import WithRender from './SmartButton.html';
import "tivigi/src/components/SmartButton/SmartButton.scss"

@WithRender
@Component({})
export default class SmartButton extends Vue {

    //################## BEGIN Props ###################

    // ATTENTION: No default for 'set' and 'unset' must be defined! 
    // The behaviour is different based on whether these are set or not!
    @Prop()
    set: any

    @Prop()
    unset: any

    @Prop()
    value!: any
    //################## END Props ###################


    getChecked(): boolean {
        if (this.value && this.set) {
            return this.value == this.set
        }
        return false
    }


    getDisabled(): boolean {

        if (this.value == undefined) {
            return false
        }

        return (this.value == this.set) && (this.value == this.unset || this.unset == undefined)
    }


    getDynamicClass(): any {
        return {
            "Smartbutton": true,
            "Smartbutton--checked": (this.value != undefined) && (this.value == this.set)
        }
    }


    onClick(evt: MouseEvent) {


        if (!this.getChecked()) {
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
