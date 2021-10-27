export enum FieldTextAlign {
    LEFT,
    RIGHT,
    CENTER
}

export class FieldConfig {

    // TODO: 3 Specify function signatures for 'display' and 'raw'
    constructor(public label: string, public shortLabel : string|undefined, public display: Function, public raw : Function, public textAlign : FieldTextAlign) {

    }
}
