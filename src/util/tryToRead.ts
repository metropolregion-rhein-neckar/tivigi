export function tryToRead(rootObject: any, path : string, fallback: any) {

    let pathPieces = path.split('.')

    let obj = rootObject

    for(let piece of pathPieces) {

        if (obj[piece] != undefined) {
            obj = obj[piece]
        }
        else {
            return fallback
        }
    }

    return obj
}

