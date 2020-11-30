// TODO: 3 Move shared code from DataCkanLayersTree and DataLayerTree to a common base class

import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol'

import { proxyfetch } from '../../../../util/proxyfetch'
import AbstractData from '../../../data/AbstractData/AbstractData'
import { TreeNodeData } from '../../../../treeUtil/TreeNodeData'
import { buildTreeRecursive } from '../../../../treeUtil/layerTreeUtil'


@Component({})
export default class DataCkanLayersTree extends AbstractData {

    @Prop()
    url!: string

    @Prop()
    ckanApiKey!: string

    @Prop()
    map!: ol.Map;


    layerConfig: any = null

    rootNode: TreeNodeData = new TreeNodeData("root")

    initialLayersConfig : Array<any> = []


    @Watch('map')
    onMapChange() {
        this.setup()
    }


    @Watch('ckanApiKey')
    onCkanApiKeyChange() {
        // TODO: Check if key has really changed
        console.log("ckan API key has changed!")
        this.setup()
    }



    setup() {

        if (this.map == undefined) {
            return
        }


        let options: RequestInit = {
            headers: {
                "X-CKAN-API-Key": this.ckanApiKey
            }
        }


        // TODO: 2 Handle JSON parse error
        proxyfetch(this.url, options).then(response => response.json()).then(this.onDataLoaded)
    }


    onDataLoaded(data: any) {      


        this.rootNode.removeAllChildren()

        let layerTreeConfig = {
            "treeLabel": "root", "children": [
                {
                    "treeLabel": "Sonstige",
                    "children": new Array<any>(),
                    "groupId": "other"
                }
            ]
        }

        function findGroup(id: string) {
            for (let group of layerTreeConfig.children) {
                if (group.groupId == id) {
                    return group
                }
            }

            return null
        }


        let validFormats = ["wms", "wfs", "geojson"]


        // This works for current_package_list_with_resources:

        //######################## BEGIN Iterate over datasets ############################
        for (let dataset of data.result) {

            let tags: Array<string> = []

            for (let tag of dataset.tags) {
                tags.push(tag.display_name)
            }

            for (let group of dataset.groups) {
                tags.push(group.display_name)
            }
            //console.log(tags)

            let resources = new Array<any>()

            let datasetNode = {
                "treeLabel": dataset.title,
                "children": resources,
            }

            //############### BEGIN Figure out geometry type ################
            let geomType = ""

            if (dataset.extras instanceof Array) {

                for (let extra of dataset.extras) {

                    if (extra.key == "geometry_type") {
                        geomType = extra.value
                    }
                }
            }
            //############### END Figure out geometry type ################


            //############### BEGIN Figure map layer z-index (level) ################
            let level = 0

            if (geomType == "Point" || geomType == "Line") {
                level = 2
            }

            else if (geomType == "Polygon") {
                level = 1
            }
            //############### END Figure map layer z-index (level) ################


            //################ BEGIN Fill resources array #################

            for (let resource of dataset.resources) {

                let id = resource.id

                let format = resource.format.toLowerCase()


                if (!validFormats.includes(format)) {
                    continue
                }

                let type = ""

                switch (format) {
                    case "wms": {
                        type = "wms-capabilities"
                        break;
                    }
                    case "wfs": {
                        type = "wfs-capabilities"
                        break;
                    }
                    case "geojson": {
                        type = "geojson"
                        break;
                    }
                }

                let initial = false
                let visible = true


                for (let ilc of this.initialLayersConfig) {
                    if (ilc.id == id) {
                        initial = true
                        visible = ilc.visible
                        break
                    }
                }

                //################## BEGIN Create tree node data object ###################
                let resourceTreeNode = {

                    "layerId": resource.url,

                    "layerconfig": {
                        // NOTE: 'type' is supposed to be of the enum type LaterTreeUtil.LayerTreeNodeType.
                        // Here, we assign a string value under the expectation that the CKAN format values match the
                        // entries of LaterTreeUtil.LayerTreeNodeType.

                        "type": type,

                        "initial": initial,
                        "visible": visible,

                        "baseUrl": resource.url,
                        "level": level,
                        "title": dataset.title + " - " + resource.format,
                        "http_headers": {
                            "X-CKAN-API-Key": this.ckanApiKey
                        }
                    },

                    "tags": tags,
                    "treeLabel": dataset.title + " - " + resource.format
                }
                //################## END Create tree node data object ###################

                resources.push(resourceTreeNode)

            }
            //################ END Fill resources array #################


            if (resources.length > 0) {

                let groupToAdd = null

                for (let group of dataset.groups) {

                    let existingGroup = findGroup(group.id)


                    if (existingGroup != null) {
                        //existingGroup.children = existingGroup.children.concat(resources)
                        //existingGroup.children.push(datasetNode)
                        groupToAdd = existingGroup
                    }
                    else {
                        let newGroup = {
                            "treeLabel": group.title,
                            "children": new Array<any>(),
                            "groupId": group.id
                        }

                        layerTreeConfig.children.push(newGroup)
                        //newGroup.children = newGroup.children.concat(resources)
                        //newGroup.children.push(datasetNode)

                        groupToAdd = newGroup
                    }
                }

                if (dataset.groups.length == 0) {
                    groupToAdd = findGroup("other")
                }

                if (groupToAdd != null) {
                    groupToAdd.children.push(datasetNode)
                }
            }
        }
        //######################## END Iterate over datasets ############################


        buildTreeRecursive(layerTreeConfig, this.rootNode, this.map)

        this.rootNode.sortChildren()

        this.register(this.rootNode)
    }
}
