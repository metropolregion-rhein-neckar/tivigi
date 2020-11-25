import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

// TODO: Limiting this to one layer is probably not such a good idea

import * as ol_format from 'ol/format'
import * as ol from 'ol'
import * as ol_geom from 'ol/geom'
import * as ol_source from 'ol/source'
import * as ol_layer from 'ol/layer'

import { Extent } from 'ol/extent';
import AbstractData from 'tivigi/src/components/data/AbstractData/AbstractData';

@Component({
    components: {}
})
export default class DataFeaturesInPolygon extends AbstractData {


    // Filter polygon:
    @Prop({})
    clipCoords: any


    // Incoming features (unfiltered):
    @Prop()
    layer!: ol_layer.Vector



    geojsonFormat = new ol_format.GeoJSON()


    pFeatures = Array<ol.Feature>()


    @Watch("layer")
    onLayerChange() {
        this.init()
    }


    init() {
        if (this.layer == undefined) {
            return
        }

        let source = this.layer.getSource()

        source.on("change", this.updateClippedFeatures)
    }


    mounted() {

        // NOTE: 
        // Initial registration with an empty array is required to avoid an annoying reinstantiation 
        // of the parent component when updateClippedFeatures() is called for the first time.
        this.register([])

        this.init()
    }


    @Watch('clipCoords')
    onClipCoordsChange(oldVal: any, newVal: any) {

        if (JSON.stringify(oldVal) == JSON.stringify(newVal)) {
            return
        }

        if (this.layer == null || this.clipCoords == undefined) {
            return
        }

        this.updateClippedFeatures()

    }


    /*
    get clipArea_m2(): number {

        if (this.clipCoords == undefined) {
            return 0
        }

        let geojson = { "type": "MultiPolygon", "coordinates": [this.clipCoords] }

        let geom = this.geojsonFormat.readGeometry(geojson) as ol_geom.MultiPolygon

        return geom.getArea()
    }
    */


    get clipExtent(): Extent {

        if (this.clipCoords == undefined || this.clipCoords.length == 0) {
            return [0, 0, 0, 0]
        }

        //############### BEGIN Calculate clipping geometry extent ###############
        let minx = Number.POSITIVE_INFINITY
        let miny = Number.POSITIVE_INFINITY
        let maxx = Number.NEGATIVE_INFINITY
        let maxy = Number.NEGATIVE_INFINITY


        for (let coordinate of this.clipCoords[0]) {

            minx = Math.min(minx, coordinate[0])
            miny = Math.min(miny, coordinate[1])
            maxx = Math.max(maxx, coordinate[0])
            maxy = Math.max(maxy, coordinate[1])
        }

        let extent = [minx, miny, maxx, maxy] as Extent

        return extent
        //############### END Calculate clipping geometry extent ###############

    }


    updateClippedFeatures() {
        let source = this.layer.getSource()

        if (!(source instanceof ol_source.Vector)) {
            return
        }

        //################### BEGIN Generate clipped features #################
        let geojson = { "type": "MultiPolygon", "coordinates": [this.clipCoords] }

        let clipGeom = this.geojsonFormat.readGeometry(geojson) as ol_geom.MultiPolygon

        let f = Array<ol.Feature>()

        source.forEachFeatureInExtent(this.clipExtent, (feature => {

            let coords = (feature.getGeometry() as ol_geom.Point).getCoordinates()

            if (clipGeom.intersectsCoordinate(coords)) {
                f.push(feature)
            }
        }))
        //################### END Generate clipped features #################

        this.register(f)
    }
}
