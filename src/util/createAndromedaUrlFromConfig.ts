import {tryToRead} from "./tryToRead"

export function createAndromedaUrlFromConfig(layerConfig: any){

    let url = layerConfig.baseUrl

    let andromedaParams: any = tryToRead(layerConfig, "andromedaParams", null)

    if(andromedaParams != null){

        url += `/entities/?type=${andromedaParams.entityType}&attrs=name,${andromedaParams.attributes.join(',')}&format=geojson&options=keyValues`

        if("query" in andromedaParams){
            url += "&q=" + andromedaParams['query']
        }

    }


    return url
    
}