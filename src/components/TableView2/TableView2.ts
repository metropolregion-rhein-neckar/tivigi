import { TableData } from 'tivigi/src/components/TableView2/TableData';
import { FieldConfig, FieldTextAlign } from 'tivigi/src/components/TableView2/FieldConfig';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import WithRender from './TableView2.html';

import "./TableView2.scss"

@WithRender
@Component({
    components: {

    }
})
export default class TableView2 extends Vue {

    @Prop()
    data!: { rows: Array<any>, fields: Array<FieldConfig> }


    c = document.createElement("canvas")
    ctx = this.c.getContext("2d") as CanvasRenderingContext2D;


    startRowIndex = 0
    numDisplayedRows = 15

    maxWidthRow: Array<string> = []


    sortAscending = -1
    currentSortFieldIndex = 0


   
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

        this.updateMaxWidthRow()

        // ATTENTION: This is required to make sure that the scrollbar is updated properly under all circumstances:
        window.setTimeout(() => {this.$forceUpdate()},0)
    
    }


    getInnerDynamicStyle(): any {
     
        let tbody = this.$refs.tbody as HTMLElement

        if (tbody == undefined) {
       
            return {}
        }

     
        //  console.log(averageRowHeight)
        let numRows = this.prepareData().length

        let averageRowHeight = tbody.offsetHeight / numRows


        let height = Math.max(0, (this.displayData.rows.length - numRows)) * averageRowHeight
   
        if (!Number.isFinite(height) || height == 0) {
            return {
                "display" : "none"
            }
        }
     
        return {    
            "height": height + "px"
        }
    }


    getHeaderButtonStyle(field: FieldConfig): any {

        let result: any = {}

        return result
        
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


    onHeaderCellClick(index: number) {

        if (index == this.currentSortFieldIndex) {
            this.sortAscending = -this.sortAscending
        }

        this.currentSortFieldIndex = index

        this.sortBy(this.data.fields[index])
    }


    onScroll(evt: WheelEvent) {

        let outer = this.$refs.outer as HTMLDivElement
        let inner = this.$refs.inner as HTMLDivElement
        let table = this.$refs.table as HTMLTableElement


        if (inner == undefined) {
            return
        }

        let pos = 0
        if (inner.offsetHeight > 0) {
            pos = outer.scrollTop / inner.offsetHeight    
        }
        
        let numRows = this.prepareData().length
        numRows = this.numDisplayedRows

        let index = Math.round((this.displayData.rows.length - numRows) * pos)

        index = Math.min(index, this.displayData.rows.length - numRows)
        index = Math.max(0, index)

     
        this.startRowIndex = index
    }


    onResize() {
        
        let outer = this.$refs.outer as HTMLDivElement

        let table = this.$refs.table as HTMLTableElement

        let height = table.offsetHeight + 1
        
        outer.style.height = height + "px"
    }



    prepareData(): Array<any> {

        let result = []

        if (this.displayData != undefined) {
            result = this.displayData.rows.slice(this.startRowIndex, this.startRowIndex + this.numDisplayedRows)
        }

        return result
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



    updateMaxWidthRow() {

        this.maxWidthRow = []

        // TODO: 2 Don't hard-code font
        this.ctx.font = "15px Lato";

        for (const field of this.displayData.fields) {

            let maxwidth = 0
            let widestColumnValue = "-"


            let str = field.label
            let measure = this.ctx.measureText(field.label)

            if (measure != undefined) {
                const width = measure.width
                if (width > maxwidth) {
                    widestColumnValue = str
                    maxwidth = width
                }
            }
            else {
                console.log("Failed to measure: " + str)
            }



            for (const row of this.displayData.rows) {


                let str = field.display(row)

                if (str == undefined) {
                    continue
                }

                const width = this.ctx.measureText(str).width

                if (width > maxwidth) {

                    widestColumnValue = str
                    maxwidth = width
                }
            }

            this.maxWidthRow.push(widestColumnValue)
        }
    }




}
