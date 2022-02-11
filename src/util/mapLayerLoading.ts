//################## BEGIN OpenLayers imports #################
import * as ol_format from 'ol/format'
import * as ol from 'ol'
import * as ol_layer from 'ol/layer'
import * as ol_source from 'ol/source'
import * as ol_loadingstrategy from 'ol/loadingstrategy'
import * as ol_style from 'ol/style'
import * as ol_image from 'ol/Image'
import * as ol_tile from 'ol/Tile'
import VectorSource from 'ol/source/Vector'
import { StyleFunction } from 'ol/style/Style'
import IconAnchorUnits from 'ol/style/IconAnchorUnits'
import Projection from 'ol/proj/Projection'
import WMSCapabilities from 'ol/format/WMSCapabilities';
import { Geometry } from 'ol/geom'
import { Feature } from 'ol'


//################## END OpenLayers imports #################

//############# BEGIN OL-Ext imports ##############
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster'
//############# END OL-Ext imports ##############

import * as proxyfetch from 'tivigi/src/util/proxyfetch'

import { tryToRead } from 'tivigi/src/util/tryToRead'
import { vectorPointStyleFactory } from 'tivigi/src/olVectorLayerStyling/miscStyleFunctions'
import { multiStyleFunctionFactory, addStyleFunctionToLayer } from 'tivigi/src/olVectorLayerStyling/styleUtils'
import { quantilesStyleFactory } from 'tivigi/src/olVectorLayerStyling/quantilesStyle'
import { jenksStyleFactory} from 'tivigi/src/olVectorLayerStyling/jenksStyle'
import { statisticsStyleFactory } from 'tivigi/src/olVectorLayerStyling/statisticsStyle'
import { manualClassificationStyleFactory } from 'tivigi/src/olVectorLayerStyling/manualClassificationStyle'
import { createWfsLayerFromCapabilities, getWfs100UrlFunction } from 'tivigi/src/util/wfsFunctions'
import { FilterableVectorSource } from 'tivigi/src/util/FilterableVectorSource'
import BaseEvent from 'ol/events/Event'



function async_loadWmsLegend(layer: ol_layer.Layer) {

    let source = layer.getSource()


    function getLegendUrl(format: string = "application/json"): string {

        let url = ""
        let params = null

        if (source instanceof ol_source.ImageWMS) {
            url = source.getUrl() as string
            params = source.getParams()
        }
        else if (source instanceof ol_source.TileWMS) {
            // NOTE: source.getUrls() can in theory be null!
            url = (source.getUrls() as Array<string>)[0]
            params = source.getParams()
        }

        let urlobj = new URL(url)

        urlobj.searchParams.append("request", "GetLegendGraphic")
        urlobj.searchParams.append("format", format)
        urlobj.searchParams.append("version", "1.0")
        urlobj.searchParams.append("layer", params["layers"])


        if (params["STYLES"]) {
            urlobj.searchParams.append("style", params["STYLES"])
        }


        return urlobj.toString()
    }


    let url = getLegendUrl("application/json")


    proxyfetch.proxyfetch(url).then(response => response.json()).then((legend) => {

        // NOTE: Updating the legend this way is not really clean, but I don't see an alternative at the moment.
        layer.set('legend', legend)
    })
}



