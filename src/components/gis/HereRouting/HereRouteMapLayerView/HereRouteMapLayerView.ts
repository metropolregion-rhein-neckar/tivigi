import { Component, Vue, Prop, Watch } from 'vue-property-decorator';


import * as ol from 'ol'
import * as ol_source from 'ol/source'
import * as ol_format from 'ol/format'
import * as ol_layer from 'ol/layer'
import * as ol_style from 'ol/style'

import * as turf from '@turf/turf'
import { flexPolylineToLineString } from 'tivigi/src/util/here-flexpolyline';


import WithRender from './HereRouteMapLayerView.html';
import { FeatureLike } from 'ol/Feature';
import { getActionImageUrl } from 'tivigi/src/components/gis/HereRouting/hereRoutingUtils';



@WithRender
@Component({
    components: {

    }
})
export default class HereRouteMapLayerView extends Vue {

    @Prop({ default: null })
    route: any


    @Prop()
    map!: ol.Map;


    //################# BEGIN Set up vector layers #################
    vectorSource_routes: ol_source.Vector = new ol_source.Vector()

    vectorLayer_routes = new ol_layer.Vector({
        source: this.vectorSource_routes,

        //@ts-ignore
        title: "Routing: Berechnete Route"
    });
    //################# END Set up vector layers #################


    //################# BEGIN Set up vector layers #################
    vectorSource_actionPoints: ol_source.Vector = new ol_source.Vector()

    vectorLayer_actionPoints = new ol_layer.Vector({
        source: this.vectorSource_actionPoints,

        //@ts-ignore
        title: "Routing: Action Points"
    });
    //################# END Set up vector layers #################



    @Watch("route")
    onRouteChange() {

        this.vectorSource_routes.clear()

        if (this.route == null) {
            // TODO: 2 Remove route layer
            return
        }


        // TODO: 3 Is it always only 1 route and section?
        let lineString = flexPolylineToLineString(this.route.sections[0].polyline)


        //################### BEGIN Create route LineString GeoJSON ################
        let geojson = {
            "type": "FeatureCollection",
            "name": "Strecken xDataToGo",

            "features": [
                {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": lineString
                    }
                }]
        }
        //################### END Create route LineString GeoJSON ################


        this.vectorSource_routes.addFeatures((new ol_format.GeoJSON()).readFeatures(geojson, {
            featureProjection: 'EPSG:3857'
        }))


        //##################### BEGIN Add action locations #######################
        let turfLinestring = turf.lineString(lineString)



        let currentOffset = 0

        let geojson2 = {
            "type": "FeatureCollection",
            "name": "Action Points",

            "features": Array<any>()
        }

        for (let section of this.route.sections) {
            for (let action of section.actions) {


                if (action.offset != undefined) {
                    currentOffset += action.offset
                }

                let actionFeature: any = turf.along(turfLinestring, currentOffset, { units: 'meters' });


                actionFeature.properties.action = action

                geojson2.features.push(actionFeature)


                if (action.length != undefined) {
                    currentOffset += action.length
                }

                //console.log(currentOffset)
            }
        }

        this.vectorSource_actionPoints.addFeatures((new ol_format.GeoJSON()).readFeatures(geojson2, {
            featureProjection: 'EPSG:3857'
        }))

        //##################### END Add action locations #######################
    }


    beforeDestroy() {

        this.map.removeLayer(this.vectorLayer_actionPoints)
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


        let styleFunc_actions = function (feature: FeatureLike, resolution: number): ol_style.Style | ol_style.Style[] {
            
            let action = feature.getProperties()["action"]

            console.log(action)
            let imgUrl = getActionImageUrl(action)
            
            let scale = 0.05

            if (action.mouseOver == true) {
                scale = 0.1
            }
            return new ol_style.Style({

                image: new ol_style.Icon({
                    crossOrigin: 'anonymous',
                    src: imgUrl,
                    scale: scale
                })

            })
        }

        this.vectorLayer_actionPoints.setStyle(styleFunc_actions)



        let layers = this.map.getLayers().getArray()


        if (!layers.includes(this.vectorLayer_routes)) {
            this.map.addLayer(this.vectorLayer_routes)
        }

        this.vectorLayer_routes.setZIndex(10)
        this.vectorLayer_routes.setVisible(true)


        if (!layers.includes(this.vectorLayer_actionPoints)) {
            this.map.addLayer(this.vectorLayer_actionPoints)
        }

        this.vectorLayer_actionPoints.setZIndex(11)
        this.vectorLayer_actionPoints.setVisible(true)
    }
}
