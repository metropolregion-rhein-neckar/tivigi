import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol_layer from 'ol/layer'

import WithRender from './FeatureFilterDropdown.html';
import { FeatureLike } from 'ol/Feature';
import { getClusteredFeaturesRecursive } from 'tivigi/src/util/mapQueryUtil';
import { FilterableVectorSource } from 'tivigi/src/util/FilterableVectorSource';
import { Cluster } from 'ol/source';

@WithRender
@Component({
    components: {

    }
})
export default class FeatureFilterDropdown extends Vue {

    //################### BEGIN Props #################
    @Prop()
    layer!: ol_layer.Vector

    @Prop()
    property!: string

    @Prop()
    selection!: any

    //################### END Props #################


    filterValue: string | null = null

    @Watch('layer')
    onLayerChange() {
        let source = this.getSource()

        if (source == undefined) {
            return
        }

        source.on("change", () => {
            if (source instanceof FilterableVectorSource) {
                let bla = source.getFilter()[this.property]

                if (bla != undefined) {
                    this.filterValue = bla
                }
                else {
                this.filterValue = null
            }
            }

        })
    }


    @Watch("filterValue")
    onFilterValueChange() {

        let source = this.getSource()

        if (!(source instanceof FilterableVectorSource)) {
            console.log("No filter source")
            return
        }


        let filter = source.getFilter()

        if (filter == null) {
            filter = {}
        }

        filter[this.property] = this.filterValue

        source.setFilter(filter)
    }


    getSource() {
        if (this.layer == undefined) {
            return undefined
        }

        let source = this.layer.getSource()

        if (source instanceof Cluster) {
            source = source.getSource()
        }

        return source
    }


    getPropertyValues(): Array<any> {

        if (this.selection != undefined) {
            return this.selection
        }
        

        let result = Array<any>()
        let source = this.getSource()

        if (source == undefined) {
            return []
        }

        let features = Array<FeatureLike>()


        if (source instanceof FilterableVectorSource) {
            for (let f of source.getAllFeatures()) {
                features = features.concat(getClusteredFeaturesRecursive(f))
            }

        }
        else {
            features = source.getFeatures()
        }



        for (let f of features) {
            let props = f.getProperties()

            if (!(this.property in props)) {
                continue
            }

            let v = props[this.property]

            if (!result.includes(v)) {
                result.push(v)
            }
        }

        return result.sort()
    }
}
