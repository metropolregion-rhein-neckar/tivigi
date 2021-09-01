import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { proxyfetch } from 'tivigi/src/util/proxyfetch';
import AbstractData from 'tivigi/src/components/data/AbstractData/AbstractData';


@Component({})
export default class DataJsonFetch extends AbstractData {

    //############ BEGIN Props ############
    @Prop()
    data!: any

    @Prop({ default: () => { } })
    headers!: any

    @Prop()
    url!: string

    @Prop({ default: true })
    useProxy!: boolean
    //############ END Props ############


    @Watch("url")
    async setup() {

        const t0 = performance.now()

        const options: RequestInit = {
            headers: this.headers
        }

        let response = undefined


        if (this.useProxy) {
            response = await proxyfetch(this.url, options)
        }
        else {
            response = await fetch(this.url, options)
        }

        if (response == undefined) {
            return
        }

        const data = await response.json()

        if (data == undefined) {
            return
        }


        //console.log("Data fetched from " + this.url)

        // Old way:
        this.register(data)

        // New way:
        this.$emit("update:data", data)

        const t1 = performance.now()
        
        //console.log(this.url + ": Download and JSON parsing took " + (t1 - t0) + " milliseconds.")
    }
}
