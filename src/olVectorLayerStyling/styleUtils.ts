//############ BEGIN OpenLayers imports ###########
import * as ol_layer from 'ol/layer'
import * as ol_style from 'ol/style'
import { StyleFunction } from 'ol/style/Style'
import { FeatureLike } from 'ol/Feature'
//############ END OpenLayers imports ###########


export function addStyleFunctionToLayer(layer: ol_layer.Vector, name: string, styleFunction: StyleFunction) {

    if (!(layer instanceof ol_layer.Vector)) {
        return
    }

    let styleFuncs: Map<string, StyleFunction> = layer.get('styleFunctions')

    if (styleFuncs == undefined) {
        styleFuncs = new Map<string, StyleFunction>();
        layer.set('styleFunctions', styleFuncs)
    }

    styleFuncs.set(name, styleFunction)


    let source = layer.getSource()

    if (source != null) {
        source.changed()
    }
}


export function getStyleFunctionsForLayer(layer: ol_layer.Vector): Array<StyleFunction> {
    
    let styleFuncs: Map<string, StyleFunction> = layer.get('styleFunctions')

    if (styleFuncs == undefined) {
        return []
    }

    let result = new Array<StyleFunction>()

    
    for (let key of styleFuncs.keys()) {

        let sf = styleFuncs.get(key)

        if (sf != null) {
            result.push(sf)
        }
    }

    return result
}


export function removeStyleFunctionFromLayer(layer: ol_layer.Vector, name: string) {

    let styleFuncs: Map<string, StyleFunction> = layer.get('styleFunctions')

    if (styleFuncs == undefined) {
        return
    }

    styleFuncs.delete(name)

    layer.getSource().changed()
}


export function multiStyleFunctionFactory(layer: ol_layer.Vector) : StyleFunction {

    let multiStyleFunction: StyleFunction = function (feature: FeatureLike, resolution: number): Array<ol_style.Style> {

        let result = Array<ol_style.Style>()

     
        let styleFunctions = getStyleFunctionsForLayer(layer)

        
        if (styleFunctions == undefined) {
            return result
        }

        for (let sf of styleFunctions) {
            
            let style = sf(feature, resolution) as ol_style.Style | ol_style.Style[] | undefined

            if (style == undefined) {
                continue
            }

            if (style instanceof Array) {
                result = result.concat(style)
            }
            else {
                result.push(style)
            }
        }

        return result
    }

    return multiStyleFunction
}


