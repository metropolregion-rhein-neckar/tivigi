import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol'

import "./FeaturesByPropertyGroupTable.scss"
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
    onFeaturesChange(newData : Array<ol.Feature>, oldData: Array<ol.Feature>) {

        console.log(newData.length)
        const stats = []

        for(const feature of newData) {

            let propertyValue = feature.getProperties()[this.property]

            if (propertyValue == undefined) {
                //console.log("not defined")
            }

            let entry = undefined

            for (let e of stats) {
                if (e.code == propertyValue) {
                    entry = e
                    break
                }
            }

            // Create entry if it doesn't exist yet:
            if (entry == undefined) {
                entry = {
                    "code": propertyValue,
                    "sum": 0
                }

                stats.push(entry)
            }

            entry.sum += 1
        }    
        
      
        this.stats = stats.sort((a, b) => {
            return b.sum - a.sum
        })
      
        
    }
}
