import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { TreeNodeData } from 'tivigi/src/treeUtil/TreeNodeData'
import TreeNode from '../TreeNode/TreeNode';

import Superinput from '../Superinput/Superinput'
import WithRender from './Tree.html';

import './Tree.scss'

@WithRender
@Component({
    components: {
        Superinput,
        TreeNode: TreeNode,
    },
})
export default class Tree extends Vue {

    //############# BEGIN Props #############
    @Prop({default: () => { return new TreeNodeData("Keine Daten")}})
    rootNode!: TreeNodeData

    @Prop({default : true})
    highlightFilterMatches! : boolean

    @Prop({default : false})
    showFilterInput!: boolean

    @Prop({default : false})
    showRootNode!: boolean
    //############# END Props #############

    filterString = ""   

    getFilterFunc() {

        if (this.filterString == "") {
            return undefined
        }

        return (node : TreeNodeData) : boolean => {
           
            let match_filter_string = true

            let filter_pieces = this.filterString.split(' ')
    
            // NOTE: Here, we initialize result as 'true' and set it to 'false' if the label does 
            // not include one of the filter string pieces. This implements a "AND" logic: 
            //In order for a filter check to return true, the node's label must contain
            // *all* of the filter pieces.        
    
            // Check label of current node:
            for (const piece of filter_pieces) {

                if (!this.cleanString(node.label).includes(this.cleanString(piece))) {
                    match_filter_string = false
                    break
                }
            }

            return match_filter_string
        }
    }


    cleanString(s: string): string {

        if (s == undefined) {
            return ""
        }

        return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    }
}



