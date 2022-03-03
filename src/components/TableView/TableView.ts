import { TableData } from './TableData';
import { FieldConfig, FieldTextAlign } from './FieldConfig';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './TableView.html';

import "./TableView.scss"

@WithRender
@Component({
    components: {

    }
})
export default class TableView extends Vue {

    @Prop()
    data!: { rows: Array<any>, fields: Array<FieldConfig> }


    sortAscending = -1
    currentSortFieldIndex = 0

    selectedRowIndex = -1

    selectedRow = undefined
   
    // ATTENTION: "displayData" is NOT the data block that is actually displayed, but a copy of the data passed
    // as the "data" prop, so that it can be re-ordered without changing the original data.
    displayData : TableData = { rows: Array<any>(), fields: Array<FieldConfig>() }



    @Watch("data", { deep: true })
    onDataChange() {

        this.displayData.fields = this.data.fields

        // Make a copy of the data:
        this.displayData.rows = []
        this.displayData.rows.push(... this.data.rows)

        // And sort it by the selected field:       
        this.sortBy(this.displayData.fields[this.currentSortFieldIndex])
    }

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

    getCellClass(field : FieldConfig, row : any) : any {
      
        return {         
         "TableView__ClickableCell" : typeof field.onClickHandler == "function"
        }
    }



    getRowClass(row : any) : any {
      
        return {         
         "TableView__SelectedRow" : this.selectedRow == row
        }
    }



    getSortIconStyle(index: number): any {

        let result: any = {}

        if (this.currentSortFieldIndex == index) {
            if (this.sortAscending == -1) {
                result.transform = "rotate(180deg)"
            }

            // NOTE: If sortAscending != -1, the returned object is empty, 
            // i.e. no special styles are assigned. This is correct.
        }
        else {
            result.visibility = "hidden"
            result.transition = "0s"
        }

        return result;
    }


    getButtonStyle(index : number) {

        
        let imageUrl = "tivigi/img/arrow_down2.svg"
        let size = 0

        if (this.currentSortFieldIndex == index) {

            imageUrl = "tivigi/img/arrow_down2.svg"
            size = 0.8

            if (this.sortAscending == -1) {
                
                imageUrl = "tivigi/img/arrow_up2.svg"
            }

            // NOTE: If sortAscending != -1, the returned object is empty, 
            // i.e. no special styles are assigned. This is correct.
        }


        return {
            "cursor" : "pointer",
            "background-image": `url(${imageUrl})`,
            "background-size": size + "em"
        }
    }

    created() {
        this.onDataChange()
    }


    onHeaderCellClick(index: number) {      

        if (index == this.currentSortFieldIndex) {
            this.sortAscending = -this.sortAscending
        }

        this.currentSortFieldIndex = index

        this.sortBy(this.data.fields[index])
    }

    onKeyPress(index : number, event : KeyboardEvent) {
        

        if (event.code == "Space" || event.code == "Enter") {
            this.onHeaderCellClick(index)
        }
    }

    onCellClick(field : FieldConfig, row: any) {

        
        
        if (typeof field.onClickHandler == "function") {

            field.onClickHandler(row)
        }
        
    }


    onRowClick(row : any) {
        this.selectedRow = row
        
        // Required:
        this.$forceUpdate()
    }




    sortBy(fc: FieldConfig) {

        //console.log("Sorting by " + fc.label)

        if (fc == undefined) {
            return
        }

        this.displayData.rows.sort((xa: any, xb: any) => {

            let a = fc.raw(xa)
            let b = fc.raw(xb)

            if (a == null) {
                a = ""
            }

            if (b == null) {
                b = ""
            }


            if (typeof a == 'number' && typeof b == 'number') {

                if (a < b) {
                    return this.sortAscending
                }
                else if (a > b) {
                    return -this.sortAscending
                }
                else {
                    return 0
                }
            }
            else {

                a = a.toString()
                b = b.toString()

                return a.localeCompare(b) * -this.sortAscending
            }
        });
    }
}

