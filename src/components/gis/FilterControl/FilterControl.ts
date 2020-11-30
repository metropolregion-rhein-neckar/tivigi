import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import * as ol_layer from 'ol/layer'
import WithRender from './FilterControl.html';
import { FilterableVectorSource } from 'tivigi/src/util/FilterableVectorSource';
import { Cluster } from 'ol/source';


@WithRender
@Component({
    components: {}
})
export default class FilterControl extends Vue {

    @Prop()
    layer! : ol_layer.Vector


    onButtonClick() {
        let source = this.layer.getSource()

        if (source instanceof Cluster) {
            source = source.getSource()            
        }

        if (! (source instanceof FilterableVectorSource)) {
            console.log("No filterable source")
            return
        }

        source.setFilter({"land" : "Schweiz"})       
    }


    onButtonClick2() {
        let source = this.layer.getSource()

        if (source instanceof Cluster) {
            source = source.getSource()            
        }

        if (! (source instanceof FilterableVectorSource)) {
            console.log("No filterable source")
            return
        }

        source.setFilter({})    
    }
}
