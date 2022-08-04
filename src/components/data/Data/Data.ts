import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import AbstractData from 'tivigi/src/components/data/AbstractData/AbstractData';


@Component({})
export default class Data extends AbstractData {

    @Prop()
    value: any


    mounted() {
        this.setup()
    }
    
    setup() {                   
        this.$emit("update:data", this.value)
    }
    
}
