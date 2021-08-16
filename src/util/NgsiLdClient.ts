
export class NgsiLdClient {

    constructor(private baseUrl: string) {

    }


    async fetchEntities(query: any): Promise<Array<any>> {



        let url = this.baseUrl + "/ngsi-ld/v1/entityOperations/query"

        let options: any = {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            //  credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/ld+json'
            },
            // redirect: 'follow', // manual, *follow, error
            // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(query) // body data type must match "Content-Type" header
        }

        const response = await fetch(url, options)

        return response.json()
    }
}