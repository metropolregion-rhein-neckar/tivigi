import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import './Legend.scss'
import WithRender from './Legend.html';

@WithRender
@Component({ components: {} })
export default class Legend extends Vue {

    @Prop({
        default: () => {
            return {
                "Legend": undefined
            }
        }
    })    
    config: any



    getLineSymbolizerStyle(symbolizer: any) {

        let result = this.getSymbolizerStyle(symbolizer)

        result += "border-top-width:0;";
        result += "border-left-width:0;";
        result += "border-right-width:0;";
        result += "width:1.2em;height:0em;";

        return result
    }


    getPolygonSymbolizerStyle(symbolizer: any) {

        let result = this.getSymbolizerStyle(symbolizer);

        result += "width:1.2em;height:1.2em;";

        return result
    }

    getSymbolizerStyle(symbolizer: any) {

        let result = ""

        let borderWidth = 0

        if (symbolizer['stroke-width'] != undefined) {
            borderWidth = symbolizer['stroke-width']
        }

        result += "border-width:" + borderWidth + "px;";

        result += "border-color:" + symbolizer['stroke'] + ";";

        result += "border-style:solid;";
        result += "background-color:" + symbolizer['fill'] + ";"

        return result
    }


    getRuleLabel(rule: any) {

        if (rule.title != undefined) {
            return rule.title
        }

        if (rule.name != undefined) {
            return rule.name
        }

        return "Unbenannte Regel"
    }


}
