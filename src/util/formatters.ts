export class FormatNumberStringOptions {
    numDecimals : number = 2
    decimalSeparator : string = ","
    thousandsSeparator : string = "."
    unit : string = ""
    addSign : boolean = false
}


// TODO: Change this function and all calls of it to use FormatNumberStringOptions
export function formatNumberString(value: number, numDecimals: number = 0, decimalSeparator : string = ",", thousandsSeparator : string = ".", unit : string = "") {
    
    if (isNaN(value)) {
        return ""
    }

    let factor = Math.pow(10,numDecimals)

    value = Math.round(value * factor) / factor

    let piece = value.toString()

    let parts = [piece]

    if (piece.includes(".")) {
        parts = piece.split(".")        
    }

    // TODO: 3 Explain this regexp. Source?
    let result = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

    

    if (numDecimals > 0) {
        result += decimalSeparator

        let decimalsString = ""

        if (parts.length > 1) {
            decimalsString = parts[1].substring(0, numDecimals)
        }

        result += decimalsString.padEnd(numDecimals, '0');
    }

    if (unit != "") {
        result += " " + unit
    }
  
    return result;
}





export function zeroPad(num :number, places : number) {
    return String(num).padStart(places, '0')
} 