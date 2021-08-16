export class HereRoutingClient {

    // Available modes:
    transportModes = ["car", "truck", "pedestrian", "bicycle", "scooter"]
    routingModes = ["fast", "short"]

    // Selected mode:
    transportMode = "truck"
    routingMode = "short"
    
    coords_start = [7.86, 49.69]
    coords_end = [9.34, 49.33]


    truck_height_cm = 300
    truck_grossWeight_kg = 1000000
    truck_width_cm = 3000
    truck_length_cm = 10000
    truck_weightPerAxle_kg = 10000

    blockades = Array<Array<number>>()

    /*
    departureDate = moment().format('YYYY-MM-DD');
    departureTime = moment().format("HH:mm")
    */
    departureDate = ""
    departureTime = ""

    constructor(private hereApiKey: string) {

    }


    // TODO: 3 Define return type
    async requestRoute(): Promise<any> {

        let waypoint0 = this.coords_start[1] + "," + this.coords_start[0]
        let waypoint1 = this.coords_end[1] + "," + this.coords_end[0]

        //################### BEGIN Build query URL for API version 8.16.0 ##################

        let departureDateTime = this.departureDate + "T" + this.departureTime + ":00"

        console.log(departureDateTime)

        let url = new URL("https://router.hereapi.com/v8/routes")

        url.searchParams.append("apiKey", this.hereApiKey)
        url.searchParams.append("destination", waypoint1)
        url.searchParams.append("origin", waypoint0)
        url.searchParams.append("transportMode", this.transportMode)
        url.searchParams.append("routingMode", this.routingMode)



        url.searchParams.append("departureTime", departureDateTime)
        
        url.searchParams.append("return", "polyline,actions,instructions")                
        url.searchParams.append("lang", "de-DE")


        if (this.transportMode == "truck") {
            url.searchParams.append("truck[height]", this.truck_height_cm.toString())
            url.searchParams.append("truck[grossWeight]", this.truck_grossWeight_kg.toString())
            url.searchParams.append("truck[width]", this.truck_width_cm.toString())
            url.searchParams.append("truck[length]", this.truck_length_cm.toString())
            url.searchParams.append("truck[weightPerAxle]", this.truck_weightPerAxle_kg.toString())
        }


        //######################### BEGIN Add blockades ############################
      
        if (this.blockades.length > 0) {

            let areasStringPieces = []

            let radius = 20

            for (let coords of this.blockades) {


                let bottomLeft_4326 = [coords[0] - radius, coords[1] - radius]
                let topRight_4326 = [coords[0] + radius, coords[1] + radius]

                areasStringPieces.push("bbox:" + bottomLeft_4326[0] + "," + bottomLeft_4326[1] + "," + topRight_4326[0] + "," + topRight_4326[1])
            }

            url.searchParams.append("avoid[areas]", areasStringPieces.join("|"))
        }
        //######################### END Add blockades ############################

        //################### END Build query URL for API version 8.16.0 ##################

        // NOTE: Apparently, we can and actually *must* use the standard fetch function here. 
        // For a reason not yet examined, the request does not work with proxyfetch().
        // TODO: 3 Understand why this does not work with polyfetch()
        let response = await fetch(url.toString())


        return response.json()


    }
}
