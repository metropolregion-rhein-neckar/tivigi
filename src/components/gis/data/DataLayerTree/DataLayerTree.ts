// ATTENTION:
// For most use cases, we could simply merge the functionality of this component
// into the LayerTreeComponent. However, for some special applications, e.g. if
// we want to create a single tree that is a combination of multiple partial trees,
// it makes sense to keep them separate!

import { Component, Prop, Watch } from 'vue-property-decorator'

import AbstractData from '../../../data/AbstractData/AbstractData'
import { buildTreeRecursive } from 'tivigi/src/treeUtil/layerTreeUtil'
import { TreeNodeData } from 'tivigi/src/treeUtil/TreeNodeData'

import * as ol from 'ol'


@Component({})
export default class DataLayerTree extends AbstractData {

    //############## BEGIN Props ##############
    @Prop()
    treeDef!: any

    @Prop()
    layerDef!: any

    @Prop()
    map!: ol.Map;

    @Prop()
    data! : TreeNodeData
    //############## END Props ##############


    rootNode: TreeNodeData = new TreeNodeData("root")


    @Watch('map')
    onMapChange() {
        this.setup()
    }


    @Watch('treeDef')
    onTreeDefChange() {
        this.setup()
    }


    @Watch('layerDef')
    onLayerDefChange() {
        this.setup()
    }


    setup() {

        if (this.map == undefined || this.layerDef == undefined || this.treeDef == undefined) {
            return
        }

        // Merge layer definitions into layer tree defintion:
        this.mergeRecursive(this.treeDef)

        // Remove existing children from root node:
        this.rootNode.children = []

        buildTreeRecursive(this.treeDef, this.rootNode, this.map)


        this.rootNode.sortChildren()

        // Old way:
        this.register(this.rootNode)

        // New way:
        this.$emit("update:data", this.rootNode)
    }


    mergeRecursive(node: any) {

        if (node.children != undefined && node.children instanceof Array) {
            for (let child of node.children) {
                this.mergeRecursive(child)
            }
        }

        if (node.layerId != undefined) {

            if (this.layerDef[node.layerId] != undefined) {
                node.layerconfig = this.layerDef[node.layerId]
            }
            else {
                console.log("layerconfig not found for ID: " + node.layerId)
            }
        }
    }
}
