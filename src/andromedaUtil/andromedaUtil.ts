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

        if (res.status == 200) {
            attrMetadata[brokerBaseUrl] = await res.json()
        }                
    }

    return attrMetadata[brokerBaseUrl]
}




export function getAllYears(entity: any, attrNames: Array<string>): Array<string> | undefined {

    if (entity == undefined) {
        return undefined
    }

    const years = Array<string>()

    for (const attrName of attrNames) {

        let attr = entity[attrName]

        if (attr == undefined || attr == null) {
            alert(`Entity ${entity.id}: Fehlendes Attribut: ${attrName}`)
            continue
        }

        



        if (!(attr.value instanceof Array)) {
            
            console.log("ERROR")
            console.log(entity.id)
            console.log(attrName)
            console.log(attr)
            console.log(attr.value)
            return []
        }

        //########## BEGIN Iterate over all attribute instances ##########
        for (const instance of attr.value) {
          
            let year = instance.year

            if (year == undefined) {
                continue
            }

            if (!years.includes(year)) {
                years.push(year)
            }
        }
        //########## END Iterate over all attribute instances ##########
    }

    years.sort()

    return years
}




export function getFirstYear(entity: any, indicatorCodes: Array<string>): string | undefined {

    if (!(indicatorCodes instanceof Array)) {
        indicatorCodes = [indicatorCodes]
    }


    let years = getAllYears(entity, indicatorCodes)

    if (years == undefined || years.length == 0) {
        return undefined
    }

    return years[0]
}



export function getLastYear(entity: any, indicatorCodes: Array<string>): string | undefined {

    if (!(indicatorCodes instanceof Array)) {
        indicatorCodes = [indicatorCodes]
    }


    let years = getAllYears(entity, indicatorCodes)


    if (years == undefined || years.length == 0) {
        return undefined
    }

    return years[years.length - 1]
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

