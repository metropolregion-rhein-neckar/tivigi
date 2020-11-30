//################## BEGIN OpenLayers imports #################
import * as ol_format from 'ol/format'
import * as ol_layer from 'ol/layer'
import * as ol_source from 'ol/source'
import * as ol_loadingstrategy from 'ol/loadingstrategy'
import { Extent } from 'ol/extent'
import Projection from 'ol/proj/Projection'
import { FeatureUrlFunction } from 'ol/featureloader'
import * as proxyfetch from 'tivigi/src/util/proxyfetch'
import VectorSource from 'ol/source/Vector'
import { Feature } from 'ol'
import { Geometry } from 'ol/geom'

//################## END OpenLayers imports #################


export function createWfsLayerFromCapabilities(capabilitiesXml: string, projection: Projection): ol_layer.Vector | null {

    let result: ol_layer.Vector | null = null

    let parser = new DOMParser();
    let doc = parser.parseFromString(capabilitiesXml, "text/xml");

    let wfsVersion = doc.documentElement.getAttribute("version")


    if (wfsVersion == "1.0.0") {
        result = createLayerFromWfs100(capabilitiesXml, projection)
    }
    else if (wfsVersion == "2.0.0") {
        result = createLayerFromWfs200(capabilitiesXml, projection)
    }
    else {
        console.log("Unsupported WFS version: " + wfsVersion)
    }

    return result
}


export function createLayerFromWfs100(capabilitiesXml: string, projection: Projection): ol_layer.Vector | null {

    let parser = new DOMParser();
    let doc = parser.parseFromString(capabilitiesXml, "text/xml");


    //################### BEGIN Extract base URL #####################
    let onlineResourceElem = doc.getElementsByTagName("OnlineResource").item(0)

    if (onlineResourceElem == null) {
        return null
    }

    let baseUrl = onlineResourceElem.innerHTML

    if (baseUrl == undefined) {
        console.log("base URL undefined")
        return null
    }
    //################### END Extract base URL #####################


    //################### BEGIN Extract type name #####################
    let featureTypeListElem = doc.getElementsByTagName("FeatureTypeList").item(0)

    if (featureTypeListElem == null) {
        return null
    }


    let featureTypeElem = featureTypeListElem.getElementsByTagName("FeatureType").item(0)

    if (featureTypeElem == null) {
        return null
    }


    let nameElem = featureTypeElem.getElementsByTagName("Name").item(0)

    if (nameElem == null) {
        return null
    }

    let typeName = nameElem.innerHTML

    if (typeName == undefined) {
        console.log("typename undefined")
        return null
    }
    //################### END Extract type name #####################





    let source = new ol_source.Vector({
        //format: new ol_format.GeoJSON({ featureProjection: projection.getCode(), dataProjection: projection.getCode() }),
        format: new ol_format.GeoJSON(),


        url: getWfs100UrlFunction(baseUrl, { 'typeName': typeName }, projection.getCode()),

        /*
        loader: function (extent, resolution, projection) {

          
            let baseUrlObj = new URL(baseUrl)



            // TODO: Maybe don't hard-code WFS version 1.0.0 here or add multiple implementations of this 
            // function for different WFS versions?
            baseUrlObj.searchParams.append("service", "WFS")
            baseUrlObj.searchParams.append("version", "1.0.0")
            baseUrlObj.searchParams.append("request", "GetFeature")
            baseUrlObj.searchParams.append("outputFormat", "application/json")
            baseUrlObj.searchParams.append("srsname", projection.getCode())
            baseUrlObj.searchParams.append("typeName", typeName)
            baseUrlObj.searchParams.append("bbox", extent.join(',') + "," + projection.getCode())


            console.log(baseUrlObj.toString())

            let url = baseUrlObj.toString()

            url = url.replace("http://", "https://")

            proxyfetch.proxyfetch(url, {}).then(response => response.json()).then((geojson) => {


                    console.log(geojson)
                    let that = this as VectorSource

                    let sourceFormat = that.getFormat()

                    if (sourceFormat != undefined) {
                        try {
                            let features = sourceFormat.readFeatures(geojson) as Feature<Geometry>[]

                            that.addFeatures(features)
                        }
                        catch (e) {
                            console.log(e)
                        }
                    }
                })},
*/
        strategy: ol_loadingstrategy.bbox

    });




    return new ol_layer.Vector({ source: source });
}




