//############ BEGIN OpenLayers imports ###########
import * as ol_geom from 'ol/geom'
import * as ol_layer from 'ol/layer'
import * as ol_source from 'ol/source'
import * as ol_style from 'ol/style'
import { StyleFunction } from 'ol/style/Style'
import BaseEvent from 'ol/events/Event'
import FillPattern from 'ol-ext/style/FillPattern'
//############ END OpenLayers imports ###########


import { ColorRGBA } from 'tivigi/src/util/ColorRGBA'
import { tryToRead } from 'tivigi/src/util/tryToRead'
import IconAnchorUnits from 'ol/style/IconAnchorUnits'
import { FeatureLike } from 'ol/Feature'


export function manualClassificationStyleFactory(layer: ol_layer.Vector, styleConfig: any = {}): StyleFunction {


    console.log(styleConfig.attribute)

    let source = layer.getSource() as ol_source.Vector
    /*

    // Note that the following variables, including 'layer' and 'styleConfig' persist after the end of 
    // this function since they are accessed by the closure functions 'onSourceChange' and 'styleFunction'.
    // This way, they are used as 'persistent storage' for the values they hold, and to exchange them between
    // those closure functions without having to set up some sort of explicit store or "message passing".

    */

    //#################### BEGIN On source change, recalculate quantiles and update legend ##################
    let onSourceChange = function (e: BaseEvent) {

        if (source.getState() != 'ready') {
            return
        }
    }

    source.on('change', onSourceChange)
    //#################### END On source change, recalculate quantiles and update legend ##################



    let manualClassificationStyleFunction = function (feature: FeatureLike, resolution : number): ol_style.Style | ol_style.Style[] {

        let stroke_width = 1


        let attributeValue = feature.get(styleConfig.attribute)


        let result: Array<ol_style.Style> = []



        for (let classification of styleConfig.classes) {


            if (attributeValue != classification.value) {
                continue
            }

            for (let style of classification.styles) {

                if (style.type == undefined) {
                    continue
                }

                switch (style.type) {
                    case "icon": {
                        let icon_src = tryToRead(style, 'src', undefined)

                        if (icon_src != undefined) {

                            let scale = tryToRead(style, "scale", 1)
                            let anchor = tryToRead(style, "anchor", [0.5, 0.5])

                            result.push(new ol_style.Style({

                                image: new ol_style.Icon({
                                    anchor: anchor,
                                    anchorXUnits: IconAnchorUnits.FRACTION,
                                    anchorYUnits: IconAnchorUnits.FRACTION,
                                    src: icon_src,
                                    scale: scale,
                                    crossOrigin: 'anonymous'
                                })
                            }));

                        }
                        break;
                    }


                    case "circle": {

                        let fill_color_data = tryToRead(style, 'fill.color', [255, 255, 255, 1])
                        let stroke_color_data = tryToRead(style, 'stroke.color', [0, 0, 0, 1])
                        let radius = tryToRead(style, "radius", 6)

                        let fill_color = new ColorRGBA(fill_color_data)
                        let stroke_color = new ColorRGBA(stroke_color_data)

                        let stroke_style = new ol_style.Stroke({ color: stroke_color.toRgbaString(), width: stroke_width })
                        let fill_style = new ol_style.Fill({ color: fill_color.toRgbaString() })


                        result.push(new ol_style.Style({

                            image: new ol_style.Circle({
                                radius: radius,
                                fill: fill_style,
                                stroke: stroke_style,
                            })
                        }));
                        break;
                    }


                    case "geometry": {
                        let stroke_style = undefined
                        let fill_style = undefined

                        let fill_color_data = tryToRead(style, 'fill.color', undefined)
                        let stroke_color_data = tryToRead(style, 'stroke.color', undefined)
                    
                        if (fill_color_data != undefined) {
                            let fill_color = new ColorRGBA(fill_color_data)
                            fill_style = new ol_style.Fill({ color: fill_color.toRgbaString() })
                        }

                        if (stroke_color_data != undefined) {
                            let stroke_color = new ColorRGBA(stroke_color_data)
                            stroke_style = new ol_style.Stroke({ color: stroke_color.toRgbaString(), width: stroke_width })
                        }
                        
                        
                        result.push(new ol_style.Style({
                            stroke: stroke_style,
                            fill: fill_style
                        }))

                        break
                    }
                }
            }
        }

        return result
    };


    return manualClassificationStyleFunction
}




