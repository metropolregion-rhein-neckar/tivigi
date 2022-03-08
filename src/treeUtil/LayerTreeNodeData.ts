import { TreeNodeData, TreeNodeFilterMode } from 'tivigi/src/treeUtil/TreeNodeData'

//########## BEGIN OpenLayers imports ###########
import * as ol from 'ol'
import * as ol_layer from 'ol/layer'
import BaseLayer from 'ol/layer/Base'
//########## END OpenLayers imports ###########

import { proxyfetch } from 'tivigi/src/util/proxyfetch'
import { createLayerFromConfig } from 'tivigi/src/util/mapLayerLoading'

import { LayerTreeNodeType } from 'tivigi/src/treeUtil/layerTreeUtil'


export class LayerTreeNodeData extends TreeNodeData {

    // TODO: 3 Specify structure of dataChild as a class or interface

    constructor(public label: string, public dataChild: any, public map: ol.Map) {

        super(dataChild.label)

        if (dataChild.layerconfig.group != undefined) {
            this.control = "radio"
        }
        else {
            this.control = "checkbox"
        }
    }


    get layer(): BaseLayer | null {

        for (let layer of this.map.getLayers().getArray()) {

            let layerId = layer.get('id')

            if (layerId != undefined && layerId == this.dataChild.layerId) {
                return layer
            }
        }

        return null
    }


    get checked(): boolean {

        if (this.layer == null) {
            return false
        }

        return this.map.getLayers().getArray().includes(this.layer)
    }


    set checked(newval: boolean) {

        if (newval == this.checked) {
            return
        }

        if (!newval) {

            if (this.layer != null) {
                this.map.removeLayer(this.layer)
            }
            return
        }


        if (this.layer == null) {

            //######## BEGIN if layer does not yet exist in the map, load it ##########
            switch (this.dataChild.layerconfig.type) {
                case LayerTreeNodeType.WMS_CAPABILITIES:
                case LayerTreeNodeType.WMS_STATISTICS:
                case LayerTreeNodeType.WFS_CAPABILITIES: {

                    proxyfetch(this.dataChild.layerconfig.baseUrl).then((response) => {

                        if (response.status == 200) {
                            response.text().then(this.onCapabilitiesResponseTextFulfilled)
                        }
                        else {
                            this.control = ""
                            this.label += " (Nicht verfügbar - Fehler beim Laden)"
                        }
                    });

                    break;
                }

                default: {

                    this.createLayer()
                    break;
                }

            }

            //######## END if layer does not yet exist in the map, load it ##########
        }
        else {
            this.layer.setVisible(true)

            try {
                this.map.addLayer(this.layer)
            }
            catch (exception) {
                // Layer already in map
            }
        }
    }



    createLayer() {
        let lyr = createLayerFromConfig(this.dataChild.layerconfig, this.map.getView().getProjection())

        if (lyr == null) {
            return
        }

        let layer = lyr as ol_layer.Layer

        let layerAlreadyInMap = false

        //############### BEGIN Exclusion groups behavior #################
        for (let otherLayer of this.map.getLayers().getArray()) {

            // TODO: 3 Perhaps store exclusive group in tree node and not in the layer object?

            if (layer.get('exclusive-group') && layer != otherLayer) {
                if (otherLayer.get('exclusive-group') == layer.get('exclusive-group')) {

                    this.map.removeLayer(otherLayer)
                }
            }

            if (otherLayer.get('id') == this.dataChild.layerId) {
                layerAlreadyInMap = true
                layer = otherLayer as ol_layer.Layer
            }
        }
        //############### END Exclusion groups behavior #################                           

        if (!layerAlreadyInMap) {
            layer.set('id', this.dataChild.layerId)
            this.map.addLayer(layer)
        }


        //############## BEGIN Set visibility ################
        let visible = this.dataChild.layerconfig.visible

        if (visible == undefined || visible == true) {
            layer.setVisible(true)
        }
        else {
            layer.setVisible(false)
        }
        //############## END Set visibility ################
    }


    
    /*
    filter(filter: Function|undefined, filterMode: TreeNodeFilterMode): boolean {

        if (filter == undefined) {
            return true
        }

        //######### BEGIN Check label (default filter) ###########
        let result_baseClass = super.filter(filter, filterMode)
        //######### END Check label (default filter) ###########


        //#################### BEGIN Check tags #####################

        // NOTE: As opposed to the standard label filter, we initialize result with 'false' here and set it to 'true' if
        // at least one tag contains at least one of the filter pieces.

        let result_tags = false

        if (this.dataChild.tags instanceof Array) {

            let filter_pieces = filter.split(' ')

            for (let piece of filter_pieces) {

                for (let tag of this.dataChild.tags) {
                    if (this.cleanString(tag).includes(this.cleanString(piece))) {
                        result_tags = true
                    }
                }
            }
        }
        //#################### END Check tags #####################

        return result_baseClass || result_tags
    }
    */

    onCapabilitiesResponseTextFulfilled = (responseText: string) => {

        this.dataChild.layerconfig.capabilities = responseText

        this.createLayer()
    }
}


