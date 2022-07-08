
import { tryToRead } from './tryToRead'
import * as ol_layer from 'ol/layer'

import * as ol_style from 'ol/style'

import { StyleFunction } from 'ol/style/Style'
import IconAnchorUnits from 'ol/style/IconAnchorUnits'


export function geoJsonIconSetter(layerConfig: any, layer:ol_layer.Vector) : ol_layer.Vector{

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