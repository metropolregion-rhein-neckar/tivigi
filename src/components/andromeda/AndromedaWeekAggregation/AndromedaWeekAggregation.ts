import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import WeekAggregation from '../../WeekAggregation/WeekAggregation';
import { AggregationMethod, AggregationPeriod, loadTimeSeries, TimeSeriesLoaderTask } from 'tivigi/src/andromedaUtil/andromedaTimeSeriesFunctions';
import * as fns from 'date-fns'
import { zeroPad } from 'tivigi/src/util/formatters';

import "./AndromedaWeekAggregation.scss"
import WithRender from './AndromedaWeekAggregation.html';




@WithRender
@Component({
    components: {
        WeekAggregation
    }
})
export default class AndromedaWeekAggregation extends Vue {

    //#region Props
    @Prop()
    brokerBaseUrl!: string

    @Prop()
    entityId!: string

    @Prop()
    attrName!: string

    @Prop()
    dateStart!: Date

    @Prop()
    dateEnd!: Date

    @Prop({default:false})
    invertColorRamp!: boolean

    //#endregion Props

    numDaysBack = 28

    data: any = null

    startDateString = ""
    endDateString = ""

    async created() {
        await this.init()
    }


    @Watch("entityId")
    @Watch("attrName")
    async init() {

        let tasks: Array<TimeSeriesLoaderTask> = [{
            entityId: this.entityId,
            attrs: [this.attrName],
            aggrMethod: AggregationMethod.avg,
            aggrPeriodDuration: AggregationPeriod.hour
        }]

        const dateEnd = new Date(Date.now())
        
        let dateStart

        if (this.numDaysBack == -1) {
            dateStart = new Date("0001-01-01T00:00:00Z")
        }
        else {
            dateStart = fns.subDays(dateEnd,this.numDaysBack)
        }

        

        

        

        const response = await loadTimeSeries(this.brokerBaseUrl, tasks, dateStart, dateEnd)

        this.data = response[this.entityId][this.attrName]

        if (!this.data) {
            console.error("Failed to load data")
            return
        }

       
        let ts = Object.keys(this.data)
        
        

        let startDate = new Date(parseInt(ts[0]))
        let endDate = new Date(parseInt(ts[ts.length - 1]))
        
        this.startDateString = `${zeroPad(startDate.getUTCDate(),2)}.${zeroPad(startDate.getUTCMonth() + 1,2)}.${startDate.getUTCFullYear()}`
        this.endDateString = `${zeroPad(endDate.getUTCDate(),2)}.${zeroPad(endDate.getUTCMonth() + 1,2)}.${endDate.getUTCFullYear()}`
      
      
    }

    @Watch("dateStart")
    @Watch("dateEnd")
    async onTimeFrameChange() {
        await this.init()
    }

    @Watch("numDaysBack")
    async onNumDaysBackChange() {
        
        await this.init()
    }
}

