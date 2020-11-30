export enum TreeNodeFilterMode {
    NODE_OR_CHILD,
    NODE_ONLY,
    CHILDREN_ONLY
}

export class TreeNodeData {

    children = Array<TreeNodeData>()

    // NOTE: 
    // pChecked is a placeholder status property which is probably not used
    // if getChecked() and setChecked() callback functions are passed to the constructor.
    pChecked = false

    // TODO: 3 Make this an Enum
    control: string = ""
    type = ""
    labelStyle = ""

    get checked(): boolean {
        return this.getChecked()
    }

    set checked(newval: boolean) {
        this.setChecked(newval)
    }

    constructor(public label: string, public getChecked: Function = () => { return this.pChecked }, public setChecked: Function = (newval: boolean) => { this.pChecked = newval }) { }


    addChild(child: TreeNodeData, index = -1) {

        if (index > -1) {
            this.children.splice(index, 0, child);
        }
        else {
            this.children.push(child)
        }
    }

    cleanString(s: string): string {

        if (s == undefined) {
            return ""
        }

        return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    }


    filter(filter: string, filterMode: TreeNodeFilterMode): boolean {

        if (filter == "") {
            return true
        }

        //######################## BEGIN Check node itself #######################
        let result_node = true

        let filter_pieces = filter.split(' ')

        // NOTE: Here, we initialize result as 'true' and set it to 'false' if the label does 
        // not include one of the filter string pieces. This implements a "AND" logic: 
        //In order for a filter check to return true, the node's label must contain
        // *all* of the filter pieces.        

        // Check label of current node:
        for (let piece of filter_pieces) {

            if (!this.cleanString(this.label).includes(this.cleanString(piece))) {
                result_node = false
                break
            }
        }

        if (filterMode == TreeNodeFilterMode.NODE_ONLY || this.children.length == 0) {
            return result_node
        }
        //######################## END Check node itself #######################


        //######################## BEGIN Check children #######################
        let result_children = false
        
        // Check subtree recursively:
        for (let child of this.children) {
            if (child.filter(filter, filterMode)) {
                result_children = true
                break
            }
        }

        if (filterMode == TreeNodeFilterMode.CHILDREN_ONLY) {
            return result_children
        }
        //######################## END Check children #######################

        // If filterMode == TreeFilterMode.NODE_OR_CHILDREN:
        return result_node || result_children
    }

    
    onClick() {

    }


    removeAllChildren() {
        this.children = []
    }
    

    removeChild(child : TreeNodeData) {
        let index = this.children.indexOf(child)

        if (index == -1) {
            return
        }

        this.children.splice(index, 1);
    }


    sortChildren() {
        //##################### BEGIN Sort children alphabetically ###################
        let folders = []
        let leaves = []

        for (let child of this.children) {
            if (child.children.length > 0) {
                folders.push(child)
            }
            else {
                leaves.push(child)
            }
        }


        folders.sort((a: TreeNodeData, b: TreeNodeData) => {

            if (a.label > b.label) {
                return 1;
            }
            else if (a.label < b.label) {
                return -1;
            }
            else {
                return 0
            }
        })

        leaves.sort((a: TreeNodeData, b: TreeNodeData) => {

            if (a.label > b.label) {
                return 1;
            }
            else if (a.label < b.label) {
                return -1;
            }
            else {
                return 0
            }
        })

        this.children = folders.concat(leaves)
        //##################### END Sort children alphabetically ###################

    }
}
