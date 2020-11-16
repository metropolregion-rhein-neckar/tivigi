import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol'
import * as ol_proj from 'ol/proj'
import * as ol_source from 'ol/source'
import * as ol_format from 'ol/format'
import * as ol_layer from 'ol/layer'
import * as ol_style from 'ol/style'
import * as ol_geom from 'ol/geom'

import LocationInput from '../LocationInput/LocationInput'


import WithRender from './HereRouting.html';

@WithRender
@Component({
    components: {
        LocationInput

    }
})
export default class HereRouting extends Vue {


    @Prop()
    map!: ol.Map;

    @Prop({ default: '' })
    hereAppId! : string

    @Prop({ default: '' })
    hereAppCode! : string

    transportModeOptions = ["car", "truck"]
    transportMode = "car"

    mapPickState = false


    //############### BEGIN Computed property addBlockadeMode #############
    _addBlockadeMode = false

    get addBlockadeMode(): boolean {
        return this._addBlockadeMode
    }


    set addBlockadeMode(newval: boolean) {
        this._addBlockadeMode = newval

        let mapDiv = this.map.getTarget() as HTMLDivElement

        if (this._addBlockadeMode) {
            mapDiv.style.cursor = "crosshair"
            this.map.on('click', this.onMapClick_addBlockade)
        }
        else {
            mapDiv.style.cursor = ""
            this.map.un('click', this.onMapClick_addBlockade)
        }
    }
    //############### END Computed property addBlockadeMode #############


    vectorSource_routes = new ol_source.Vector()
    vectorSource_blockades = new ol_source.Vector()

    vectorLayer_routes = new ol_layer.Vector({
        source: this.vectorSource_routes,

        //@ts-ignore
        title: "Routing: Berechnete Route"
    });

    vectorLayer_blockades = new ol_layer.Vector({
        source: this.vectorSource_blockades,

        //@ts-ignore
        title: "Routing: Blockierte Bereiche"
    });

    coords_start = [0, 0]
    coords_end = [0, 0]


    beforeDestroy() {
        this.map.removeLayer(this.vectorLayer_blockades)
        this.map.removeLayer(this.vectorLayer_routes)
    }


    mounted() {

        let styleFunc_routes = function () {
            return new ol_style.Style({
                stroke: new ol_style.Stroke({
                    color: '#00f',
                    //lineDash: [4],
                    width: 2.5
                })
            })
        }

        this.vectorLayer_routes.setStyle(styleFunc_routes)


        let styleFunc_blockades = function () {
            return new ol_style.Style({

                /*
                stroke: new ol_style.Stroke({
                    color: '#00f',
                    //lineDash: [4],
                    width: 2.5
                }),
*/
                image: new ol_style.Icon({
                    crossOrigin: 'anonymous',
                    src: "img/no-entry.svg",
                    scale: 0.05
                })

            })
        }


        this.vectorLayer_blockades.setStyle(styleFunc_blockades)

        let layers = this.map.getLayers().getArray()

        if (!layers.includes(this.vectorLayer_blockades)) {
            this.map.addLayer(this.vectorLayer_blockades)
        }

        if (!layers.includes(this.vectorLayer_routes)) {
            this.map.addLayer(this.vectorLayer_routes)
        }

        this.vectorLayer_routes.setZIndex(10)
        this.vectorLayer_blockades.setZIndex(11)


        this.vectorLayer_blockades.setVisible(true)
        this.vectorLayer_routes.setVisible(true)
    }


    onAddBlockadeButtonClick() {
        this.addBlockadeMode = true
    }


    onClearBlockadesButtonClick() {
        this.vectorSource_blockades.clear()
    }

    onClearRoutesButtonClick() {
        this.vectorSource_routes.clear()

    }

    onMapClick_addBlockade(evt: ol.MapBrowserEvent) {
        this.addBlockadeMode = false

        let wp0_4326 = ol_proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326')

        let geom = new ol_geom.Point(evt.coordinate)

        let feature = new ol.Feature(geom)

        this.vectorSource_blockades.addFeature(feature)
    }

    route() {

        let transformed_start = ol_proj.transform(this.coords_start, 'EPSG:3857', 'EPSG:4326')
        let transformed_end = ol_proj.transform(this.coords_end, 'EPSG:3857', 'EPSG:4326')

        let waypoint0 = transformed_start[1] + "," + transformed_start[0]
        let waypoint1 = transformed_end[1] + "," + transformed_end[0]


        let limit_height_meters = 4.25
        let limit_weight_tons = 30.5

        // width must be between 0 and 50
        let limit_width_meters = 0

        // TODO: 2 Switch to API key authentication(https://route.ls.hereapi.com)       

        // TODO: 3 Understand why accessing the coordinate arrays through the computed properties doesn't work here.

        let url = new URL("https://route.api.here.com/routing/7.2/calculateroute.json")

        url.searchParams.append("app_id", this.hereAppId)
        url.searchParams.append("app_code", this.hereAppCode)

        url.searchParams.append("waypoint0", "geo!" + waypoint0)
        url.searchParams.append("waypoint1", "geo!" + waypoint1)
        url.searchParams.append("mode", "fastest;" + this.transportMode + ";traffic:disabled")

        //######### BEGIN Size limitations ###########
        url.searchParams.append("limitedWeight", limit_weight_tons.toString())
        url.searchParams.append("height", limit_height_meters.toString())

        if (limit_width_meters > 0) {
            url.searchParams.append("width", limit_width_meters.toString())
        }
        //######### END Size limitations ###########

        //########### BEGIN What to return ###########
        url.searchParams.append("routeAttributes", "shape")
        url.searchParams.append("maneuverAttributes", "direction")
        //########### END What to return ###########


        let blockades = this.vectorSource_blockades.getFeatures()


        if (blockades.length > 0) {

            let areasStringPieces = []

            let radius = 20

            for (let blockade of blockades) {
                let geom = blockade.getGeometry() as ol_geom.Point

                let coords = geom.getCoordinates()

                let topLeft = [coords[0] - radius, coords[1] + radius]
                let bottomRight = [coords[0] + radius, coords[1] - radius]

                let topLeft_4326 = ol_proj.transform(topLeft, 'EPSG:3857', 'EPSG:4326')
                let bottomRight_4326 = ol_proj.transform(bottomRight, 'EPSG:3857', 'EPSG:4326')

                areasStringPieces.push(topLeft_4326[1] + "," + topLeft_4326[0] + ";" + bottomRight_4326[1] + "," + bottomRight_4326[0])
            }

            url.searchParams.append("avoidareas", areasStringPieces.join("!"))
        }

        fetch(url.toString()).then(response => response.json()).then(data => this.processSearchResult(data))
    }


    processSearchResult(data: any) {


        this.vectorSource_routes.clear()


        let shapeBla = data.response.route[0].shape

        let geojson = {
            "type": "FeatureCollection",
            "name": "Strecken xDataToGo",

            "features": [
                {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [] as Array<Array<number>>
                    }
                }]
        }


        for (let pointString of shapeBla) {
            let coords = pointString.split(',')

            geojson.features[0].geometry.coordinates.push([parseFloat(coords[1]), parseFloat(coords[0])])
        }


        this.vectorSource_routes.addFeatures((new ol_format.GeoJSON()).readFeatures(geojson, {
            featureProjection: 'EPSG:3857'
        }))

    }
}
