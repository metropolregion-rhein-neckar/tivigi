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

    filter = ""   
}



