import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { proxyfetch } from 'tivigi/src/util/proxyfetch';
import AbstractData from 'tivigi/src/components/data/AbstractData/AbstractData';


@Component({})
export default class DataJsonFetch extends AbstractData {

    //############ BEGIN Props ############
    @Prop({ default: () => { } })
    headers!: any

    @Prop()
    url!: string

    @Prop({ default: true })
    useProxy!: boolean
    //############ END Props ############


    @Watch("url")
    async setup() {

        const options: RequestInit = {
            headers: this.headers
        }


        /*
        if (this.useProxy) {
            proxyfetch(this.url, options).then(response => response.json()).then((data) => {
                this.register(data)
            })
        }
        else {
            fetch(this.url, options).then(response => response.json()).then((data) => {
                this.register(data)
            })
        }
        */

        console.log("requesting data")

        let response = undefined


        var t0 = performance.now()



        if (this.useProxy) {
            response = await proxyfetch(this.url, options)
        }
        else {
            response = await fetch(this.url, options)
        }

        if (response == undefined) {
            return
        }

        let data = await response.json()

        if (data == undefined) {
            return
        }


        console.log("data received")

        this.register(data)

        var t1 = performance.now()
        console.log(this.url + ": Download and JSON parsing took " + (t1 - t0) + " milliseconds.")


    }
}
