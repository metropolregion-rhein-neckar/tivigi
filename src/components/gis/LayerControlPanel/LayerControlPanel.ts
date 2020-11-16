import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

//############## BEGIN OpenLayers imports ##############
import * as ol from 'ol'
import * as ol_layer from 'ol/layer'
import * as ol_proj from 'ol/proj'
import { Extent } from 'ol/extent';
import VectorSource from 'ol/source/Vector';
import { TileWMS } from 'ol/source';
//############## END OpenLayers imports ##############

//################# BEGIN Tivigi imports #################
import Collapsible from 'tivigi/src/components/Collapsible/Collapsible'
import AttributesTable from 'tivigi/src/components/gis/AttributesTable/AttributesTable'
import PopupMenu from 'tivigi/src/components/PopupMenu/PopupMenu'
import FloatingWindow from 'tivigi/src/components/FloatingWindow/FloatingWindow'
import Legend from 'tivigi/src/components/gis/Legend/Legend'
import Superbutton from 'tivigi/src/components/Superbutton/Superbutton'
import LayerLegend from 'tivigi/src/components/gis/LayerLegend/LayerLegend'
import LayerMetadataPanel from 'tivigi/src/components/gis/LayerMetadataPanel/LayerMetadataPanel'
import StyleSwitcher from 'tivigi/src/components/gis/StyleSwitcher/StyleSwitcher'
//################# END Tivigi imports #################


import './LayerControlPanel.scss'

import WithRender from './LayerControlPanel.html';


@WithRender
@Component({
    components: {
        AttributesTable,
        Collapsible,       
        FloatingWindow,
        LayerLegend,
        LayerMetadataPanel,        
        Legend,
        PopupMenu,        
        Superbutton,
        StyleSwitcher
    },
})
export default class LayerControlPanel extends Vue {

    //################# BEGIN Props #################
    @Prop()
    map!: ol.Map

    @Prop()
    layer!: ol_layer.Layer

    @Prop()
    ckanApiUrl!: string

    @Prop({ default: () => { return ["menu"] } })
    buttonsConfig!: Array<string>

    @Prop({ default: () => { return ["info", "attributes", "fit_extent", "remove"] } })
    menuConfig!: Array<string>
    //################# END Props ####################


    showLayerInfo = false
    showPopupMenu = false
    showAttributesTable = false


    get isVectorLayer(): boolean {
        let source = this.layer.getSource()

        return (source instanceof VectorSource)
    }


    get menuHasEntries(): boolean {

        for (let entry of this.menuConfig) {
            if (entry == 'attributes' && this.isVectorLayer) {
                return true
            }

            if (entry == 'info') {
                return true
            }

            if (entry == 'remove' && !this.layer.get('noremove')) {
                return true
            }

            if (entry == 'visibility') {
                return true
            }

            if (entry == 'fit_extent' && this.calcExtent(this.layer) != undefined) {
                return true
            }
        }

        return false
    }


    get title_zoomToExtent(): string {
        let result = "Karte auf Ebene zentrieren"

        if (this.calcExtent(this.layer) == undefined) {
            //    result += " - für diesen Ebenentyp nicht verfügbar"
        }

        return result
    }


    get visibilityButtonImageUrl(): string {
        if (this.layer.getVisible()) {
            return "/tivigi/img/visible.svg"
        }
        else {
            return "/tivigi/img/invisible.svg"
        }
    }


    get visibilityButtonLabel(): string {
        if (this.layer.getVisible()) {
            return "Ebene ausblenden"
        }
        else {
            return "Ebene einblenden"
        }
    }


    // TODO: Move this function to utils
    calcExtent(layer: ol_layer.Layer): Extent | undefined {

        let source = layer.getSource()

        if (source instanceof VectorSource) {

            return source.getExtent()
        }

        else if (source instanceof TileWMS) {

            let extent_4326 = source.get('extent_4326')

            if (extent_4326 == undefined) {
                //console.log(layer.get('title') + " extent not defined")           
                return undefined
            }

            return ol_proj.transformExtent(extent_4326, "EPSG:4326", this.map.getView().getProjection())
        }

        return undefined
    }

  
    onRemoveLayerButtonClick(layer: ol_layer.Layer) {
        this.map.removeLayer(this.layer)
    }


    onShowAttributesTableClick() {
        this.$emit('showAttributesTableButtonClick')
        this.showAttributesTable = true
    }

    toggleVisibility() {
        this.layer.setVisible(!this.layer.getVisible())
    }




    zoomToExtent() {

        let buffer_pixels = 20

        let extent = this.calcExtent(this.layer)

        if (extent != undefined) {
            this.map.getView().fit(extent, { size: this.map.getSize(), padding: [buffer_pixels, buffer_pixels, buffer_pixels, buffer_pixels], maxZoom:15,duration:1000 })
        }
    }
}



