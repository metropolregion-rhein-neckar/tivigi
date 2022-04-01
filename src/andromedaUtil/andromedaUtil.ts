const attrMetadata : any = {}



export async function getAttributeMetadata(brokerBaseUrl : string) {

    if (attrMetadata[brokerBaseUrl] == undefined) {
        
        const url = brokerBaseUrl + "/attributes/?dictionary=true"
        
        const res  = await fetch(url)

        if (res.status == 200) {
            attrMetadata[brokerBaseUrl] = await res.json()
        }                
    }

    return attrMetadata[brokerBaseUrl]
}


