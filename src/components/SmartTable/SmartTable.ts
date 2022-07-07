import { Component, Vue } from 'vue-property-decorator';



import "./SmartTable.scss"
import WithRender from './SmartTable.html';




@WithRender
@Component({
    components: {
    }
})
export default class SmartTable extends Vue {



    currentSortFieldIndex = -1
    sortDir = 1


    mounted() {


        this.prepare()

        // create a new instance of 'MutationObserver' named 'observer', 
        // passing it a callback function

        /*
        // identify an element to observe

        let el = this.$refs.backstage as HTMLDivElement
 
        if (el != undefined) {
            this.content = el.innerHTML

            let observer = new MutationObserver((mutationsList, observer) => {

            //   this.sort()
            });

            // call 'observe' on that MutationObserver instance, 
            // passing it the element to observe, and the options object
            observer.observe(el, { characterData: true, childList: true, attributes: true, subtree: true })
         }
         */
        //console.log(content)
    }


    getHeaderRow(): HTMLTableRowElement | null {

        const bs = this.$refs.table as HTMLTableElement

        if (bs == undefined) {
            return null
        }

        const thead = bs.getElementsByTagName("thead").item(0)

        if (thead == undefined) {
            return null
        }

        const headrow = thead.getElementsByTagName("tr").item(0)

        return headrow
    }


    prepare() {
      
        const headrow = this.getHeaderRow()
        
        if (headrow == null) {
            return
        }

        for (let ii = 0; ii < headrow.children.length; ii++) {
            const cell = headrow.children.item(ii) as Element

            cell.addEventListener("click", this.onHeaderCellClick)
        }
    }


    onHeaderCellClick(evt: Event) {

        const headrow = this.getHeaderRow()
        
        if (headrow == null) {
            return
        }

        for (let ii = 0; ii < headrow.children.length; ii++) {
            const cell = headrow.children.item(ii) as Element

            if (cell == evt.currentTarget) {
                this.sort(ii)
                return
            }

        }
    }


    sort(sortColIndex: number) {

        if (sortColIndex == this.currentSortFieldIndex) {
            this.sortDir = -this.sortDir
        }
        else {
            this.currentSortFieldIndex = sortColIndex
        }

        const headrow = this.getHeaderRow()
        
        if (headrow == null) {
            return
        }


        if (headrow == undefined) {
            return
        }

        const className_ascending = "SmartTable__HeaderCell--ascending"
        const className_descending = "SmartTable__HeaderCell--descending"

        let className = (this.sortDir == -1) ? className_ascending : className_descending


        for (let ii = 0; ii < headrow.children.length; ii++) {

            const headCell = headrow.children.item(ii) as HTMLElement

            headCell.classList.remove(className_ascending);
            headCell.classList.remove(className_descending);

            if (ii == sortColIndex) {
                headCell.classList.add(className);
            }

        }



        let bs = this.$refs.table as HTMLTableElement

        if (bs == undefined) {
            return
        }

    

        let tbody = bs.getElementsByTagName("tbody").item(0) as HTMLElement

        if (tbody == undefined) {
            return
        }

        const children = Array<Element>()

        children.push(...tbody.children)




        children.sort((a, b) => {


            const cellA = a.children.item(sortColIndex)
            const cellB = b.children.item(sortColIndex)


            if (cellA == undefined || cellB == undefined) {
                return 0
            }

            let v1 = cellA.getAttribute("data-value")

            if (v1 == null) {
                v1 = cellA.innerHTML
            }

            let v2 = cellB.getAttribute("data-value")

            if (v2 == null) {
                v2 = cellB.innerHTML
            }

            if (v1 < v2) {
                return -1 * this.sortDir
            }
            else if (v1 > v2) {
                return 1 * this.sortDir
            }

            return 0
        })

        tbody.append(...children)
    }

}

