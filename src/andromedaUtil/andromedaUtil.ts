const requestPromises : any = {}

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

    if (requestPromises[brokerBaseUrl] == undefined) {

        const url = brokerBaseUrl + "/attributes/?dictionary=true"
        
        
        requestPromises[brokerBaseUrl]  = new Promise((resolve, reject) => {
            fetch(url).then((res) => {
                
                res.json().then(data => {
                    resolve(data)
                })
            })
        })
    }


    return requestPromises[brokerBaseUrl]
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

