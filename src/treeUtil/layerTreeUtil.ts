import * as ol from 'ol'

import { TreeNodeData } from 'tivigi/src/treeUtil/TreeNodeData'
import { getUrlState } from 'tivigi/src/util/urlStateKeeping'
import { LayerTreeNodeData } from 'tivigi/src/treeUtil/LayerTreeNodeData'



export enum LayerTreeNodeType {
    WMS_CAPABILITIES = "wms-capabilities",
    WFS_CAPABILITIES = "wfs-capabilities",
    WMS_STATISTICS = "wms-statistics",
    GEOJSON = "geojson"
}

export function buildTreeRecursive(dataParent: any, treeParent: TreeNodeData, map: ol.Map) {

    let urlState = getUrlState()

    for (let dataChild of dataParent.children) {

        let treeChild: TreeNodeData = new TreeNodeData(dataChild.treeLabel)

        if (dataChild.layerconfig != undefined) {

            //######### BEGIN Set label ############
            let label = "Unbenannter Eintrag"

            if (dataChild.layerconfig.title != undefined) {
                label = dataChild.layerconfig.title
            }

            if (dataChild.treeLabel != undefined) {
                label = dataChild.treeLabel
            }
            //######### END Set label ############

            // Create layer node:
            treeChild = new LayerTreeNodeData(label, dataChild, map)


            //########## BEGIN Set checked (i.e. add to the map) initially ###########

            // The flag to initially add a layer to the map can be set 
            // both in the tree config and in the layers config:

            if (dataChild.initial || dataChild.layerconfig.initial) {
                treeChild.checked = true
            }
            //########## END Set checked (i.e. add to the map) initially ###########


            //########### BEGIN Set layer as checked depending on URL state ###########

            // ATTENTION: The substructures within the URL state object which are read
            // here are set in the DataMap component. This is a somewhat ugly connection: 
            // DataMap should not have to write values which are read here.
            // TODO: 4 Perhaps find a cleaner solution for this.

            let mapName = map.get("name")

            if (mapName != undefined) {
            
                //console.log("Add: " + dataChild.layerId)
                if (urlState[mapName] != undefined && urlState[mapName].layers instanceof Array) {

                    if (urlState[mapName].layers.includes(dataChild.layerId)) {
                       // console.log("yes")
                        treeChild.checked = true
                    }
                }
            }
            //########### END Set layer as checked depending on URL state ###########

        }


        //######## BEGIN Do stuff that only needs to be done if current node has children #########
        if (dataChild.children instanceof Array && dataChild.children.length > 0) {

            // Add child nodes:
            buildTreeRecursive(dataChild, treeChild, map)

            // Sort children alphabetically:
            treeChild.sortChildren()

            //#################### BEGIN Add 'toggle all' node #######################

            // NOTE: The 'toggle all' node must be added *after* children are already added
            // (i.e. after buildTreeRecursive() is called) !
            /*
            let toggleNodeThreshold = 3

            if (dataChild.toggleNodeThreshold != undefined) {
                toggleNodeThreshold = dataChild.toggleNodeThreshold
            }

            if (dataChild.children.length >= toggleNodeThreshold) {
                let toggleAllNode = createToggleAllNode(treeChild)

                if (toggleAllNode != null) {
                    treeChild.addChild(toggleAllNode, 0)
                }
            }
            */
            //####################### END Add 'toggle all' node ####################


        }
        //######## END Do stuff that only needs to be done if current node has children #########

        // Finally, add the node to the tree:        
        treeParent.addChild(treeChild)
    }
}


//################# BEGIN Create child node to select/unselect all other child nodes #############
function createToggleAllNode(treeChild: TreeNodeData): TreeNodeData | null {

    let numCheckboxes = 0

    for (let treeGrandchild of treeChild.children) {

        if (treeGrandchild.type != "selectAll" && treeGrandchild.control == "checkbox") {
            numCheckboxes++
        }
    }

    if (numCheckboxes < 2) {
        return null
    }


    let getAllChecked = (): boolean => {

        let val = true

        for (let treeGrandchild of treeChild.children) {

            if (treeGrandchild.type != "selectAll" && treeGrandchild.control == "checkbox") {
                if (!treeGrandchild.checked) {
                    val = false
                }
            }
        }

        return val
    }


    let setAllChecked = (newval: boolean) => {

        for (let treeGrandchild of treeChild.children) {

            if (treeGrandchild.type != "selectAll" && treeGrandchild.control == "checkbox") {
                treeGrandchild.checked = newval
            }
        }
    }

    let selectAllNode = new TreeNodeData("[Alles auf dieser Ebene]", getAllChecked, setAllChecked)

    selectAllNode.type = "selectAll"
    selectAllNode.labelStyle = "font-style:italic"

    selectAllNode.control = "checkbox"

    return selectAllNode
}
//################# END Create child node to select/unselect all other child nodes #############


// This is an extended filter that takes into account the layer's title in addition to the tree node label:

/*
export function createLayerNode(layer: BaseLayer, map: ol.Map, labelOverride: string | undefined = undefined): TreeNodeData {

    //##################### BEGIN Define filter function #######################
    result.filter = function (this: TreeNodeData, filter: string, local: boolean = false): boolean {

        let filter_pieces = filter.split(' ')


        function cleanString(s: string): string {
            return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        }

        let results = []

        for (let piece of filter_pieces) {

            let blubb = false

            // Search in tree node label:
            if (cleanString(this.label).includes(cleanString(piece))) {
                blubb = true
            }

            // Search in layer title:
            if (cleanString(layer.get('title')).includes(cleanString(piece))) {
                blubb = true
            }

            results.push(blubb)
        }

        for (let result of results) {
            if (result == false) {
                return false
            }
        }

        return true
    }
    //##################### END Define filter function #######################


}
*/

