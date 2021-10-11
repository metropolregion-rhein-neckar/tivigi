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

    @Prop({ default: false })
    useProxy!: boolean
    //############ END Props ############


    mounted() {
        this.setup()
    }

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

        

        let dataText = await response.text()

        let data = undefined

        try {
            data = JSON.parse(dataText)
        }
        catch(e) {
            console.log("FAILED TO PARSE JSON:")
            console.log(this.url)

            console.log(e)
            console.log(dataText)
        }

        

        if (data == undefined) {
            return
        }


        console.log("Data fetched from " + this.url)

        // Old way:
        //this.register(data)

        // New way:
        this.$emit("update:data", data)

        //const t1 = performance.now()
        
        //console.log(this.url + ": Download and JSON parsing took " + (t1 - t0) + " milliseconds.")
    }
}
