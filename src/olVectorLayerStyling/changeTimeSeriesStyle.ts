// ATTENTION: This is NGSI-LD-specific

//############ BEGIN OpenLayers imports ###########
import * as ol_geom from 'ol/geom'
import * as ol_source from 'ol/source'
import * as ol_style from 'ol/style'
import { StyleFunction } from 'ol/style/Style'
import FillPattern from 'ol-ext/style/FillPattern'
//############ END OpenLayers imports ###########

import { formatNumberString } from "tivigi/src/util/formatters"
import { ColorRGBA } from 'tivigi/src/util/ColorRGBA'
import { tryToRead } from 'tivigi/src/util/tryToRead'


export class StyleAndLegend {
    constructor(public style: StyleFunction, public legend: any) {

    }
}


export function changeTimeSeriesStyleFactory(source: ol_source.Vector, attributeName: string, timestamp: string, styleConfig: any = {}): StyleAndLegend {

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


    //########## BEGIN Create colors array ##########
    let colors = Array<ColorRGBA>()

    let colorDiff = colorEnd.sub(colorStart)

    for (let ii = 0; ii <= numQuantiles; ii++) {
        colors.push(colorStart.add(colorDiff.mult((1.0 / numQuantiles) * ii)).round())
    }
    //########## END Create colors array ############

    const noDataColor = new ColorRGBA([170, 170, 170, 1]);


 //     const quantiles = computeQuantiles(source, attributeName, timestamp, numQuantiles)


    //    const legend = makeChangeLegend(quantiles, colors, noDataColor, lineColor, lineWidth)

/*
    const quantilesStyleFunction = function (feature: any): ol_style.Style[] {

        let actualLineWidth = lineWidth

        const props = feature.getProperties()

        //####### BEGIN Get attribute ##########
        let attribute = props["entity"][attributeName]

        if (!(attribute instanceof Array)) {
            attribute = [attribute]
        }
        //####### END Get attribute ##########


        let attributeValue = undefined

        for (const instance of attribute) {
            if (instance == undefined) {
                continue
            }

            if (instance.observedAt == timestamp) {
                attributeValue = instance.value
            }
        }

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

          

            const entity = feature.getProperties().entity



            if (entity._selected) {
                // actualLineWidth = 3
                //  fc = fc.changeBrightnessByPercent(-25)
                fc = new ColorRGBA([255, 100, 100, 1])
            }
            else {
                actualLineWidth = 1
            }


            result.push(new ol_style.Style({

                stroke: new ol_style.Stroke({
                    color: lineColor.toRgbaString(),
                    width: actualLineWidth
                }),

                fill: new ol_style.Fill({
                    color: fc.toRgbaString()
                })
            }))

            return result
        }
    };
*/



    const quantilesStyleFunction = function (feature: any): ol_style.Style[] {

        let actualLineWidth = lineWidth

        const props = feature.getProperties()

        //####### BEGIN Get attribute ##########
        let attribute = props["entity"][attributeName]

        if (attribute == undefined) {
            attribute = []
        }

        if (!(attribute instanceof Array)) {
            attribute = [attribute]
        }


        // ATTENTION: Copying the attribute array here is ABSOLUTELY required! We must not modify the original array!
        attribute = JSON.parse(JSON.stringify(attribute))


        attribute.sort((a: any, b: any) => {
            if (a.observedAt > b.observedAt) {
                return 1
            }
            else if (a.observedAt < b.observedAt) {
                return -1
            }
            else {
                return 0
            }
        })

        
        //####### END Get attribute ##########


      
        

        let value = 1


        for (let ii = 0; ii < attribute.length; ii++) {
            let instance = attribute[ii]


            if (instance == undefined) {
                continue
            }

            if (instance.observedAt != timestamp) {
                continue
            }


            if (ii == 0) {
                continue
            }

            let prev = attribute[ii - 1].value
            let now = attribute[ii].value

            value =  now / prev
            break
        }

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

        let fillColor = new ColorRGBA([150,150,150,1])
       

        
       
        if (value > 1) {
            fillColor = new ColorRGBA([50, 200, 50, 1])
        }
        if (value < 1) {
            fillColor = new ColorRGBA([200, 50, 50, 1])
        }

        let attributeValue = undefined

        
        for (const instance of attribute) {
            if (instance == undefined) {
                continue
            }

            if (instance.observedAt != timestamp) {
                continue
                
            }

            attributeValue = instance.value
            break
        }
        
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

            /*
            if (feature.get("hover")) {
                //fc.changeBrightnessByPercent(-25)
                fc = new ColorRGBA([255, 100, 100, 1])
            }
            if (feature.get("select")) {
                //fc.changeBrightnessByPercent(-25)
                fc = new ColorRGBA([255, 255, 100, 1])
            }
            */

            const entity = feature.getProperties().entity



            if (entity._selected) {
                // actualLineWidth = 3
                //  fc = fc.changeBrightnessByPercent(-25)
                fc = new ColorRGBA([255, 100, 100, 1])
            }
            else {
                actualLineWidth = 1
            }


            result.push(new ol_style.Style({

                stroke: new ol_style.Stroke({
                    color: lineColor.toRgbaString(),
                    width: actualLineWidth
                }),

                fill: new ol_style.Fill({
                    color: fc.toRgbaString()
                })
            }))

            return result
        }
    };


    return new StyleAndLegend(quantilesStyleFunction, undefined)
}


function computeQuantiles(source: ol_source.Vector, attributeName: string, timestamp: string, numQuantiles: number): Array<number> {

    //############ BEGIN Update min/max and the ordered list of values ###########

    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY

    let values = []

    for (let f of source.getFeatures()) {


        const props = f.getProperties()

        let attribute = props["entity"][attributeName]

        if (attribute == undefined) {
            attribute = []
        }

        if (!(attribute instanceof Array)) {
            attribute = [attribute]
        }

        attribute = JSON.parse(JSON.stringify(attribute))

        attribute.sort((a:any, b:any) => {
            if (a.observedAt > b.observedAt) {
                return 1
            }
            else if (a.observedAt < b.observedAt) {
                return -1
            }
            else {
                return 0
            }
        })

        for (let ii = 0; ii < attribute.length; ii++) {

            const instance = attribute[ii]

            if (instance == undefined) {
                continue
            }

            if (instance.observedAt != timestamp) {
                continue
            }

            let value = 1

            if (ii > 0) {
                let prev = attribute[ii - 1].value
                let now = attribute[ii].value

                value = now / prev
            }



            if (value != Number.NaN && value != null && value != undefined) {
                values.push(value)

                if (value < min) min = value
                if (value > max) max = value
            }

            break

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



function makeChangeLegend(quantiles: Array<number>, colors: Array<ColorRGBA>, noDataColor: ColorRGBA, lineColor: ColorRGBA, lineWidth: number): any {

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

