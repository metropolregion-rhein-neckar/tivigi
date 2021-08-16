import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { FieldConfig } from '../TableView2/FieldConfig'

import './TableView.scss'
import WithRender from './TableView.html';
import anchorme from 'anchorme';


@WithRender
@Component
export default class TableView extends Vue {


    //################# BEGIN Props ##################
    @Prop({ default: () => { return [] } })
    data!: Array<any>

    @Prop({ default: () => { return Array<FieldConfig>() } })
    fieldsConfig!: Array<FieldConfig>

    @Prop()
    selectedRow!: any

    @Prop({ default: null })
    selectedCol!: FieldConfig | null

    @Prop()
    hoverRow!: any
    //################# END Props ##################


    sortAscending = -1

    // ATTENTION: The current sort field *must* be represented as its index in the fieldsConfig array.
    // Directly referencing a FieldConfig object does not work. In getSortIconStyle(), the passed field
    // (now an index) is compared to the current field (now an index too). This would not work with
    // FieldConfig objects. The entries of the fieldsConfig array are re-generated on each change of the
    // layer source. After a source change, a FieldConfig object which represents the current sort field
    // would no longer equal the "same" object in the new fieldsConfig array. Implementing an
    // "equals()" method wouldn't make much sense here. Working with an index is the easier and perhaps
    // also more reliable solution.
    
    
    currentSortFieldIndex = -1

    pData = this.data
    pHoverRow = this.hoverRow
    pSelectedRow = this.selectedRow



    @Watch('data')
    onDataChange() {

        this.pData = this.data

        if (this.currentSortFieldIndex != -1) {
            this.sortBy(this.fieldsConfig[this.currentSortFieldIndex])
        }
    }


    @Watch('hoverRow')
    onHoverRowChange() {
        if (this.pHoverRow == this.hoverRow) {
            return
        }

        this.pHoverRow = this.hoverRow
    }


    @Watch('selectedRow')
    onSelectedRowChange() {

        if (this.selectedRow == this.pSelectedRow) {
            return
        }

        console.log("selected row change")

        this.pSelectedRow = this.selectedRow

        // NOTE: It is required to use pData here. 'data' is not sorted!
        let index = this.pData.indexOf(this.selectedRow)

        let tbody = this.$refs.tbody as HTMLElement

        for (let child of tbody.getElementsByTagName("tr")) {
            let rowElem = child as HTMLTableRowElement

            let rowIndex = rowElem.getAttribute('data-rowindex')

            if (rowIndex == index.toString()) {
                rowElem.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                });
                break
            }
        }
    }


    formatCell(row: any, fc: FieldConfig) {

        let result = ""

        if (fc.display != undefined) {

            // ATTENTION: The try/catch block around the formatter call catches errors in the formatter. A typical formatter
            // error is that a formatter tries to access a non-existing member of a data row object. We could prevent or catch
            // such errors in the formatter functions themselves, but it is easier this way.

            try {
                result = fc.display(row)
            }
            catch (e) {
                console.log("Something went wrong in the formatter")
            }
        }
        else {
            result = row
        }

        let anchorme_options = {
            input: result,
            options: {
                attributes: {
                    target: "_blank"
                }
            }
        }

        return anchorme(anchorme_options)
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


    getDynamicColClass(fc: FieldConfig): any {
        return {
            "TableView__SelectedCol": fc == this.selectedCol
        }
    }


    getDynamicRowClass(row: any): any {

        return {
            "TableView__HoverRow": row == this.pHoverRow,
            "TableView__SelectedRow": row == this.selectedRow
        }
    }


    getHeaderCellTitle(fc: FieldConfig): string {

        let result = this.sortAscending == 1 ? "Aufsteigend" : "Absteigend"
        result += " nach '" + fc.label + "' sortieren"
        return result
    }


    onBodyCellClick(fc: FieldConfig, row: any) {
        this.$emit('update:selectedCol', fc)
    }


    onHeaderCellClick(index: number) {

        if (index == this.currentSortFieldIndex) {
            this.sortAscending = -this.sortAscending
        }

        this.$emit('update:selectedCol', this.fieldsConfig[index])

        this.currentSortFieldIndex = index
        this.sortBy(this.fieldsConfig[index])
    }


    onRowClick(row: any) {

        if (row == this.pSelectedRow) {
            return
        }

        this.pSelectedRow = row

        this.$emit("update:selectedRow", row)
    }


    onRowMouseOver(row: any) {
        if (row == this.pHoverRow) {
            return
        }

        this.pHoverRow = row

        this.$emit("update:hoverRow", this.pHoverRow)

    }


    onRowMouseOut(row: any) {
        this.pHoverRow = undefined

        this.$emit("update:hoverRow", this.pHoverRow)
    }


    sortBy(fc: FieldConfig) {

        // ATTENTION: We need to copy the original pData array here and do the sorting on the copy in order to
        // prevent an infinite change event trigger loop caused by the watcher function on 'data'. This likely happens
        // because 'data' points to the same array as 'pData', so a change of 'pData' means a change of 'data' as well.

        let sorted = this.pData.concat()

        sorted.sort((xa: any, xb: any) => {

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

        this.pData = sorted
    }
}
