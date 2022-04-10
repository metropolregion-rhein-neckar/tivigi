import { getAttributeMetadata } from '@/andromedaUtil/andromedaUtil';
import { AndromedaTimeSeriesLoader } from '@/andromedaUtil/AndromedaTimeSeriesLoader';
import { Component, Prop, Vue } from 'vue-property-decorator';
import DashboardPanel from '../../DashboardPanel/DashboardPanel';
import ContinuousTimeSeriesChart from '../../charts/ContinuousTimeSeriesChart/ContinuousTimeSeriesChart';

import WithRender from './AndromedaContinuousTimeSeriesPanel.html';
import './AndromedaContinuousTimeSeriesPanel.scss'




@WithRender
@Component({
    components: {
        ContinuousTimeSeriesChart,
        DashboardPanel
    }
})
export default class AndromedaContinuousTimeSeriesPanel extends Vue {

    //#region Properties
    @Prop({ default: () => Array<string>() })
    attributes!: Array<string>

    @Prop()
    brokerBaseUrl!: string

    @Prop()
    startTime!: string

    @Prop()
    endTime!: string

    @Prop()
    title!: string

    @Prop()
    subtitle! : string
    //#endregion

    attrMeta: any = undefined

    loader = new AndromedaTimeSeriesLoader(this.brokerBaseUrl)


    getAttrLabel(attrKey: string): string {
        let result = "Undefined"

        
        const offset = attrKey.lastIndexOf("/")
        //const entityId = attrKey.substring(0, offset)
        const attrName = attrKey.substring(offset + 1)


        try {
            result = this.attrMeta[attrName].metadata.label
        }
        catch (e) {

        }

        return result
    }


    getEntityId(attrKey: string): string {
         
        const offset = attrKey.lastIndexOf("/")
        const entityId = attrKey.substring(0, offset)
        //const attrName = attrKey.substring(offset + 1)
      
        return entityId
    }


    async mounted() {    
       // this.attrMeta = await getAttributeMetadata(this.brokerBaseUrl)     
    }


    async onDataRequest(evt : any) {
   
        await this.loader.load(this.attributes, evt.left, evt.right)     
    }
}

