//############ BEGIN OpenLayers imports ###########
import * as ol_geom from 'ol/geom'
import * as ol_layer from 'ol/layer'
import * as ol_source from 'ol/source'
import * as ol_style from 'ol/style'
import { StyleFunction } from 'ol/style/Style'
import BaseEvent from 'ol/events/Event'
import FillPattern from 'ol-ext/style/FillPattern'
//############ END OpenLayers imports ###########

import { formatNumberString } from "tivigi/src/util/formatters"
import { ColorRGBA } from 'tivigi/src/util/ColorRGBA'
import { tryToRead } from 'tivigi/src/util/tryToRead'


export function quantilesStyleFactory(layer: ol_layer.Vector, styleConfig: any = {}): StyleFunction {

    //############# BEGIN Try to read style parameters from config ############         

    // NOTE: 'numQuantiles' is the *number of threshold values* at the border between two classifications,
    // and not the *number of classifications*. The number of classifications is numQuantiles + 1.

    let lineColor = new ColorRGBA(tryToRead(styleConfig, "lineColor", [0, 0, 0, 255]));
    let lineWidth = tryToRead(styleConfig, "lineWidth", 1)
    let numQuantiles = tryToRead(styleConfig, "numQuantiles", 2);
    let colorStart = new ColorRGBA(tryToRead(styleConfig, "colorRampStart", [239, 243, 255, 255]));
    let colorEnd = new ColorRGBA(tryToRead(styleConfig, "colorRampEnd", [8, 81, 156, 255]));
    //############# END Try to read style parameters from config ############


    // Note that the following variables, including 'layer' and 'styleConfig' persist after the end of 
    // this function since they are accessed by the closure functions 'onSourceChange' and 'styleFunction'.
    // This way, they are used as 'persistent storage' for the values they hold, and to exchange them between
    // those closure functions without having to set up some sort of explicit store or "message passing".

    let source = layer.getSource() as ol_source.Vector

    //########## BEGIN Create colors array ##########
    let colors = Array<ColorRGBA>()

    let colorDiff = colorEnd.sub(colorStart)

    for (let ii = 0; ii <= numQuantiles; ii++) {
        colors.push(colorStart.add(colorDiff.mult((1.0 / numQuantiles) * ii)).round())
    }
    //########## END Create colors array ############

    let noDataColor = new ColorRGBA([170, 170, 170, 1]);

    let quantiles: Array<number> | undefined = undefined


    // TODO: 3 Setting up a source change event handler and writing layer.get('legend') in here is not very clean.
    // Also, perhaps try to separate the creation of the OpenLayers style function from the creation of the legend?

   
    //#################### BEGIN On source change, recalculate quantiles and update legend ##################
    let onSourceChange = function (e: BaseEvent) {

        if (source.getState() != 'ready') {
            return
        }

        // Recalculate quantiles:
        quantiles = computeQuantiles(layer, numQuantiles)

        // Update legend:
        let legend = makeQuantilesLegend(quantiles, colors, noDataColor, lineColor, lineWidth)

        layer.set('legend', legend)
    }

    source.on('change', onSourceChange)
    //#################### END On source change, recalculate quantiles and update legend ##################



    let quantilesStyleFunction = function (feature: any): ol_style.Style[] {

        let actualLineWidth = lineWidth

        if (feature.get("hover")) {
            actualLineWidth = 5
        }

        // NOTE: 'quantiles' should never be undefined here, but adding this code removed a TypeScript compiler error:
        if (quantiles == undefined) {
            quantiles = computeQuantiles(layer, numQuantiles)
        }

        // ATTENTION: When quantilesStylesFactory() is called, the features are not loaded yet. The HTTP request to
        // load them is only triggered when the layer is added to the map for the first time, and then, we still have
        // to wait for the response. This means that the quantiles can't yet be calculated when quantilesStylesFactory()
        // is called. To solve this, we initialize 'quantiles' as 'undefined' and calculate the quantiles when the styleFunc()
        // is called for the first time. This is when the layer is drawn for the first time, i.e. after the features are loaded.
        // After we have calculated the quantiles, we cache them in the 'quantiles' variable, which is from this moment on
        // no longer 'undefined', and the check for this prevents unneccessary repeated re-calculation on each redraw.

        let attributeName = layer.get('attribute')


        let attributeValue = feature.get(attributeName)

        //############ BEGIN Select correct quantile color for the current feature ###########
        // Initialize with the color for the highest value, since this can not be reached
        // by the following for loop which tries to find the feature's quantile.

        // ATTENTION: Here, we have to substract 2 from quantiles.length to get the correct index for the colors array.
        // This is for three combined reasons:

        // 1.) Usually, if the colors and quantiles array had the same length, it would be -1, since 'length - 1' is the last
        // index of an array. But:

        // 2.) There is one color less than the quantile values, since the colors to not represent the quantile values,
        // but the value regions *between* them. This would change the index difference to 0 (no index decrement because 'colors'
        // is 1 shorter than 'quantiles'). Again, but:

        // 3.) The quantiles array has 2 additional entries: The minimum value as the first entry (in front of the actual 
        // quantile values) and the maxium value as the last entry (behind the quantile values). These two additional values
        // in the quantiles array finally result in an index difference of -2.

        let fillColor = colors[quantiles.length - 2]

      
        let numericAttributeValue = parseFloat(attributeValue)

        if (isNaN(numericAttributeValue)) {

            let p = "hatch"
            fillColor = noDataColor

            let result = []


            result.push(new ol_style.Style({
                fill: new FillPattern(
                    {
                        pattern: p,
                        //image: (p == 'Image (PNG)') ? new ol.style.Icon({ src: imgFile }) : undefined,
                        ratio: 1,
                        //icon: p == 'Image (PNG)' ? new ol.style.Icon({ src: 'data/target.png' }) : undefined,
                        color: noDataColor.toHexString(false),
                        //offset: Number($("#offset").val()),
                        scale: 1.5,
                        fill: new ol_style.Fill({ color: '#dddddd' }),
                        //size: Number($("#size").val()),
                        spacing: 7,
                        angle: 45
                    })
            }))
            
            return result
            
        }
        else {

            // Note that we start at 1 here because index 0 is the minimum, and end before length - 1, 
            // beceause the last entry is the maximum:
            for (let ii = 1; ii < quantiles.length - 1; ii++) {

                if (numericAttributeValue < quantiles[ii]) {

                    // Again, index - 1 here to get the corresponding color value:
                    fillColor = colors[ii - 1]
                    break
                }
            }
        }
        //############ END Select correct quantile color for the current feature ###########

        // Create style for points:
        if (feature.getGeometry() instanceof ol_geom.Point || feature.getGeometry() instanceof ol_geom.MultiPoint) {

            let result = []
            result.push(new ol_style.Style({

                image: new ol_style.Circle({
                    radius: 6,
                    fill: new ol_style.Fill({ color: fillColor.toRgbaString() }),
                    stroke: new ol_style.Stroke({ color: lineColor.toRgbaString(), width: actualLineWidth })
                })
            }))

            return result
        }

        // Create style for lines and polygons:
        else {

            let result = []
            
            let fc = fillColor.copy()

            if (feature.get("hover")) {
               //fc.changeBrightnessByPercent(-25)
               fc = new ColorRGBA([255,100,100,1])
            }
            if (feature.get("select")) {
                //fc.changeBrightnessByPercent(-25)
                fc = new ColorRGBA([255,255,100,1])
             }
         
            

            result.push(new ol_style.Style({

                stroke: new ol_style.Stroke({
                    color: lineColor.toRgbaString(),
                    width: lineWidth
                }),

                fill: new ol_style.Fill({
                    color: fc.toRgbaString()
                })
            }))


            return result
        }
    };


    return quantilesStyleFunction
}



