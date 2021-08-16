

export function getAttribute(entity: any, attributeName: string) {

    if (entity == undefined || entity == null) {
        console.log("no entity")
        return null
    }

    let attribute = entity[attributeName]

    if (attribute == undefined) {
        return null
    }

    if (!(attribute instanceof Array)) {
        attribute = [attribute]
    }


    let firstInstance = attribute[0]

    if (firstInstance.value == undefined) {
        console.log("value undefined")
        return null
    }


    return firstInstance.value
}



// TODO: 2 Add "AND" more (only include timestamps for which all passed indicators have values)
export function getAllTimestamps(entity: any, attributeIds: Array<string>): Array<string> | undefined {

    if (entity == undefined) {
        return undefined
    }

    const timestamps = Array<string>()

    for (const attrId of attributeIds) {

        let attr = entity[attrId]

        if (attr == undefined || attr == null) {
            continue
        }

        if (!(attr instanceof Array)) {
            attr = [attr]
        }

        //########## BEGIN Iterate over all attribute instances ##########
        for (const instance of attr) {

            let timestamp = instance.observedAt

            if (timestamp == undefined) {
                continue
            }

            if (!timestamps.includes(timestamp)) {
                timestamps.push(timestamp)
            }
        }
        //########## END Iterate over all attribute instances ##########
    }

    timestamps.sort()

    return timestamps
}


export function getValueForTimestamp(entity: any, attrId: string, timestamp: string): any {

    let attr = entity[attrId]

    if (attr == undefined || attr == null) {
        return null
    }

    if (!(attr instanceof Array)) {
        attr = [attr]
    }

    //########## BEGIN Iterate over all attribute instances ##########
    for (const instance of attr) {

        let ts = instance.observedAt

        if (ts == undefined) {
            continue
        }

        if (ts == timestamp) {
            return instance.value
        }
    }
    //########## END Iterate over all attribute instances ##########
}




export function getTimeSeries(entity: any, attrName: string) {


    if (entity == undefined) {
        //   console.log("Municipality undefined")
        return undefined
    }


    if (entity[attrName] == undefined) {
        //   console.log("Attribute undefined:" + attrName)      
        return undefined
    }

    let attribute = entity[attrName]

    if (!(attribute instanceof Array)) {
        attribute = [attribute]
    }

    let result = Array<any>()


    for (const instance of attribute) {
        if (instance.observedAt) {

            // TODO: 1 Understand why we have multiple instances with same timestamp here
            let add = true
            for (const instanceInResult of result) {
                if (instanceInResult.observedAt == instance.observedAt) {
                    console.log("Ist schon drin")
                    add = false
                    break
                }
            }

            if (add) {
                result.push(instance)
            }
        }
    }

    result.sort((a: any, b: any) => {
        if (a.observedAt < b.observedAt) {
            return -1
        }
        else if (a.observedAt > b.observedAt) {
            return 1
        }
        return 0
    })

    return result
}
