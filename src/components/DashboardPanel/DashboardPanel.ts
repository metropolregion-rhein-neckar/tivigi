import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import SidebarPanel from 'tivigi/src/components/SidebarPanel/SidebarPanel';
import Smartbutton from 'tivigi/src/components/SmartButton/SmartButton';


import WithRender from './DashboardPanel.html';
import './DashboardPanel.scss'



@WithRender
@Component({
    components: {
        SidebarPanel,
        Smartbutton,
    }
})
//export default class DashboardPanel extends AbstractSheet {
export default class DashboardPanel extends Vue {

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

