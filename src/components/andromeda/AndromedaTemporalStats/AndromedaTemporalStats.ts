import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import WeekAggregation from '../../WeekAggregation/WeekAggregation';

import WithRender from './AndromedaTemporalStats.html';




@WithRender
@Component({
    components: {
        WeekAggregation
    }
})
export default class AndromedaTemporalStats extends Vue {

    @Prop()
    attrName!: string
  
    @Prop()
    brokerBaseUrl!:string

    @Prop()
    entityId!: string
  

    stats:any = {}

    lastModifiedAt = ""

    created() {
        this.init()
    }


    async init() {
        const url = this.brokerBaseUrl + "/temporal/entities/" + this.entityId + "/attrs/" + this.attrName + "/stats"

        let res = await fetch(url)

        this.stats = await res.json()

        const date = new Date(this.stats.lastModifiedAt)
        
        this.lastModifiedAt =  date.toLocaleDateString() + ", " + date.toLocaleTimeString()
    }
  
}

