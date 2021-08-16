import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol_layer from 'ol/layer'
import WithRender from './FeatureFilterResetButton.html';
import { FilterableVectorSource } from 'tivigi/src/util/FilterableVectorSource';
import { Cluster } from 'ol/source';


@WithRender
@Component({
    components: {

    }
})
export default class FeatureFilterResetButton extends Vue {

    //################### BEGIN Props #################
    @Prop()
    layer!: ol_layer.Vector

    //################### END Props #################

    onClick() {

        let source = this.getSource()

        if (!(source instanceof FilterableVectorSource)) {
            console.log("No filter source")
            return
        }

        source.filterConfig = {}
        source.refresh()
    }



    getSource()  {
        let source = this.layer.getSource()

        if (source instanceof Cluster) {
            source = source.getSource()
        }

        return source
    }
}
