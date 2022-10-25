export class Vector2 {

    values = [0,0]

    constructor(x : number = 0, y : number = 0) {

        this.values[0] = x
        this.values[1] = y
    }

    get x() : number {
        return this.values[0]
    }

    set x(newval : number) {
        this.values[0] = newval
    }

    get y() : number {
        return this.values[1]
    }

    set y(newval : number) {
        this.values[1] = newval
    }

    add(other : Vector2) : Vector2 {
        return new Vector2(this.x + other.x, this.y + other.y)
    }

    sub(other : Vector2) : Vector2 {
        return new Vector2(this.x - other.x, this.y - other.y)
    }

    clone() {
        return new Vector2(this.x, this.y)
    }

    len() : number {
        return Math.sqrt(this.x*this.x + this.y*this.y)
    }

    scalarMult(value : number) : Vector2 {
        return new Vector2(this.x * value, this.y * value)
    }

    normalize() : Vector2 {
        return this.scalarMult(1.0/this.len())
    }
   
}

export function vector2Min(v1 : Vector2,v2 : Vector2) : Vector2 {
    return new Vector2(Math.min(v1.x,v2.x), Math.min(v1.y,v2.y))
}

export function vector2Max(v1 : Vector2,v2 : Vector2) : Vector2 {
    return new Vector2(Math.max(v1.x,v2.x), Math.max(v1.y,v2.y))
}