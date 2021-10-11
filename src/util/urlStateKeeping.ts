import * as lzutf8 from 'lzutf8'


export function getUrlState(): any {
  
    //################### BEGIN Get current state object #######################
    let currentUrl = new URL(location.href);


    let state: any = {}

    try {

        state = JSON.parse(lzutf8.decompress(currentUrl.searchParams.get('state') as string, {inputEncoding:"Base64"}))
        //state = JSON.parse(currentUrl.searchParams.get('state') as string)
    }
    catch (exception) {
        console.log("Failed to parse URL state string.")
    }

    if (state == null || state == undefined) {
        //console.log("create new state")
        state = {}
    }
    //################### END Get current state object #######################

    return state
}


export function setUrlState(state: any) {

   
    //###################### BEGIN Set updated URL state #####################
    
    let state_json = lzutf8.compress(JSON.stringify(state), {outputEncoding:"Base64"})
    //let state_json = JSON.stringify(state)

    let newUrl = new URL(location.href)
    newUrl.searchParams.set('state', state_json)
    

    let currentUrl = new URL(location.href);

    if (newUrl.searchParams.toString() != currentUrl.searchParams.toString()) {
        history.replaceState(null, document.title, newUrl.toString())
    }
    //###################### END Set updated URL state #####################
}

