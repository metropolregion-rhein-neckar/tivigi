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




export function mergeEntityFragments(fragments1: Array<any>, fragments2: Array<any>) {

    const byKey1: any = {}
    const byKey2: any = {}

    for (const frag of fragments1) {
        if (byKey1[frag.id] == undefined) {
            byKey1[frag.id] = frag
        }
    }

    //const types = ["Property", "GeoProperty", "Relationship"]

    for (const frag of fragments2) {

        // Add entire fragment if it doesn't exist yet:
        if (byKey1[frag.id] == undefined) {
            byKey1[frag.id] = frag
            continue
        }

        const e1 = byKey1[frag.id]

        // Iterate over the keys of the fragment that we want to integrate:
        for (const key in frag) {

            // TODO: Do we need to check for more keys here?
            if (key == "id" || key == "type") {
                continue
            }

            let prop = frag[key]



            // If attribute does not exist in original fragment, add it:
            if (e1[key] == undefined) {
                e1[key] = prop
                continue
            }



            if (!(e1[key] instanceof Array)) {
                e1[key] = [e1[key]]
            }

            if (!(prop instanceof Array)) {
                prop = [prop]
            }

            e1[key] = e1[key].concat(prop)


        }

    }

    return Object.values(byKey1)
}