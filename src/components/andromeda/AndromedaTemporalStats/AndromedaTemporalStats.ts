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
    brokerBaseUrl!: string

    @Prop()
    entityId!: string




    lastModifiedAt = ""

    created() {
        this.init()
    }


    async init() {
        const url = this.brokerBaseUrl + "/temporal/entities/" + this.entityId + "/attrs/" + this.attrName + "/stats"

        let res = await fetch(url)

        let stats = await res.json()

        if (stats.lastWrittenAt == null) {
            this.lastModifiedAt = "Zeitpunkt unbekannt"
        }
        else {
            const date = new Date(stats.lastWrittenAt)


            this.lastModifiedAt = date.toLocaleDateString() + ", " + date.toLocaleTimeString()
        }

    }

}