function createClusterLayerFromConfig(layerConfig: any, projection: Projection, sourceType: string) {

    //################# BEGIN Read cluster settings from JSON ############

    let iconUrl = tryToRead(layerConfig, "clusterSettings.iconUrl", "img/pin_32.png");
    let iconScale = tryToRead(layerConfig, "clusterSettings.iconScale", 1);
    let scaleClusterIcons = tryToRead(layerConfig, "clusterSettings.scaleClusterIcons", false);
    let distance = tryToRead(layerConfig, "clusterSettings.distance", 75);


    let fontWeight = tryToRead(layerConfig, "clusterSettings.fontWeight", 'bold');
    let fontFamily = tryToRead(layerConfig, "clusterSettings.fontFamily", 'Arial');
    let fontSize = tryToRead(layerConfig, "clusterSettings.fontSize", 18);


    let fontFillColor = tryToRead(layerConfig, "clusterSettings.fontFillColor", '#000');

    let fontStrokeColor = tryToRead(layerConfig, "clusterSettings.fontStrokeColor", '#fff');
    let fontStrokeWidth = tryToRead(layerConfig, "clusterSettings.fontStrokeWidth", 4);


    let labelOffsetX = tryToRead(layerConfig, "clusterSettings.labelOffsetX", 15);
    let labelOffsetY = tryToRead(layerConfig, "clusterSettings.labelOffsetY", -13);

    //################# BEGIN Read cluster settings from JSON ############

    //##################### BEGIN Style function ########################
    function getStyle(feature: any) {

        let subfeatures = feature.get('features')

        if (subfeatures == undefined) {
            return
        }

        let size = subfeatures.length;

        let clusterScaleFactor = 1

        if (scaleClusterIcons) {
            let childFeatures = feature.getProperties().features

            if (childFeatures instanceof Array && childFeatures.length > 1) {

                // NOTE: We add +1 to the length here so that clusters 
                // of 2 features are still larger than single features:
                clusterScaleFactor = Math.log(childFeatures.length + 1)

            }
        }


        // Expected font style schema: 'bold 18px Arial'                

        let fontStyle = fontWeight + " " + fontSize * clusterScaleFactor + "px " + fontFamily;
        let hoverScale = 1

        let isHover = false
        let zIndex = 0

        if (feature.get("hover")) {
            isHover = true
        }

        //######### BEGIN Check hover state of cluster subfeatures #########
        for (let sf of subfeatures) {
            if (sf.get("hover")) {
                isHover = true
                break
            }
        }
        //######### END Check hover state of cluster subfeatures #########

        if (isHover) {
            hoverScale = 1.35
            zIndex = 1
        }


        //################## BEGIN Cluster size label ###################
        let text1 = undefined

        if (size > 1) {
            text1 = new ol_style.Text({
                text: size.toString(),

                font: fontStyle,

                fill: new ol_style.Fill({
                    color: fontFillColor
                }),

                stroke: new ol_style.Stroke({ color: fontStrokeColor, width: fontStrokeWidth }),

                offsetX: labelOffsetX * clusterScaleFactor * iconScale * hoverScale,
                offsetY: labelOffsetY * clusterScaleFactor * iconScale * hoverScale
            })
        }
        //################## END Cluster size label ###################

        //################## BEGIN Icon ###################
        let style1 = new ol_style.Style({

            image: new ol_style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: IconAnchorUnits.FRACTION,
                anchorYUnits: IconAnchorUnits.FRACTION,
                src: iconUrl,
                scale: iconScale * clusterScaleFactor * hoverScale,
                crossOrigin: 'anonymous',
            }),
            text: text1
        });
        //################## END Icon ###################

        return [style1];
    }
    //##################### END Style function ########################

    let backendSource = undefined

    if (sourceType == "wfs") {
        backendSource = new ol_source.Vector({
            format: new ol_format.GeoJSON(),

            url: getWfs100UrlFunction(layerConfig.baseUrl, layerConfig.urlParams, projection.getCode()),
            strategy: ol_loadingstrategy.bbox

        })
    }

    // for "geojson":
    else {

        //backendSource = new ol_source.Vector({
        backendSource = new FilterableVectorSource({

            format: new ol_format.GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: projection }),

            loader: function (extent, resolution, projection) {

                let options: RequestInit = {
                    headers: layerConfig.http_headers
                }

                proxyfetch.proxyfetch(layerConfig.baseUrl, options).then(response => response.json()).then((geojson) => {

                    let that = this as VectorSource

                    let sourceFormat = that.getFormat()

                    if (sourceFormat != undefined) {
                        let features = sourceFormat.readFeatures(geojson) as Feature<Geometry>[]

                        that.addFeatures(features)
                    }
                })

            }
        });
    }



    // Cluster source:
    let source = new ol_source.Cluster({
        distance: distance,
        source: backendSource

    });



    // Cluster layer:
    let layer = new AnimatedCluster({

        source: source,
        animate: true,
        animationDuration: 800,

        style: getStyle as StyleFunction,
        title: layerConfig.treeLabel,
    });


    let legend = {
        "Legend": [
            {
                //"layerName": layerConfig.id,
                "title": layerConfig.title,
                "rules": [
                    {
                        "name": "rule1",
                        "title": layerConfig.title,
                        "abstract": "",
                        "symbolizers": [
                            {
                                "Point": {
                                    "title": layerConfig.title,
                                    "abstract": "",
                                    "url": iconUrl,
                                    "size": "30",
                                    "opacity": "1.0",
                                    "rotation": "0.0",
                                    "graphics": [
                                        {
                                            "external-graphic-url": iconUrl
                                            //"external-graphic-type": "image/png"
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }

    layer.set('legend', legend);

    layer.setStyle(getStyle);

    return layer
}


export function createGeoJsonLayerFromConfig(layerConfig: any, projection: Projection): ol_layer.Vector {

    //####################### BEGIN Define GeoJSON vector source ########################
    let source = new ol_source.Vector({

        format: new ol_format.GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: projection }),

        attributions: layerConfig.attribution,

        loader: function (extent, resolution, projection) {

            let options: RequestInit = { headers: layerConfig.http_headers }

            proxyfetch.proxyfetch(layerConfig.baseUrl, options).then(response => response.json()).then((geojson) => {

                let sourceFormat = source.getFormat()

                if (sourceFormat != undefined) {

                    let features = sourceFormat.readFeatures(geojson) as Feature<Geometry>[]
                    source.addFeatures(features)
                }

            })

        }
    });
    //####################### END Define GeoJSON vector source ########################

    let layer = new ol_layer.Vector({ source });


    let iconUrl = tryToRead(layerConfig, "style.iconUrl", null)
    let iconScale = tryToRead(layerConfig, "style.iconScale", 1)


    if (iconUrl != null) {
        //##################### BEGIN Style function ########################
        let styleFunc: StyleFunction = function getStyle(feature: any) {

            let isHover = false

            if (feature.get("hover")) {
                isHover = true
            }

            if (iconUrl == null) {
                return []
            }

            //################## BEGIN Icon ###################
            let style1 = new ol_style.Style({

                image: new ol_style.Icon({
                    anchor: [0.5, 0.5],
                    anchorXUnits: IconAnchorUnits.FRACTION,
                    anchorYUnits: IconAnchorUnits.FRACTION,
                    src: iconUrl,
                    scale: iconScale,
                    crossOrigin: 'anonymous',
                })
            });
            //################## END Icon ###################

            return [style1];

        }
        //##################### END Style function ########################

        layer.setStyle(styleFunc)

        let legend = {
            "Legend": [
                {
                    //"layerName": layerConfig.id,
                    "title": layerConfig.title,
                    "rules": [
                        {
                            "name": "rule1",
                            "title": layerConfig.title,
                            "abstract": "",
                            "symbolizers": [
                                {
                                    "Point": {
                                        "title": layerConfig.title,
                                        "abstract": "",
                                        "url": iconUrl,
                                        "size": "30",
                                        "opacity": "1.0",
                                        "rotation": "0.0",
                                        "graphics": [
                                            {
                                                "external-graphic-url": iconUrl
                                                //"external-graphic-type": "image/png"
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    
        layer.set('legend', legend);
    }

    return layer
}


export function createWfsLayerFromConfig(layerConfig: any, projection: Projection, useProxy = true): ol_layer.Vector {

    let baseUrl = layerConfig.baseUrl


    let source = new ol_source.Vector({
        format: new ol_format.GeoJSON(),
        attributions: layerConfig.attribution,
        url: getWfs100UrlFunction(baseUrl, layerConfig.urlParams, projection.getCode()),
        strategy: ol_loadingstrategy.bbox

    });

    return new ol_layer.Vector({ source: source });
}


export function createLayerFromConfig(layerConfig: any, projection: Projection): ol_layer.Layer | null {

    let wmsDefaultParams = {
        "VERSION": '1.1.1',
        'FORMAT': 'image/png',
        'TRANSPARENT': 'true',

    }

    let layer: ol_layer.Layer | null = null


    switch (layerConfig.type) {


        case "geojson": {
            layer = createGeoJsonLayerFromConfig(layerConfig, projection)

            break;
        }

        case "geojson-cluster":
            layer = createClusterLayerFromConfig(layerConfig, projection, "geojson")
            break;

        case "geojson-manualclasses": {

            layer = createGeoJsonLayerFromConfig(layerConfig, projection)

            let vectorLayer = layer as ol_layer.Vector

            // Apply multi-style function to the layer.
            // This will merge all style functions in the array layer.get('stylefunctions'):
            let multiStyleFunction = multiStyleFunctionFactory(vectorLayer);
            vectorLayer.setStyle(multiStyleFunction)


            //############## BEGIN Set available styling attributes and initially active styling attribute #############

            let classificationStyleFunction = manualClassificationStyleFactory(layer as ol_layer.Vector, layerConfig.style);
            addStyleFunctionToLayer(vectorLayer, "quantiles", classificationStyleFunction)

            //############## END Set available styling attributes and initially active styling attribute #############

            break;
        }

        case "geojson-statistics": {

            // ATTENTION: 
            // For the statistics layers, we MUST load all features at once! NO partial loading based on map extent!
            // This means, no WFS, at least not with the bounding box loading strategy!
            // This is required to make sure that the statistical values for e.g. styling are calculated correctly!

            layer = createGeoJsonLayerFromConfig(layerConfig, projection)

            let vectorLayer = layer as ol_layer.Vector

            // Apply multi-style function to the layer.
            // This will merge all style functions in the array layer.get('stylefunctions'):
            let multiStyleFunction = multiStyleFunctionFactory(vectorLayer);
            vectorLayer.setStyle(multiStyleFunction)


            //############## BEGIN Set available styling attributes and initially active styling attribute #############

            let attributes = tryToRead(layerConfig.style, "attributes", undefined)

            if (!(attributes instanceof Array)) {
                attributes = Array<string>()
            }

            //################### BEGIN Backward-compatibility fallback ######################
            let attribute = tryToRead(layerConfig.style, "attribute", undefined);
            let attributeModifiers = tryToRead(layerConfig.style, "attributeModifiers", undefined);

            if (attribute != undefined && attributeModifiers instanceof Array) {

                for (let a of attributeModifiers) {
                    attributes.push(attribute + "_" + a)
                }
            }
            //#################### END Backward-compatibility fallback ######################


            if (attributes.length > 0) {
                layer.set("attribute", attributes[0])

                // Quantiles style:
                let statisticsStyleFunction = statisticsStyleFactory(layer as ol_layer.Vector, layerConfig.style);
                addStyleFunctionToLayer(vectorLayer, "statistics", statisticsStyleFunction)
            }

            layer.set("attributes", attributes)



            let labelTemplate = tryToRead(layerConfig, "tooltipTemplate", "<<ATTRIBUTE>>")
            layer.set('tooltipTemplate', labelTemplate)

            //addStyleFunctionToLayer(vectorLayer, "hover", hoverStyleFunction)

            //############## END Set available styling attributes and initially active styling attribute #############

            break;
        }
        case "geojson-quantiles": {

            // ATTENTION: 
            // For the statistics layers, we MUST load all features at once! NO partial loading based on map extent!
            // This means, no WFS, at least not with the bounding box loading strategy!
            // This is required to make sure that the statistical values for e.g. styling are calculated correctly!

            layer = createGeoJsonLayerFromConfig(layerConfig, projection)

            let vectorLayer = layer as ol_layer.Vector

            // Apply multi-style function to the layer.
            // This will merge all style functions in the array layer.get('stylefunctions'):
            let multiStyleFunction = multiStyleFunctionFactory(vectorLayer);
            vectorLayer.setStyle(multiStyleFunction)


            //############## BEGIN Set available styling attributes and initially active styling attribute #############

            let attributes = tryToRead(layerConfig.style, "attributes", undefined)

            if (!(attributes instanceof Array)) {
                attributes = Array<string>()
            }

            //################### BEGIN Backward-compatibility fallback ######################
            let attribute = tryToRead(layerConfig.style, "attribute", undefined);
            let attributeModifiers = tryToRead(layerConfig.style, "attributeModifiers", undefined);

            if (attribute != undefined && attributeModifiers instanceof Array) {

                for (let a of attributeModifiers) {
                    attributes.push(attribute + "_" + a)
                }
            }
            //#################### END Backward-compatibility fallback ######################


            if (attributes.length > 0) {
                layer.set("attribute", attributes[0])

                // Quantiles style:
                let quantilesStyleFunction = quantilesStyleFactory(layer as ol_layer.Vector, layerConfig.style);
                addStyleFunctionToLayer(vectorLayer, "quantiles", quantilesStyleFunction)
            }

            layer.set("attributes", attributes)



            let labelTemplate = tryToRead(layerConfig, "tooltipTemplate", "<<ATTRIBUTE>>")
            layer.set('tooltipTemplate', labelTemplate)

            //addStyleFunctionToLayer(vectorLayer, "hover", hoverStyleFunction)

            //############## END Set available styling attributes and initially active styling attribute #############

            break;
        }
        case "geojson-jenks": {

            // ATTENTION: 
            // For the statistics layers, we MUST load all features at once! NO partial loading based on map extent!
            // This means, no WFS, at least not with the bounding box loading strategy!
            // This is required to make sure that the statistical values for e.g. styling are calculated correctly!

            layer = createGeoJsonLayerFromConfig(layerConfig, projection)

            let vectorLayer = layer as ol_layer.Vector

            // Apply multi-style function to the layer.
            // This will merge all style functions in the array layer.get('stylefunctions'):
            let multiStyleFunction = multiStyleFunctionFactory(vectorLayer);
            vectorLayer.setStyle(multiStyleFunction)


            //############## BEGIN Set available styling attributes and initially active styling attribute #############

            let attributes = tryToRead(layerConfig.style, "attributes", undefined)

            if (!(attributes instanceof Array)) {
                attributes = Array<string>()
            }

            //################### BEGIN Backward-compatibility fallback ######################
            let attribute = tryToRead(layerConfig.style, "attribute", undefined);
            let attributeModifiers = tryToRead(layerConfig.style, "attributeModifiers", undefined);

            if (attribute != undefined && attributeModifiers instanceof Array) {

                for (let a of attributeModifiers) {
                    attributes.push(attribute + "_" + a)
                }
            }
            //#################### END Backward-compatibility fallback ######################


            if (attributes.length > 0) {
                layer.set("attribute", attributes[0])

                // Quantiles style:
                let jenksStyleFunction = jenksStyleFactory(layer as ol_layer.Vector, layerConfig.style);
                addStyleFunctionToLayer(vectorLayer, "jenks", jenksStyleFunction)
            }

            layer.set("attributes", attributes)



            let labelTemplate = tryToRead(layerConfig, "tooltipTemplate", "<<ATTRIBUTE>>")
            layer.set('tooltipTemplate', labelTemplate)

            //addStyleFunctionToLayer(vectorLayer, "hover", hoverStyleFunction)

            //############## END Set available styling attributes and initially active styling attribute #############

            break;
        }

        case "osm": {
            layer = new ol_layer.Tile({ source: new ol_source.OSM() })
            break;
        }


        case "radio-none": {
            layer = new ol_layer.Vector({ source: new ol_source.Vector() });
            break;
        }


        case "stamen": {
            layer = new ol_layer.Tile({ source: new ol_source.Stamen({ layer: layerConfig.stamenStyle }) })
            break
        }

        case "wfs": {
            layer = createWfsLayerFromConfig(layerConfig, projection)
            break;
        }

        case "wfs-capabilities": {
            layer = createWfsLayerFromCapabilities(layerConfig.capabilities, projection)
            break
        }

        case "wfs-points": {
            layer = createWfsLayerFromConfig(layerConfig, projection)

            // NOTE: Here, we copy the layer title from the layerConfig object to the styleConfig. It is used to create the legend.
            layerConfig.style.title = layerConfig.title

            let styleFunction = vectorPointStyleFactory(layer as ol_layer.Vector, layerConfig.style);

            (layer as ol_layer.Vector).setStyle(styleFunction)

            break;
        }

        case "wfs-cluster": {
            layer = createClusterLayerFromConfig(layerConfig, projection, "wfs")
            break;
        }


        case "wms-capabilities": {

            console.log(layerConfig.capabilities)

            layer = createWmsLayerFromCapabilities(layerConfig.capabilities)


            if (layer != null) {

                if (layerConfig.legend_url == undefined) {
                    async_loadWmsLegend(layer)
                }

            }
            break;
        }
        case "wms-statistics":{
            layer = createWmsLayerFromCapabilities(layerConfig.capabilities)


            if (layer != null) {


                let style: any = tryToRead(layerConfig, "style", undefined)
                let source: any = layer.getSource()

                if(style != undefined){
                    // check for attributModifiers in layerConfig, if available overwrite styleString
                    let attributes = tryToRead(layerConfig.style, "attributes", undefined)

                    if (!(attributes instanceof Array)) {
                        attributes = Array<string>()
                    }

                    //################### BEGIN Backward-compatibility fallback ######################
                    let attribute = tryToRead(layerConfig.style, "attribute", undefined);
                    let attributeModifiers = tryToRead(layerConfig.style, "attributeModifiers", undefined);

                    if (attribute != undefined && attributeModifiers instanceof Array) {

                        for (let a of attributeModifiers) {
                            attributes.push(attribute + "_" + a)
                        }
                    }
                    //#################### END Backward-compatibility fallback ######################
                    
                    if (attributes.length > 0) {
                        layer.set("attribute", attributes[0])
                        source.updateParams({"STYLES":attributes[0]})
                    }

                    layer.set("attributes", attributes)
                    //#################### BEGIN On source change, recalculate quantiles and update legend ##################
                    let onSourceChange = function (e: BaseEvent) {

                        if (source.getState() != 'ready') {
                            return
                        }
                        // Recalculate quantiles:
                        let styleString: string = layer!.get('attribute')
                        source.updateParams({"STYLES":styleString})

                        // Update legend:
                        async_loadWmsLegend(layer!)
                    }
                //############# BEGIN Create source object ##############

                source.on('change', onSourceChange)
                //#################### END On source change, recalculate quantiles and update legend ##################

                }

                if (layerConfig.legend_url == undefined) {
                    async_loadWmsLegend(layer)
                }
                console.log(layer)
            }


            break;

        }

        case "wms-tiled": {

            // ATTENTION: We MUST use a custom tile load function here to implement tile loading through the proxy!
            // Simply adding the proxy URL as a prefix to the WMS base URL will BREAK GetLegendGraphic requests
            // and possibly other stuff, too!

            let tileLoadFunction: ol_tile.LoadFunction = function (imageTile: any, src: string) {

                imageTile.getImage().src = proxyfetch.getProxyUrl(src)
            };

            let source = new ol_source.TileWMS({
                attributions: layerConfig.attribution,
                url: layerConfig.baseUrl,
                crossOrigin: 'anonymous',
                params: { ...wmsDefaultParams, ...layerConfig.urlParams },
                tileLoadFunction: tileLoadFunction
            });

            layer = new ol_layer.Tile({ source: source });

            if (layerConfig.legend_url == undefined) {
                async_loadWmsLegend(layer)
            }

            break;
        }


        case "wms-single": {

            // ATTENTION: We MUST use a custom tile load function here to implement tile loading through the proxy!
            // Simply adding the proxy URL as a prefix to the WMS base URL will BREAK GetLegendGraphic requests
            // and possibly other stuff, too!

            let imageLoadFunction: ol_image.LoadFunction = function (image: any, src: string) {
                image.getImage().src = proxyfetch.getProxyUrl(src)
            }

            let source = new ol_source.ImageWMS({
                url: layerConfig.baseUrl,
                params: { ...wmsDefaultParams, ...layerConfig.urlParams },
                projection: projection,
                attributions: layerConfig.attribution,
                ratio: 1,
                crossOrigin: 'anonymous',
                imageLoadFunction: imageLoadFunction
            })

            layer = new ol_layer.Image({ source: source });

            if (layerConfig.legend_url == undefined) {
                async_loadWmsLegend(layer)
            }

            break;
        }


        case "xyz": {

            layer = new ol_layer.Tile({
                source: new ol_source.XYZ({
                    url: proxyfetch.getProxyUrl(layerConfig.url),
                    attributions: layerConfig.attribution
                })
            })
            break
        }
    }





    //####################### BEGIN Set layer parameters ####################

    if (layer == null) {
        return null
    }


    const source = layer.getSource()

    source.setAttributions(layerConfig.attribution)


    if (layerConfig.group) {
        layer.set("exclusive-group", layerConfig.group)
    }

    if (layerConfig.abstract) {
        layer.set('abstract', layerConfig.abstract)
    }

    if (layerConfig.gfiLabelField) {
        layer.set('gfiLabelField', layerConfig.gfiLabelField)
    }

    if (layerConfig.initial != undefined) {
        layer.set('initial', layerConfig.initial)
    }

    if (layerConfig.title) {
        layer.set('title', layerConfig.title)
    }

    if (layerConfig.license) {
        layer.set('license', layerConfig.license)
    }

    if (layerConfig.legend_url != undefined) {

        proxyfetch.proxyfetch(layerConfig.legend_url).then(response => response.json()).then((legend) => {

            // NOTE: Updating the legend this way is not really clean, but I don't see an alternative at the moment.
            layer!.set('legend', legend)
        })
    }

    if (layerConfig.properties) {
        layer.set("propertyLabels", layerConfig.properties)
    }

    //################# BEGIN showFeatureInfo ##################
    if (layerConfig.showFeatureInfo != undefined) {
        layer.set("showFeatureInfo", layerConfig.showFeatureInfo)
    }
    else {
        layer.set("showFeatureInfo", true)
    }
    //################# END showFeatureInfo ##################

    //################# BEGIN showLegend ##################
    if (layerConfig.showLegend != undefined) {
        layer.set("showLegend", layerConfig.showLegend)
    }
    else {
        layer.set("showLegend", true)
    }
    //################# END showLegend ##################

    if (layerConfig.sourceOrganization != undefined) {
        layer.set('sourceOrganization', layerConfig.sourceOrganization)
    }

    if (layerConfig.level != undefined) {
        layer.setZIndex(layerConfig.level)
    }

    //####################### END Set layer parameters ####################

    return layer
}





export function createWmsLayerFromCapabilities(capabilitiesXml: string): ol_layer.Tile | null {

    let capabilities = undefined

    let parser = new WMSCapabilities();
    try {
        capabilities = parser.read(capabilitiesXml);
    }
    catch (exception) {
        console.log("Failed to parse WMS GetCapabilities Document")
        return null
    }


    let layerdefs = capabilities.Capability.Layer.Layer

    if (layerdefs == undefined) {
        return null
    }

    if (layerdefs.length != 1) {
        return null
    }


    let result = new ol_layer.Tile({});


    let layerdef = layerdefs[0]


    let layerBaseUrl = capabilities.Capability.Request.GetMap.DCPType[0].HTTP.Get.OnlineResource

    let styles = []
    for (let style of layerdef.Style) {
        styles.push(style.Name)
    }
    let stylesString = styles.join(",")

    //############# BEGIN Create source object ##############
    let source = new ol_source.TileWMS({
        url: layerBaseUrl,

        //  crossOrigin: 'anonymous',
        params: { "layers": layerdef.Name, "STYLES": stylesString }
    });


    // Remember extent:
    let extent_4326 = layerdef.BoundingBox[0].extent
    source.set('extent_4326', extent_4326)
    //############# END Create source object ##############


    result.setSource(source)

    result.set('title', layerdef.Title)


    return result
}
