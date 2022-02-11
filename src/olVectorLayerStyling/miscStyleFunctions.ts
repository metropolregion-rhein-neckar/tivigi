//############ BEGIN OpenLayers imports ###########
import * as ol_layer from 'ol/layer'
import * as ol_style from 'ol/style'
import { StyleFunction } from 'ol/style/Style'
import IconAnchorUnits from 'ol/style/IconAnchorUnits'
import { FeatureLike } from 'ol/Feature'
//############ END OpenLayers imports ###########

import { tryToRead } from 'tivigi/src/util/tryToRead'


export function vectorPointStyleFactory(layer: ol_layer.Vector, styleConfig: any): StyleFunction {

    let iconUrl = tryToRead(styleConfig, "iconUrl", "img/pin_32.png");
    let iconScale = tryToRead(styleConfig, "iconScale", 1);


    let legend = {
        "Legend": [
            {
                //"layerName": layerConfig.id,
                "title": styleConfig.title,
                "rules": [
                    {
                        "name": "rule1",
                        "title": styleConfig.title,
                        "abstract": "",
                        "symbolizers": [
                            {
                                "Point": {
                                    "title": styleConfig.title,
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


    //##################### BEGIN Style function ########################
    function getStyle_points(feature: FeatureLike, resolution : number) : ol_style.Style | ol_style.Style[] {

        let style1 = new ol_style.Style({

            image: new ol_style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: IconAnchorUnits.FRACTION,
                anchorYUnits: IconAnchorUnits.FRACTION,
                src: iconUrl,
                scale: iconScale,

                // ATTENTION: This is important for printing / PDF export!
                crossOrigin: 'anonymous'
            })
        });

        return style1;
    }
    //##################### END Style function ########################

    // NOTE: Updating the legend this way is not really clean, but I don't see an alternative at the moment. 
    layer.set('legend', legend)

    return getStyle_points
}


// NOTE: These don't work any more because the featureSelect module has been removed
/*
export function textLabelStyleFactory(layer : ol_layer.Vector, labelTemplate : string = "<<ATTRIBUTE>>") : StyleFunction {

    let textStyleFunction: StyleFunction = (feature: FeatureLike, resolution: number): ol_style.Style | ol_style.Style[] => {
            
     
        
        let text = labelTemplate


        for (let prop in feature.getProperties()) {            
            text = text.replace("{{" + prop + "}}", feature.getProperties()[prop]);
        }


        let attributeName = layer.get("attribute")

        if (attributeName != null) {
            let value = feature.getProperties()[attributeName]

            if (value != undefined) {
                text = text.replace("<<ATTRIBUTE>>", value) 
            }                
        }
        
        
        // Top, right, bottom, left
        let padding = [6, 3, 3, 5];

        if (feature == featureSelect.data.hoverFeature) {

            let style_text = new ol_style.Text({
                backgroundFill: new ol_style.Fill({ color: '#000000' }),


                padding: padding,

                overflow: true,
                font: '16px Sans Serif',
                text: text,
                fill: new ol_style.Fill({ color: '#ffffff' }),
                //backgroundStroke: new ol_style.Stroke({ color: '#000000', width: 1 })
            })

            //################ END Set stroke and fill styles depending on state ##############


            // Build final style object:
            return new ol_style.Style({
                text: style_text,
                zIndex: 3
            })
        }

        return []
    }

    return textStyleFunction
}


export function hoverStyleFunctionFactory(): StyleFunction {

    return function (feature: FeatureLike, resolution: number): ol_style.Style | ol_style.Style[]  { 

        if (feature != featureSelect.data.hoverFeature) {
            return []
        }

        return new ol_style.Style({
            //    stroke: style_stroke,
            fill: new ol_style.Fill({ color: 'rgba(0,0,0,0.15' }),
            zIndex: 2
        })
    } 
}


export function selectionStyleFunctionFactory(): StyleFunction {

    return function selectionStyleFunction(feature: FeatureLike, resolution: number): ol_style.Style | ol_style.Style[] {

        if (feature != featureSelect.data.selectedFeature) {
            return []
        }

        return new ol_style.Style({
            stroke: new ol_style.Stroke({
                color: '#000000',
                width: 3
            }),
            zIndex: 1
        })
    } 
}
*/
