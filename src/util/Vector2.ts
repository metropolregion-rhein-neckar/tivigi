export class Vector2 {
    constructor(public x : number = 0, public y : number = 0) {

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
}