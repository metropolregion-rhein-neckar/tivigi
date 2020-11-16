import { Component, Vue, Prop } from 'vue-property-decorator';
import { TreeNodeData, TreeNodeFilterMode } from 'tivigi/src/treeUtil/TreeNodeData';
import Collapsible from '../Collapsible/Collapsible'

import WithRender from './TreeNode.html';
import './TreeNode.scss'


@WithRender
@Component({

    // ATTENTION: The 'name' property is required for recursive components to work in builds!
    name: "TreeNode",
    components: {
        TreeNode,
        Collapsible
    }
})
export default class TreeNode extends Vue {

    @Prop({ default: () => {return new TreeNodeData("Missing root node")} })
    node!: TreeNodeData

    @Prop({ default: "" })
    filter!: string

    @Prop({ default: false })
    showOverride!: boolean

    @Prop({ default: true })
    highlightFilterMatches!: boolean



    get collapsed(): boolean {

        if (this.filter == "") {
            return true
        }

        return !this.match_node_or_child
    }


    get dynamicClass(): any {

        return {
            "TreeNode": true,
            "TreeNode--filter-match": this.filter != "" && this.match_node_only && this.highlightFilterMatches
        }
    }

    get match_node_only(): boolean {
        return this.node.filter(this.filter, TreeNodeFilterMode.NODE_ONLY)
    }

    get match_node_or_child(): boolean {
        return this.node.filter(this.filter, TreeNodeFilterMode.NODE_OR_CHILD)
    }


    get show() {
        return this.match_node_or_child || this.showOverride
    }
   

    onLabelClick(evt: MouseEvent) {
        this.node.onClick()
    }
}
