import { TableData } from './TableData';
import { FieldConfig, FieldTextAlign } from './FieldConfig';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import SmartTable from 'tivigi/src/components/SmartTable/SmartTable';
import WithRender from './TableView.html';


@WithRender
@Component({
    components: {
SmartTable
    }
})
export default class TableView extends Vue {

    @Prop()
    data!: TableData

    getDynamicStyle(field: FieldConfig): any {

        let result: any = {}

        switch (field.textAlign) {
            case FieldTextAlign.CENTER: {
                result["text-align"] = "center"
                break
            }
            case FieldTextAlign.RIGHT: {
                result["text-align"] = "right"
                break
            }
            case FieldTextAlign.LEFT: {
                result["text-align"] = "left"
                break
            }
        }

        return result
    }
}

