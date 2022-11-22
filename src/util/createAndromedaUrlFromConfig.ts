


export function createAndromedaPayload(query:any, extent:any=null){
        
    let payload: any = {

        entities: query.entities

    }

    if(extent != null){

        let corner_sw: any = [extent[0],extent[1]]
        let corner_nw: any = [extent[0], extent[3]]
        let corner_ne: any = [extent[2],extent[3]]
        let corner_se: any = [extent[2],extent[1]]

        let coordinates: Array<Array<number>> = [[corner_sw, corner_nw, corner_ne, corner_se, corner_sw]]

        payload["geoQ"] = {
            "georel":"within",
            "geometry" : "Polygon",
            "coordinates":coordinates
        }
    }



    if(query.hasOwnProperty("q")) payload["q"] = query.q
    if(query.hasOwnProperty("attrs")) payload['attrs'] = query.attrs
    if(query.hasOwnProperty("temporalQ")) payload['temporalQ'] = query.temporalQ
    
    return payload
}