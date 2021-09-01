import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

//############## BEGIN OpenLayers imports ##############
import * as ol from 'ol/'
import * as ol_source from 'ol/source'
import * as ol_layer from 'ol/layer'
import * as ol_proj from 'ol/proj'
import { FeatureLike } from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import * as ol_format from 'ol/format'
//############## END OpenLayers imports ##############


import { proxyfetch } from 'tivigi/src/util/proxyfetch';
import { MapQueryResultSet } from 'tivigi/src/util/mapQueryUtil';

import WithRender from './MapQueryTool.html';
import { Extent } from 'ol/extent';


@WithRender
@Component({})
export default class MapQueryTool extends Vue {

    //################### BEGIN Props #################
    @Prop()
    map!: ol.Map;

    // ATTENTION: coords must be in EPSG 4326 / WGS 84 !!
    @Prop()
    coords!: Coordinate;

    @Prop({ default: 5 })
    queryRadius!: number

    @Prop({ default: 1000 })
    wmsMaxFeatureCount!: number

    @Prop()
    result : MapQueryResultSet|undefined
    //################### END Props #################


    geojsonFormat = new ol_format.GeoJSON()

    resultset = new MapQueryResultSet()


    @Watch('coords')
    async onCoordsChange() {

       
        this.resultset = new MapQueryResultSet()

        // Reset props:
        //this.$emit('resultUpdate', this.resultset)


        let coords_3857 = ol_proj.transform(this.coords, 'EPSG:4326', this.map.getView().getProjection())

        await this.processVectorFeatures(coords_3857)

        if (this.wmsMaxFeatureCount > 0) {
            await this.processWmsLayers(coords_3857)
        }

 
        this.$emit("update:result", this.resultset)
    }


    // TODO: 3 Replace this with getClusteredFeaturesRecursive()
    addFeature(feature: FeatureLike, layer: ol_layer.Layer) {

        if (layer == null) {
            console.log("FeatureInfoTool: Layer is null");
            return
        }

        //############### BEGIN Handle cluster layer features ###############
        if (feature.getProperties().features instanceof Array) {

            for (let f2 of feature.getProperties().features) {
                // TODO: 3 Replace this with getClusteredFeaturesRecursive()
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
        //this.$emit('resultUpdate', this.resultset)
    }


    processVectorFeatures(coordinate: Coordinate | Extent) {

        //############################ BEGIN Process local vector features ##########################
        if (coordinate.length == 2) {
            const pixel = this.map.getPixelFromCoordinate(coordinate);

            this.map.forEachFeatureAtPixel(pixel,

                // TODO: 3 Replace this with getClusteredFeaturesRecursive()
                this.addFeature,
                {
                    layerFilter: (layer) => true,
                    hitTolerance: this.queryRadius,

                });

        }
        else if (coordinate.length == 4) {

            for (const layer of this.map.getLayers().getArray()) {

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

                const source = (layer as ol_layer.Layer).getSource()

                if (source instanceof ol_source.Vector) {

                    source.forEachFeatureInExtent(coordinate as Extent, (feature: FeatureLike) => {
                        // TODO: 3 Replace this with getClusteredFeaturesRecursive()
                        this.addFeature(feature, layer as ol_layer.Layer)
                    })

                }
            }
        }
        //######################## END Process local vector features ######################
    }


    async processWmsLayers(coordinate: Coordinate) {

        //################ BEGIN Perform GFI request for all layers in the map ###############
        for (const layer of this.map.getLayers().getArray()) {

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

            const source = (layer as ol_layer.Layer).getSource()

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
            const url = source.getFeatureInfoUrl(
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

            const response = await proxyfetch(url)

            const gfi_geojson = await response.json()

            for (let feature of this.geojsonFormat.readFeatures(gfi_geojson)) {
                // TODO: 3 Replace this with getClusteredFeaturesRecursive()
                this.addFeature(feature, layer as ol_layer.Layer)
            }
            /*
            proxyfetch(url).then(response => {

                response.json().then(gfi_geojson => {

                    for (let feature of this.geojsonFormat.readFeatures(gfi_geojson)) {
                        // TODO: 3 Replace this with getClusteredFeaturesRecursive()
                        this.addFeature(feature, layer as ol_layer.Layer)
                    }
                })
            });
            */
        }
        //################ END Perform GFI request for all layers in the map ###############
    }
}
