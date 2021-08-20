import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import AbstractRenderlessComponent from 'tivigi/src/components/AbstractRenderlessComponent/AbstractRenderlessComponent';
import { NgsiLdClient } from 'tivigi/src/util/NgsiLdClient';


@Component({})
export default class DataNgsiLdClient extends AbstractRenderlessComponent {

    //############ BEGIN Props ############
    @Prop()
    baseUrl!: string

    //############ END Props ############

    ngsi!: NgsiLdClient

    created() {
        this.ngsi = new NgsiLdClient(this.baseUrl)

        this.$emit("update:var", this.ngsi)
    }
}
