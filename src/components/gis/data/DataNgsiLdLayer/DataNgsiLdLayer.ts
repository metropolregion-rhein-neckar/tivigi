import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol'
import * as ol_layer from 'ol/layer'
import * as ol_source from 'ol/source'
import * as ol_format from 'ol/format'
import * as ol_style from 'ol/style'
import WithRender from './DataNgsiLdLayer.html';
import { addStyleFunctionToLayer, multiStyleFunctionFactory } from 'tivigi/src/olVectorLayerStyling/styleUtils';
import { ColorRGBA } from 'tivigi/src/util/ColorRGBA';


@WithRender
@Component({})
export default class DataNgsiLdLayer extends Vue {

    //############# BEGIN Props ##############
    @Prop({})
    map!: ol.Map

    @Prop()
    maxResolution!: number

    @Prop({ default: false })
    visible!: boolean

    @Prop()
    out!: ol_layer.Vector

    @Prop({ default: 0 })
    zIndex!: number

    @Prop()
    entities!: any

    @Prop()
    layerId!: any

    //############# END Props ##############




    source = new ol_source.Vector()
    layer = new ol_layer.Vector({ source: this.source })

    @Watch('map')
    onMapChange() {

        if (!(this.map instanceof ol.Map)) {
            console.log("no map")
            return
        }


        //########### BEGIN Check if layer with same ID already exists in the map ############

        // If a layer with the same ID already exists, we assign it to "this.layer" to that
        // further changes made through/by this component are applied to the correct layer.

        // TODO: Do we need to compare layer IDs or can we work with object identity?

        /*
        let layerIsInMap = false

        for (let otherLayer of this.map.getLayers().getArray()) {
    
            if (otherLayer.get("id") == this.layerId) {
                this.layer = otherLayer as ol_layer.Vector
                layerIsInMap = true
                break

            }
        }
        */

        let layerIsInMap = this.map.getLayers().getArray().includes(this.layer)

        if (!layerIsInMap) {
            this.map.addLayer(this.layer)
        }
    }


    @Watch('entities', {deep:true})
    onEntitiesChange() {
        
        this.source.clear()

        if (this.entities instanceof Array) {

            const geoJson = {
                'type': 'FeatureCollection',
                'crs': {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:4326',
                    },
                },
                "features": [] as Array<any>
            }
    
            const geojsonFormat = new ol_format.GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: this.map.getView().getProjection() })

            
            for (const entity of this.entities) {

                if (!(entity["location"] instanceof Array)) {
                    console.log("no geometry")
                    continue
                }


                // TODO: Don't hard-code location attribute instance
                const feature: any = {
                    "type": "Feature",
                    "properties": { "entity": entity }                    
                }

                if (entity.location instanceof Array && entity.location.length > 0) {
                    feature["geometry"] = JSON.parse(JSON.stringify(entity["location"][0].value))
                }


                geoJson.features.push(feature)
            }


            this.source.addFeatures(geojsonFormat.readFeatures(geoJson))

        }

        this.source.changed()
    }



    @Watch('visible')
    onVisibleChange() {
        this.layer.setVisible(this.visible)
    }


    @Watch('zIndex')
    onZIndexChange() {
        this.layer.setZIndex(this.zIndex)
    }


    created() {
        this.layer.set("id", this.layerId)

        if (this.maxResolution != undefined) {
            this.layer.setMaxResolution(this.maxResolution)
        }

        this.layer.setVisible(this.visible)
        this.layer.setZIndex(this.zIndex)

        this.layer.setStyle(multiStyleFunctionFactory(this.layer))



        const defaultStyleFunc = (feature: any): ol_style.Style[] => {

            let result = []
            let fc = new ColorRGBA([100, 100, 200, 0.5])

            let lineColor = new ColorRGBA([0, 0, 0, 0.5])

          
            result.push(new ol_style.Style({

                stroke: new ol_style.Stroke({
                    color: lineColor.toRgbaString(),
                    width: 1
                }),

                fill: new ol_style.Fill({
                    color: fc.toRgbaString()
                })

            }))

            return result
        }


        addStyleFunctionToLayer(this.layer, "default", defaultStyleFunc)

        this.$emit("update:out", this.layer)
    }
}