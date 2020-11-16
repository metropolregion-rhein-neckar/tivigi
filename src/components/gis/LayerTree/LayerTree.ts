import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import Tree from 'tivigi/src/components/Tree/Tree';
import DataJsonFetch from '../../data/DataJsonFetch/DataJsonFetch'
import DataLayerTree from '../data/DataLayerTree/DataLayerTree'
import * as ol from 'ol'


import WithRender from './LayerTree.html';


@WithRender
@Component({
    components: {
        DataJsonFetch,
        DataLayerTree,
        Tree
    },
})
export default class LayerTree extends Vue {

    //############# BEGIN Props #############
    @Prop({ default: true })
    highlightFilterMatches!: boolean

    @Prop()
    layerDef!: any

    @Prop()
    treeDef!: any

    @Prop()
    map!: ol.Map;

    @Prop({ default: false })
    showFilterInput!: boolean
    //############# END Props #############


    filter = ""
    local = {}
}
