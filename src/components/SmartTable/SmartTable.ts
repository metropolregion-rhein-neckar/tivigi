// TODO: Implement keyboard control

import { Component, Prop, Vue } from 'vue-property-decorator';

import "./SmartTable.scss"
import WithRender from './SmartTable.html';


const className_ascending = "SmartTable__HeaderCell--ascending"
const className_descending = "SmartTable__HeaderCell--descending"
const className_selectedRow = "SmartTable__Row--selected"

@WithRender
@Component({
    components: {
    }
})
export default class SmartTable extends Vue {

    @Prop()
    selected!:any


    selectedRowIndex = -1
    sortColIndex = -1
    sortDir = 1


    mounted() {

        this.prepare()

        // create a new instance of 'MutationObserver' named 'observer', 
        // passing it a callback function


        // identify an element to observe
        
        let el = this.$refs.table as HTMLTableElement

        if (el != undefined) {

            let observer = new MutationObserver((mutationsList, observer) => {                
                  this.prepare()
            });

            observer.observe(el, { characterData: true, childList: true, attributes: true, subtree: true })
        }
        

    }

    getTableBody(): HTMLElement | null {

        const bs = this.$refs.table as HTMLTableElement

        if (bs == undefined) {
            console.log("tbody not found")
            return null
        }

        return bs.getElementsByTagName("tbody").item(0)

    }


    getHeaderRow(): HTMLElement | null {

        const bs = this.$refs.table as HTMLTableElement

        if (bs == undefined) {
            console.log("thead not found")
            return null
        }

        const thead = bs.getElementsByTagName("thead").item(0)

        if (thead == null) {
            return null
        }

        return thead.getElementsByTagName("tr").item(0)
    }


    getElementIndex(elem: Element) {
        let parent = elem.parentElement

        if (parent == null) {
            return -1
        }
        return Array.prototype.indexOf.call(parent.children, elem);
    }


    onHeaderCellClick(evt: Event) {

        let target = evt.currentTarget as Element

        if (target == null) {
            return
        }
    
        this.sort(this.getElementIndex(target))
    }


    onRowClick(evt: Event) {        
        let target = evt.currentTarget as Element

        if (target == null) {
            return
        }        

        this.selectedRowIndex = this.getElementIndex(target)


        this.updateRowStyles()        
    }


    prepare() {

        const headrow = this.getHeaderRow()

        if (headrow != null) {

            for (let ii = 0; ii < headrow.children.length; ii++) {
                const cell = headrow.children.item(ii) as Element

                cell.addEventListener("click", this.onHeaderCellClick)
            }
        }
        else {
            console.log("SmartTable: <thead> not found. No sorting function is added.")            
        }


        const tbody = this.getTableBody()

        if (tbody != null) {
            

            for (let ii = 0; ii < tbody.children.length; ii++) {
                const row = tbody.children.item(ii) as Element

                row.addEventListener("click", this.onRowClick)
            }
        }
        else {
            console.log("SmartTable: <tbody> not found. No sorting function is added.")            
        }
    }


    rowSortFunc(a: any, b: any) {

        const cellA = a.children.item(this.sortColIndex)
        const cellB = b.children.item(this.sortColIndex)


        if (cellA == undefined || cellB == undefined) {
            return 0
        }

        let v1: any = cellA.getAttribute("data-cell-value")

        if (v1 == null) {
            v1 = cellA.innerHTML
        }

        let v2: any = cellB.getAttribute("data-cell-value")

        if (v2 == null) {
            v2 = cellB.innerHTML
        }

        let n1 = parseFloat(v1)
        let n2 = parseFloat(v2)

        if (!isNaN(n1)) {
            v1 = n1
        }
        if (!isNaN(n2)) {
            v2 = n2
        }


        if (v1 < v2) {
            return -1 * this.sortDir
        }
        else if (v1 > v2) {
            return 1 * this.sortDir
        }

        return 0
    }


    sort(sortColIndex: number) {

        if (sortColIndex == this.sortColIndex) {
            this.sortDir = -this.sortDir
        }
        else {
            this.sortColIndex = sortColIndex
        }



        const headrow = this.getHeaderRow()

        if (headrow == null) {
            return
        }

        const tbody = this.getTableBody()

        if (tbody == undefined) {
            return
        }

        const children = Array<Element>()

        children.push(...tbody.children)


        children.sort(this.rowSortFunc)

        tbody.append(...children)

        this.updateHeaderStyles()
    }



    updateRowStyles() {
     
        const tbody = this.getTableBody()

        if (tbody == null) {
            return
        }

       

        for (let ii = 0; ii < tbody.children.length; ii++) {

            const row = tbody.children.item(ii) as HTMLElement

            if (ii == this.selectedRowIndex) {
                row.classList.add(className_selectedRow);
            }
            else {
                row.classList.remove(className_selectedRow);
            }
        }
    }


    updateHeaderStyles() {
        const headrow = this.getHeaderRow()

        if (headrow == null) {
            return
        }

        let className = (this.sortDir == 1) ? className_ascending : className_descending


        for (let ii = 0; ii < headrow.children.length; ii++) {

            const headCell = headrow.children.item(ii) as HTMLElement

            headCell.classList.remove(className_ascending);
            headCell.classList.remove(className_descending);

            if (ii == this.sortColIndex) {
                headCell.classList.add(className);
            }
        }
    }
    
}

