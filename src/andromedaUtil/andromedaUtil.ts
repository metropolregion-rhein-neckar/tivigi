const attrMetadata : any = {}




export interface AndromedaAttributeDefinition {

    bucket: number,
    entityId : string,
    attrName : string,
    label : string,
    shortLabel :string,
    numDecimals : number,
    // Quick & dirty:
    compare: boolean

}


export async function getAttributeMetadata(brokerBaseUrl : string) {

    if (attrMetadata[brokerBaseUrl] == undefined) {
        
        const url = brokerBaseUrl + "/attributes/?dictionary=true"
        
        const res  = await fetch(url)

        console.log(res.status)
        if (res.status == 200) {
            attrMetadata[brokerBaseUrl] = await res.json()
        }                
    }

    return attrMetadata[brokerBaseUrl]
}




export function sortKeysAlphabetically(object: any): any {

    return Object.keys(object).sort(

        (a, b) => { return a.toLowerCase().localeCompare(b.toLowerCase()); }

    ).reduce(
        (obj: any, key: string) => {
            obj[key] = object[key];
            return obj;
        },
        {}
    );
}

