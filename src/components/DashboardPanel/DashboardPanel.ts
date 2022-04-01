import { Component, Prop } from 'vue-property-decorator';
import AbstractSheet from '../AbstractSheet/AbstractSheet';

import WithRender from './DashboardPanel.html';
import './DashboardPanel.scss'



@WithRender
@Component({
    components: {
     
    }
})
export default class DashboardPanel extends AbstractSheet {

    //############### BEGIN Properties ###############


    @Prop()
    diffDisplayMode!: string
 

    @Prop()
    subtitle!: string

    @Prop()
    title!: string

    //############### END Properties ###############

    expanded = false
    showInfoPanel = false




    getDynamicClass() {
        return {
            "DashboardPanel": true,
            "DashboardPanel--expanded": this.expanded
        }
    }




    getInfoPanelTitle(): string {
        return `Informationen über "${this.title}"`
    }

}

