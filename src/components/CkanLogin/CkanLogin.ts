import { proxyfetch } from 'tivigi/src/util/proxyfetch';
import { Component, Prop, Vue } from 'vue-property-decorator';
import Collapsible from 'tivigi/src/components/Collapsible/Collapsible'

import "./CkanLogin.scss"
import WithRender from './CkanLogin.html';


@WithRender
@Component({
    components: {
        Collapsible
    }
})
export default class CkanLogin extends Vue {

    @Prop()
    ckanBaseUrl!: string

    @Prop({ default: "" })
    ckanApiKey!: string


    inputApiKey = ""

    loggedInAs = ""

    get collapsibleHeader(): string {
        let result = "Login"

        if (this.loggedInAs == "") {
            result += " - Nicht angemeldet"
        }
        else {
            result += " - Angemeldet als '" + this.loggedInAs + "'"
        }

        return result;
    }

    mounted() {
        let storedApiKey = localStorage.getItem("ckanApiKey")

        if (storedApiKey != null) {
            this.logIn(storedApiKey)
        }
    }

    onLoginButtonClick() {

        this.logIn(this.inputApiKey)
    }


    onLogoutButtonClick() {
        this.$emit("update:ckanApiKey", "")
        this.loggedInAs = ""
    }


    async logIn(apiKey : string) {

   
        apiKey = apiKey.trim()
     
        let loginUrl = this.ckanBaseUrl + "/api/3/action/user_list"

       

        // Submit login request:
        let response = await proxyfetch(loginUrl, {
            headers:{"X-CKAN-API-KEY" : apiKey}
        })

        let json = await response.json()

        for(let user of json.result) {
        
            if (!("apikey" in user)) {
                continue
            }

            if (user['apikey'] == apiKey) {                

                this.loggedInAs = user['display_name']
                this.$emit("update:ckanApiKey", apiKey)

                localStorage.setItem("ckanApiKey", apiKey)

                return
            }
        }
        

        alert("Ungültiger CKAN-API-Schlüssel")
        this.inputApiKey = ""
    }

}
