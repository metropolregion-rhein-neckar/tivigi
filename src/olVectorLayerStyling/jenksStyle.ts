//############ BEGIN OpenLayers imports ###########
import * as ol_layer from 'ol/layer'
import * as ol_source from 'ol/source'
import * as ol_style from 'ol/style'
import { StyleFunction } from 'ol/style/Style'
import BaseEvent from 'ol/events/Event'
//############ END OpenLayers imports ###########

import { ColorRGBA } from 'tivigi/src/util/ColorRGBA'
import { tryToRead } from 'tivigi/src/util/tryToRead'

import {makeStatisticLayerLegend, computeJenks, 
        assignStyleToFeature, createColorRamp} from 'tivigi/src/olVectorLayerStyling/statisticStyleUtils'


export function jenksStyleFactory(layer: ol_layer.Vector, styleConfig: any = {}): StyleFunction {

    //############# BEGIN Try to read style parameters from config ############         

    // NOTE: 'numQuantiles' is the *number of threshold values* at the border between two classifications,
    // and not the *number of classifications*. The number of classifications is The number of classifications is numQuantiles + 1.

    let lineColor = new ColorRGBA(tryToRead(styleConfig, "lineColor", [0, 0, 0, 255]));
    let lineWidth = tryToRead(styleConfig, "lineWidth", 1)
    let numBorders = tryToRead(styleConfig, "numBorders", 2);
    let colorStart = new ColorRGBA(tryToRead(styleConfig, "colorRampStart", [239, 243, 255, 255]));
    let colorEnd = new ColorRGBA(tryToRead(styleConfig, "colorRampEnd", [8, 81, 156, 255]));
    //############# END Try to read style parameters from config ############


    // Note that the following variables, including 'layer' and 'styleConfig' persist after the end of 
    // this function since they are accessed by the closure functions 'onSourceChange' and 'styleFunction'.
    // This way, they are used as 'persistent storage' for the values they hold, and to exchange them between
    // those closure functions without having to set up some sort of explicit store or "message passing".

    let source = layer.getSource() as ol_source.Vector

    //########## BEGIN Create colors array ##########
    // its numCategories-1 because the function was originally build to deal with quantiles
    let colors :Array<ColorRGBA> = createColorRamp(colorStart, colorEnd, numBorders)
    //########## END Create colors array ############
    console.log(colors)
    let noDataColor = new ColorRGBA([170, 170, 170, 1]);

    let jenks: Array<number> | undefined = undefined


    // TODO: 3 Setting up a source change event handler and writing layer.get('legend') in here is not very clean.
    // Also, perhaps try to separate the creation of the OpenLayers style function from the creation of the legend?

    
    //#################### BEGIN On source change, recalculate quantiles and update legend ##################
    let onSourceChange = function (e: BaseEvent) {

        if (source.getState() != 'ready') {
            return
        }

        // Recalculate quantiles:
        jenks = computeJenks(layer, numBorders+1)
        // Update legend:
        let legend = makeStatisticLayerLegend(jenks, colors, noDataColor, lineColor, lineWidth)

        layer.set('legend', legend)
    }

    source.on('change', onSourceChange)
    //#################### END On source change, recalculate quantiles and update legend ##################



    let jenksStyleFunction = function (feature: any): ol_style.Style[] {

        let actualLineWidth = lineWidth

        if (feature.get("hover")) {
            actualLineWidth = 5
        }

        // NOTE: 'quantiles' should never be undefined here, but adding this code removed a TypeScript compiler error:
        if (jenks == undefined) {
            jenks = computeJenks(layer, numBorders+1)
        }

        // ATTENTION: When quantilesStylesFactory() is called, the features are not loaded yet. The HTTP request to
        // load them is only triggered when the layer is added to the map for the first time, and then, we still have
        // to wait for the response. This means that the quantiles can't yet be calculated when quantilesStylesFactory()
        // is called. To solve this, we initialize 'quantiles' as 'undefined' and calculate the jenks when the styleFunc()
        // is called for the first time. This is when the layer is drawn for the first time, i.e. after the features are loaded.
        // After we have calculated the jenks, we cache them in the 'jenks' variable, which is from this moment on
        // no longer 'undefined', and the check for this prevents unneccessary repeated re-calculation on each redraw.

        let attributeName = layer.get('attribute')


        //############ BEGIN Select correct quantile color for the current feature ###########
        // Initialize with the color for the highest value, since this can not be reached
        // by the following for loop which tries to find the feature's quantile.

        // ATTENTION: Here, we have to substract 2 from jenks.length to get the correct index for the colors array.
        // This is for three combined reasons:

        // 1.) Usually, if the colors and jenk array had the same length, it would be -1, since 'length - 1' is the last
        // index of an array. But:

        // 2.) There is one color less than the quantile values, since the colors to not represent the quantile values,
        // but the value regions *between* them. This would change the index difference to 0 (no index decrement because 'colors'
        // is 1 shorter than 'jenks'). Again, but:

        // 3.) The jenks array has 2 additional entries: The minimum value as the first entry (in front of the actual 
        // quantile values) and the maxium value as the last entry (behind the quantile values). These two additional values
        // in the jenks array finally result in an index difference of -2.

        return assignStyleToFeature(feature, attributeName, jenks, colors, noDataColor, lineColor, lineWidth, actualLineWidth)
    };


    return jenksStyleFunction
}