export function createLayerFromWfs200(capabilitiesXml: string, projection: Projection): ol_layer.Vector | null {

    let parser = new DOMParser();
    let doc = parser.parseFromString(capabilitiesXml, "text/xml");


    let operationsMetadata = doc.getElementsByTagName("ows:OperationsMetadata").item(0)

    if (operationsMetadata == null) {
        console.log("operations metadata not found")
        return null
    }

    let operationElements = operationsMetadata.getElementsByTagName("ows:Operation")

    let baseUrl: string | null = null

    for (let ii = 0; ii < operationElements.length; ii++) {
        let operationElem = operationElements.item(ii)!!

        if (operationElem.getAttribute("name") == "GetFeature") {

            let dcpElem = operationElem.getElementsByTagName("ows:DCP").item(0)
            if (dcpElem == null) return null

            let httpElem = dcpElem.getElementsByTagName("ows:HTTP").item(0)
            if (httpElem == null) return null

            let getElem = httpElem.getElementsByTagName("ows:Get").item(0)
            if (getElem == null) return null

            baseUrl = getElem.getAttribute("xlink:href")
        }
    }

    if (baseUrl == null) {
        console.log("Failed to extract base URL")
        return null
    }


    // NOTE: From here on, the code is the same as in the WFS 1.0.0 implementation.
    // Perhaps move this to a shared function?

    //################### BEGIN Extract type name #####################
    let featureTypeListElem = doc.getElementsByTagName("FeatureTypeList").item(0)
    if (featureTypeListElem == null) return null

    let featureTypeElem = featureTypeListElem.getElementsByTagName("FeatureType").item(0)
    if (featureTypeElem == null) return null

    let nameElem = featureTypeElem.getElementsByTagName("Name").item(0)
    if (nameElem == null) return null

    let typeName = nameElem.innerHTML

    if (typeName == undefined) {
        console.log("typename undefined")
        return null
    }
    //################### END Extract type name #####################

    

    

    let source = new ol_source.Vector({

        format: new ol_format.GeoJSON(),
        url: getWfs100UrlFunction(baseUrl, { 'typeName': typeName }, projection.getCode()),
        strategy: ol_loadingstrategy.bbox

    });


    return new ol_layer.Vector({ source: source });

}




export function getWfs100UrlFunction(baseUrl: string, urlParams: any, projectionCode: string): FeatureUrlFunction {

    // TODO: 4 Use custom loader function instead of this?

    let baseUrlObj = new URL(baseUrl)

    for (let key in urlParams) {
        baseUrlObj.searchParams.append(key, urlParams[key])
    }


    // TODO: Maybe don't hard-code WFS version 1.0.0 here or add multiple implementations of this 
    // function for different WFS versions?
    baseUrlObj.searchParams.append("service", "WFS")
    baseUrlObj.searchParams.append("version", "1.0.0")
    baseUrlObj.searchParams.append("request", "GetFeature")
    baseUrlObj.searchParams.append("outputFormat", "application/json")
    baseUrlObj.searchParams.append("srsname", projectionCode)


    let result = function (extent: Extent) {

        // NOTE: This function is a closure. We take the original baseUrlObj from the function creation scope
        // and *clone* it with the following line of code. Then we add a situation-specific parameter without
        // changing the original baseUrlObj:
        let url = new URL(baseUrlObj.toString())

        url.searchParams.append("bbox", extent.join(',') + "," + projectionCode)

        return proxyfetch.getProxyUrl(url.toString())
    }


    return result
}



