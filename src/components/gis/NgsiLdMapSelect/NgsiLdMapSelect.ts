import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as ol from 'ol'
import * as ol_layer from 'ol/layer'
import * as ol_style from 'ol/style'

import WithRender from './NgsiLdMapSelect.html';
import { FeatureLike } from 'ol/Feature';
import { ColorRGBA } from 'tivigi/src/util/ColorRGBA';
import { addStyleFunctionToLayer } from 'tivigi/src/olVectorLayerStyling/styleUtils';


@WithRender
@Component({
    components: {}
})
export default class NgsiLdMapSelect extends Vue {

    @Prop()
    layer!: ol_layer.Vector

    @Prop()
    map!: ol.Map

    @Prop({ default: false })
    multiSelect!: boolean

    @Prop({ default: () => [] })
    selection!: Array<any>


    @Watch("map")
    onMapChange() {

        this.map.on("click", this.onMapClick)
    }

    @Watch("selection")
    onSelectionChange() {
        this.layer.getSource().changed()
    }

    @Watch("layer")
    makeStyle() {

        let actualLineWidth = 2.5

        const selectionHighlightStyleFunction = (feature: any): ol_style.Style[] => {

            let result = []
            let fc = new ColorRGBA([0, 0, 0, 0.0])

            let lineColor = new ColorRGBA([0, 0, 0, 0])

            let entity = feature.getProperties()["entity"]

            if (this.selection.includes(entity)) {
                fc = new ColorRGBA([0, 0, 255, 0.3])
                lineColor = new ColorRGBA([0, 0, 0, 1])
            }

            result.push(new ol_style.Style({

                stroke: new ol_style.Stroke({
                    color: lineColor.toRgbaString(),
                    width: actualLineWidth
                }),


                fill: new ol_style.Fill({
                    // ATTENTION: We must set at least a transparent fill color. Without any fill color,
                    // the feature is not clickable.
                    color: fc.toRgbaString()
                })


            }))

            return result
        }



        addStyleFunctionToLayer(this.layer, "selectionHighlight", selectionHighlightStyleFunction)
        //    this.layer_selection.setStyle(selectionHighlightStyleFunction)
    };


    onMapClick(evt: ol.MapBrowserEvent) {



        let features = Array<FeatureLike>()

        this.map.forEachFeatureAtPixel(evt.pixel, (feature: any, layer: any) => {

            if (layer == this.layer) {
                features.push(feature)
            }

        })

        for (const feature of features) {
            const entity = feature.getProperties()["entity"]

            if (this.multiSelect) {

                const index = this.selection.indexOf(entity);

                if (index > -1) {
                    this.selection.splice(index, 1);
                }
                else {
                    this.selection.push(entity)
                }
            }
            else {
                this.selection.length = 0
                this.selection.push(entity)
            }

        }

    }




}