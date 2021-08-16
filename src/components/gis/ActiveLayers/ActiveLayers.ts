import { Component, Prop, Vue } from 'vue-property-decorator';

import * as ol from 'ol/'
import BaseLayer from 'ol/layer/Base'

import LayerControlPanel from '../LayerControlPanel/LayerControlPanel'

import WithRender from './ActiveLayers.html';


@WithRender
@Component({
    components: {
        LayerControlPanel
    },
})
export default class ActiveLayers extends Vue {

    //################# BEGIN Props #################
    @Prop()
    map!: ol.Map;

    // TODO: 3 Remove the ckanApiUrl prop!
    @Prop()
    ckanApiUrl!: string

    @Prop({ default: () => { return ["menu"] } })
    buttonsConfig! : Array<string>

    @Prop({ default: () => { return ["info", "attributes", "fit_extent", "remove"] } })
    menuConfig! : Array<string> 

    @Prop({default:true})
    attributesTableButton! : Boolean
    //################# END Props #################



    getLayers(): Array<BaseLayer> {

        let result = new Array<BaseLayer>()

        if (!(this.map instanceof ol.Map)) {
            return result
        }

        for (let layer of this.map.getLayers().getArray()) {


            let showLegend = true

            if (layer.get('showLegend') != undefined) {
                showLegend = layer.get('showLegend')               
            }

            if (showLegend) {
                result.push(layer)
            }          
        }

        function compare(a: BaseLayer, b: BaseLayer): number {
            return a.getZIndex() - b.getZIndex()
        }

        return result.sort(compare).reverse()
    }
}
