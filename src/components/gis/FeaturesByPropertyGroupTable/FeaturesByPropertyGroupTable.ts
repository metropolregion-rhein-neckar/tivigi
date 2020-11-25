import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol'
import * as ol_layer from 'ol/layer'


import WithRender from './FeaturesByPropertyGroupTable.html';


@WithRender
@Component({
    components: {}
})
export default class FeaturesByPropertyGroupTable extends Vue {


    @Prop()
    property!: string

    @Prop()
    features! : Array<ol.Feature>

    
    stats: Array<any> = []

   

    get statsSorted(): Array<any> {
        return this.stats.sort((a, b) => {
            return b.sum - a.sum
        })
    }



    @Watch('features')
    onFeaturesChange() {

        this.stats = []

        for(let feature of this.features) {
            let propertyValue = feature.getProperties()[this.property]

            if (propertyValue == undefined) {
                console.log("not defined")
            }

            let entry = undefined

            for (let e of this.stats) {
                if (e.code == propertyValue) {
                    entry = e
                    break
                }
            }

            if (entry == undefined) {
                entry = {
                    "code": propertyValue,
                    "sum": 0
                }

                this.stats.push(entry)
            }

            entry.sum += 1
        }
                
          
    }
}
