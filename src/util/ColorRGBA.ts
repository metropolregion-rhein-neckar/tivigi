
export class ColorRGBA {

    values: Array<number> = [0, 0, 0, 255];

    constructor(values: Array<number> | string | undefined = undefined) {

        if (values instanceof Array) {
            for (let ii = 0; ii < Math.min(values.length, 5); ii++) {
                this.values[ii] = values[ii]
            }
        }
        else if (typeof values == "string") {
            if (values.at(0) == '#') {
                values = values.substring(1)
            }
            
            const r = parseInt(values.substring(0, 2), 16)
            const g = parseInt(values.substring(2, 4), 16)
            const b = parseInt(values.substring(4, 6), 16)

            let a = 255
            if (values.length == 8) {
                a = parseInt(values.substring(6, 8), 16)
            }

            this.values = [r, g, b, a]
        }
    }

    get r(): number {
        return this.values[0]
    }

    get g(): number {
        return this.values[1]
    }

    get b(): number {
        return this.values[2]
    }

    get a(): number {
        return this.values[3]
    }


    set r(newval: number) {
        this.values[0] = newval
    }

    set g(newval: number) {
        this.values[1] = newval
    }

    set b(newval: number) {
        this.values[2] = newval
    }

    set a(newval: number) {
        this.values[3] = newval
    }



    add(other: ColorRGBA): ColorRGBA {

        let result = new ColorRGBA()

        for (let ii = 0; ii < 4; ii++) {
            result.values[ii] = this.values[ii] + other.values[ii]
        }

        return result
    }

    changeBrightnessByPercent(percent: number): ColorRGBA {

        let result = this.copy()

        for (let ii = 0; ii < 4; ii++) {
            result.values[ii] = Math.min(255, result.values[ii] * ((100 + percent) / 100))
        }

        return result
    }


    copy(): ColorRGBA {
        return new ColorRGBA(this.values.slice())
    }


    mult(factor: number): ColorRGBA {

        let result = new ColorRGBA()

        for (let ii = 0; ii < 5; ii++) {
            result.values[ii] = this.values[ii] * factor
        }

        return result
    }


    round() {
        let result = new ColorRGBA()

        for (let ii = 0; ii < 5; ii++) {
            result.values[ii] = Math.round(this.values[ii])
        }

        return result
    }


    sub(other: ColorRGBA): ColorRGBA {

        let result = new ColorRGBA()

        for (let ii = 0; ii < 5; ii++) {
            result.values[ii] = this.values[ii] - other.values[ii]
        }

        return result
    }

    decimalToHex(rgb: number) {
        var hex = Number(rgb).toString(16);
        if (hex.length < 2) {
            hex = "0" + hex;
        }
        return hex
    }



    toHexString(alpha: boolean = true) {
        // NOTE: We need the option to disable the alpha channel for Microsoft Edge Legacy

        let rounded = this.round()

        let result = "#" + this.decimalToHex(rounded.r) + this.decimalToHex(rounded.g) + this.decimalToHex(rounded.b)

        if (alpha) {
            result += this.decimalToHex(rounded.a)
        }

        return result
    }


    toRgbaString(): string {
        return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")"
    }
}

