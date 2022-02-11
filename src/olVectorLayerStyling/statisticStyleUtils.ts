//############ BEGIN OpenLayers imports ###########
import * as ol_geom from 'ol/geom'
import * as ol_layer from 'ol/layer'
import * as ol_source from 'ol/source'
import * as ol_style from 'ol/style'
import FillPattern from 'ol-ext/style/FillPattern'
//############ END OpenLayers imports ###########

import { formatNumberString } from "tivigi/src/util/formatters"
import { ColorRGBA } from 'tivigi/src/util/ColorRGBA'


export function createColorRamp(colorStart:ColorRGBA, colorEnd:ColorRGBA, numClasses:number): Array<ColorRGBA>{

    let colors = Array<ColorRGBA>()
    let colorDiff = colorEnd.sub(colorStart)

    for (let ii = 0; ii <= numClasses; ii++) {
        colors.push(colorStart.add(colorDiff.mult((1.0 / numClasses) * ii)).round())
    }
    //########## END Create colors array ############


    return colors

}


export function makeStatisticLayerLegend(numCategories: Array<number>, colors: Array<ColorRGBA>, noDataColor: ColorRGBA, lineColor: ColorRGBA, lineWidth: number) : any {

    let result = {
        "Legend": [
            {
                "layerName": "",
                "title": "",
                "rules": new Array<any>()
            }
        ]
    }
    

    for (let ii = 0; ii < numCategories.length - 1; ii++) {

        let fillColor = colors[ii]

        let from = numCategories[ii]
        let to = numCategories[ii + 1]

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

        if(ii ==  numCategories.length - 2){

            rule.name = formatNumberString(from, 2, ".", "") + " bis <= " + formatNumberString(to, 2, ".", "")

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


export function computeQuantiles(layer: ol_layer.Layer, numQuantiles: number): Array<number> {

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
    console.log(result)
    return result
}


export function computeJenks(layer: ol_layer.Layer, numClasses: number): Array<number> {

    let attribute = layer.get('attribute')

    let source = layer.getSource() as ol_source.Vector

    let data: Array<number> = []

    for (let f of source.getFeatures()) {

        // NOTE: 
        //let value = parseFloat(f.get(attribute))
        let value: any = f.get(attribute)
        if (value != Number.NaN && value != null && value != undefined) {
            data.push(value)
        }
    }

    // if features not loaded
    if(data.length == 0){
        return [Number.POSITIVE_INFINITY,NaN,NaN,Number.NEGATIVE_INFINITY]
    }

    data = data.slice().sort(function (a:any, b:any) {
        return a - b;
    });
    let matrices = getMatrices(data, numClasses);
    let lower_class_limits = matrices.lower_class_limits;

    // extract n_classes out of the computed matrices
    return breaks(data, lower_class_limits, numClasses);

}

/** 
* the second part of the jenks recipe: take the calculated 
* matricesand derive an array of n breaks.
*/
function breaks(data:any, lower_class_limits:any, numClasses:any) {

    let k:any = data.length - 1,
        kclass = [],
        countNum = numClasses;

    // the calculation of classes will never include the upper and
    // lower bounds, so we need to explicitly set them
    kclass[numClasses] = data[data.length - 1];
    kclass[0] = data[0];

    // the lower_class_limits matrix is used as indexes into itself
    // here: the `k` variable is reused in each iteration.
    while (countNum > 1) {
        kclass[countNum - 1] = data[lower_class_limits[k][countNum] - 2];
        k = lower_class_limits[k][countNum] - 1;
        countNum--;
    }

    return kclass;
}

/** 
* Compute the matrices required for Jenks breaks. These matrices
* can be used for any classing of data with `classes <= n_classes`
*/
function getMatrices(data:any, numClasses:any) {
    // * lower_class_limits (LC): optimal lower class limits
    // * variance_combinations (OP): optimal variance combinations for all classes
    let lower_class_limits = [],
        variance_combinations = [],
        i, j,
        variance = 0;

    // Initialize matrix's
    for (i = 0; i < data.length + 1; i++) {
        let tmp1 = [],
            tmp2 = [];
        for (j = 0; j < numClasses + 1; j++) {
            tmp1.push(0);
            tmp2.push(0);
        }
        lower_class_limits.push(tmp1);
        variance_combinations.push(tmp2);
    }

    for (i = 1; i < numClasses + 1; i++) {
        lower_class_limits[1][i] = 1;
        variance_combinations[1][i] = 0;
        for (j = 2; j < data.length + 1; j++) {
            variance_combinations[j][i] = Infinity;
        }
    }

    for (let l = 2; l < data.length + 1; l++) {

        let sum = 0,
            sum_squares = 0,
            w = 0,
            i4 = 0;

        for (let m = 1; m < l + 1; m++) {

            let lower_class_limit = l - m + 1,
                val = data[lower_class_limit - 1];

            // here we're estimating variance for each potential classing
            // of the data, for each potential number of classes. `w`
            // is the number of data points considered so far.
            w++;
            sum += val;
            sum_squares += val * val;
            variance = sum_squares - (sum * sum / w);
            i4 = lower_class_limit - 1;

            if (i4 === 0) {
                continue;
            }

            for (j = 2; j < numClasses + 1; j++) {
                // if adding this element to an existing class
                // will increase its variance beyond the limit, break
                // the class at this point, setting the lower_class_limit
                // at this point.
                if (variance_combinations[l][j] >= (variance + variance_combinations[i4][j - 1])) {
                    lower_class_limits[l][j] = lower_class_limit;
                    variance_combinations[l][j] = variance + variance_combinations[i4][j - 1];
                }
            }

        }

        lower_class_limits[l][1] = 1;
        variance_combinations[l][1] = variance;
    }

    return {
        lower_class_limits: lower_class_limits,
        variance_combinations: variance_combinations
    };
}


export function assignStyleToFeature(feature:any, attributeName:string, categories:Array<number> ,colors:Array<ColorRGBA>, noDataColor:ColorRGBA, lineColor:ColorRGBA, lineWidth:number, actualLineWidth:number){

    
    let attributeValue = feature.get(attributeName)

    let numericAttributeValue: number = parseFloat(attributeValue)

    let fillColor = colors[categories.length - 2]
    console.log(categories)
    console.log(fillColor)

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
        for (let ii = 1; ii < categories.length - 1; ii++) {

            if (numericAttributeValue < categories[ii]) {

                // Again, index - 1 here to get the corresponding color value:
                fillColor = colors[ii - 1]
                console.log(fillColor)
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
}
