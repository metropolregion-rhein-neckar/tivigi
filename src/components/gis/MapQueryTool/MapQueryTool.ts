import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

//############## BEGIN OpenLayers imports ##############
import * as ol from 'ol/'
import * as ol_source from 'ol/source'
import * as ol_layer from 'ol/layer'
import { FeatureLike } from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import * as ol_format from 'ol/format'
//############## END OpenLayers imports ##############


import { proxyfetch } from 'tivigi/src/util/proxyfetch';
import { MapQueryResultSet } from 'tivigi/src/components/gis/MapQueryTool/mapQueryUtil';

import WithRender from './MapQueryTool.html';
import { Extent } from 'ol/extent';


@WithRender
@Component({})
export default class FeatureInfoTool extends Vue {

    //################### BEGIN Props #################
    @Prop()
    map!: ol.Map;

    @Prop()
    coords!: Coordinate;

    @Prop({ default: 5 })
    queryRadius!: number

    @Prop({ default: 1000 })
    wmsMaxFeatureCount!: number
    //################### END Props #################


    geojsonFormat = new ol_format.GeoJSON()

    resultset = new MapQueryResultSet()


    @Watch('coords')
    onCoordsChange() {

        this.resultset = new MapQueryResultSet()

        // Reset props:
        this.$emit('resultUpdate', this.resultset)

        this.processVectorFeatures(this.coords)

        if (this.wmsMaxFeatureCount > 0) {
            this.processWmsLayers(this.coords)
        }
    }


    addFeature(feature: FeatureLike, layer: ol_layer.Layer) {

        if (layer == null) {
            console.log("FeatureInfoTool: Layer is null");
            return
        }

        //############### BEGIN Handle cluster layer features ###############
        if (feature.getProperties().features instanceof Array) {

            for (let f2 of feature.getProperties().features) {
                this.addFeature(f2, layer)
            }

            return
        }
        //############### END Handle cluster layer features ###############

        //################ BEGIN Exclude features based on layer settings ###############
        // TODO: 4 Maybe move this to the layerFilter argument? (see below)
        if (layer.get("showFeatureInfo") == false) {
            //console.log(layer.get('title') + ": Layer is configured to not be included in feature info.")
            return
        }

        if (!layer.getVisible()) {
            return
        }
        //################ END Exclude features based on layer settings ###############

        this.resultset.add(feature as ol.Feature, layer as ol_layer.Layer)

        // Update props:
        this.$emit('resultUpdate', this.resultset)
    }


    processVectorFeatures(coordinate: Coordinate | Extent) {

        //############################ BEGIN Process local vector features ##########################
        if (coordinate.length == 2) {
            let pixel = this.map.getPixelFromCoordinate(coordinate);

            this.map.forEachFeatureAtPixel(pixel,

                this.addFeature,
                {
                    layerFilter: (layer) => true,
                    hitTolerance: this.queryRadius,

                });

        }
        else if (coordinate.length == 4) {

            for (let layer of this.map.getLayers().getArray()) {

                if (!layer.getVisible()) {
                    continue
                }

                // Skip layer if feature info is disabled for it:
                if (layer.get("showFeatureInfo") == false) {
                    continue
                }

                // NOTE: Casting to 'Layer' in order to be "allowed" to call layer.getSource() should be OK. 
                // 'BaseLayer' is the abstract base class of all layer classes, and each(?) actually instanceable 
                // layer class should be derived from 'Layer'.

                let source = (layer as ol_layer.Layer).getSource()

                if (source instanceof ol_source.Vector) {

                    source.forEachFeatureInExtent(coordinate as Extent, (feature: FeatureLike) => {
                        this.addFeature(feature, layer as ol_layer.Layer)
                    })

                }
            }
        }
        //######################## END Process local vector features ######################
    }


    processWmsLayers(coordinate: Coordinate) {

        //################ BEGIN Perform GFI request for all layers in the map ###############
        for (let layer of this.map.getLayers().getArray()) {

            if (!layer.getVisible()) {
                continue
            }

            // Skip layer if feature info is disabled for it:
            if (layer.get("showFeatureInfo") == false) {
                continue
            }

            // NOTE: Casting to 'Layer' in order to be "allowed" to call layer.getSource() should be OK. 
            // 'BaseLayer' is the abstract base class of all layer classes, and each(?) actually instanceable 
            // layer class should be derived from 'Layer'.

            let source = (layer as ol_layer.Layer).getSource()

            //################## BEGIN Try to fetch URL parameter 'layers' from source ##################
            let layers = ""

            if (source instanceof ol_source.TileWMS || source instanceof ol_source.ImageWMS) {

                layers = source.getParams().layers
            }
            else {
                continue
            }

            //################## END Try to fetch URL parameter 'layers' from source ##################


            //###################### BEGIN Get feature info URL ####################
            let url = source.getFeatureInfoUrl(
                coordinate,
                this.map.getView().getResolution() as number,
                this.map.getView().getProjection(),
                {
                    'INFO_FORMAT': 'application/json',
                    'QUERY_LAYERS': layers,
                    'FEATURE_COUNT': this.wmsMaxFeatureCount,
                    'BUFFER': this.queryRadius
                }
            );
            //###################### END Get feature info URL #####################


            if (url == undefined) {
                continue
            }

          
            proxyfetch(url).then(response => {

                response.json().then(gfi_geojson => {

                    for (let feature of this.geojsonFormat.readFeatures(gfi_geojson)) {
                        this.addFeature(feature, layer as ol_layer.Layer)
                    }
                })
            });

        }
        //################ END Perform GFI request for all layers in the map ###############
    }
}