function computeQuantiles(layer: ol_layer.Layer, numQuantiles: number): Array<number> {

    //############ BEGIN Update min/max and the ordered list of values ###########
    let attribute = layer.get('attribute')

    let source = layer.getSource() as ol_source.Vector

    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY

    let values = []

    for (let f of source.getFeatures()) {

        // NOTE: 
        //let value = parseFloat(f.get(attribute))
        let value = f.get(attribute)


        if (value != Number.NaN && value != null && value != undefined) {
            values.push(value)

            if (value < min) min = value
            if (value > max) max = value
        }
        else {
            //    console.log("NAN: " + value)
        }
    }

    values.sort((a: number, b: number) => a - b)
    //############ END Update min/max and the ordered list of values ###########


    // Create the result array:
    let result = Array<number>()


    // Add min value as first element of the result array:
    result.push(min)

    //########### BEGIN Calculate quantiles and add them to the results array ###########

    let stepSize = 1.0 / (numQuantiles + 1)

    let p = stepSize

    while (p < 1) {

        let bla = (values.length + 1) * p

        let i = Math.floor(bla)
        let f = bla - i

        let xi1 = values[i]
        let xi2 = values[i + 1]

        let xp = (1 - f) * xi1 + f * xi2

        result.push(xp)

        p += stepSize
    }
    //########### END Calculate quantiles and add them to the results array ###########

    // Add max value as last element of the result array:
    result.push(max)
    
    return result
}



function makeQuantilesLegend(quantiles: Array<number>, colors: Array<ColorRGBA>, noDataColor: ColorRGBA, lineColor: ColorRGBA, lineWidth: number) : any {

    let result = {
        "Legend": [
            {
                "layerName": "",
                "title": "",
                "rules": new Array<any>()
            }
        ]
    }
    

    for (let ii = 0; ii < quantiles.length - 1; ii++) {

        let fillColor = colors[ii]

        let from = quantiles[ii]
        let to = quantiles[ii + 1]

        let rule: any = {

            "name": formatNumberString(from, 2, ".", "") + " bis < " + formatNumberString(to, 2, ".", ""),

            // NOTE: Microsoft Edge Legacy does not support hex RGBA values as CSS background-color. 
            // Thus, we have to define the colors here without the alpha channel.

            "symbolizers": [
                {
                    "Polygon": {
                        "stroke": lineColor.toHexString(false),
                        "stroke-width": lineWidth,
                        "stroke-opacity": "1",
                        "stroke-linecap": "butt",
                        "stroke-linejoin": "miter",
                        "fill": fillColor.toHexString(false),
                        "fill-opacity": "1.0"
                    }
                }
            ]
        }

        result.Legend[0].rules.push(rule)
    }


    let rule_nodata: any = {

        "name": "Keine Daten verfügbar",

        // NOTE: Microsoft Edge Legacy does not support hex RGBA values as CSS background-color. 
        // Thus, we have to define the colors here without the alpha channel.

        "symbolizers": [
            {
                "Polygon": {
                    "stroke": lineColor.toHexString(false),
                    "stroke-width": lineWidth,
                    "stroke-opacity": "1",
                    "stroke-linecap": "butt",
                    "stroke-linejoin": "miter",
                    "fill": noDataColor.toHexString(false),
                    "fill-opacity": "1.0"
                }
            }
        ]
    }

    result.Legend[0].rules.push(rule_nodata)

    return result
}