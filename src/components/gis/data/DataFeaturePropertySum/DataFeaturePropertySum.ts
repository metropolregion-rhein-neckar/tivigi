import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol'

import AbstractData from 'tivigi/src/components/data/AbstractData/AbstractData';

@Component({
    components: {}
})
export default class DataFeaturesInPolygon extends AbstractData {

    @Prop()
    features!: Array<ol.Feature>


    @Prop()
    property!: string


    @Watch("features")
    onFeaturesChange() {

        if (this.features == undefined) {
            return
        }
        
        let sum = 0

        for(let f of this.features) {
            let prop = f.getProperties()[this.property]

            if (prop == undefined) {
                continue
            }

            sum += prop
        }

        this.register(sum)
    }


    mounted() {

        // NOTE: 
        // Initial registration with an empty array is required to avoid an annoying reinstantiation 
        // of the parent component when updateClippedFeatures() is called for the first time.
        this.register(0)

        this.onFeaturesChange()
    }


}
