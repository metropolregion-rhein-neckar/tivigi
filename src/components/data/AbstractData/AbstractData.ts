import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import WithRender from './AbstractData.html'

@WithRender
@Component({})
export default class AbstractData extends Vue {


    @Prop()
    name!: string;


    created() {

        //############# BEGIN Check if object with same name already exists. Don't overwrite ############

        const parent = this.$parent as any

        if (parent.local != undefined && parent.local[this.name] != undefined) {
            return
        }

        //############# END Check if object with same name already exists. Don't overwrite ############

        this.setup()
    }


    get(): any {
        const parent = this.$parent as any
        return parent.local[this.name]
    }


    setup() { }


    register(value: any) {

        // ATTENTION: 
        // Deleting the old object before writing the new one appears to be required for some things
        // to work correctly!! 
        // The check for 'undefined' is required as well in order to prevent an infinite re-render loop.
        //  sbecht 2020-08-16

        // Also note that Vue.set() triggers a rebuild of the parent's template output.
        // All children of the parent (i.e. this data component and all of its sibling components) are reinstantiated!

        let parent = this.$parent as any


        // If the variable already exists, don't re-register it as a reactive variable.
        // Just update it's value:

        if (!(this.name in parent.local)) {
            Vue.set(parent.local, this.name, value)
            return
        }


        parent.local[this.name] = value      
    }
}
