import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as ol from 'ol/'

import * as ol_layer from 'ol/layer'
import * as ol_source from 'ol/source'
import * as ol_proj from 'ol/proj'
import { DragPan, Interaction } from 'ol/interaction'

import RenderEvent from 'ol/render/Event'
import { getRenderPixel } from 'ol/render'
import { Coordinate } from 'ol/coordinate'

import WithRender from './Spyglass.html'

@WithRender
@Component({
    components: {
    }
})
export default class Spyglass extends Vue {

    //################# BEGIN Props #################

    // NOTE: 'coords' can be used as an attribute to receive update/"sync" events from this component.
    // It is not defined as a prop here though, since it can not be used to inject data into the component.

    @Prop({ default: 32})
    circle_steps! : number

    @Prop({ default: true})
    enabled! : boolean

    @Prop({default:  "bold 14px Arial"  })
    fontStyle! : string
    
    @Prop()
    map!: ol.Map;

    @Prop({ default: () => { return [8.7, 49.45] } })
    position!: Coordinate

    @Prop({ default:  1000  })
    radius!: number
    //################# END Props #################


    pPosition: Coordinate = this.position  
    mouseGrabOffset = [0, 0]
    panInteraction: Interaction | null = null

   
    // TODO: 2 Make layer configurable through prop
    layer = new ol_layer.Tile({
        source: new ol_source.Stamen({            
            layer: 'toner-lite'
        })
    })



    pDrag = false

    get drag(): boolean {
        return this.pDrag
    }



    set drag(newval: boolean) {
        this.pDrag = newval

        if (this.panInteraction != null) {
            this.panInteraction.setActive(!this.pDrag)
        }
    }

    @Watch('enabled')
    onEnabledChange() {
        
        this.layer.setVisible(this.enabled)

        if (this.enabled) {
            this.onClipAreaChanged()
        }
        else {
            this.$emit('update:coords', undefined)
        }
    }


    @Watch('map')
    onMapChange() {
        this.init()
    }


    @Watch('radius')
    onRadiusChange() {
        this.onClipAreaChanged()
        this.map.render()
    }


    @Watch('position')
    onPositionChange() {
        this.pPosition = ol_proj.transform(this.position, 'EPSG:4326', this.map.getView().getProjection())   
        this.onClipAreaChanged()     
    }


    beforeDestroy() {
        if (!(this.map instanceof ol.Map)) {
            return
        }

        this.map.removeLayer(this.layer)
    }


    init() {
        if (!(this.map instanceof ol.Map)) {
            return
        }

        this.onPositionChange()
     
        this.map.addLayer(this.layer)
        this.layer.setVisible(this.enabled)
        this.layer.setZIndex(999)

    
        this.layer.on('prerender', this.onBaseLayerPrerender)
        this.layer.on('postrender', this.onBaseLayerPostrender)

        // TODO: 4 Remove event listener from previous map instance
        this.map.on("change:target", this.onMapTargetChange)


        for (let inter of this.map.getInteractions().getArray()) {
            if (inter instanceof DragPan) {
                this.panInteraction = inter
                break
            }
        }
    }



    mounted() {
        this.init()
    }

    
    onBaseLayerPrerender(event:RenderEvent) {

        if (!(this.map instanceof ol.Map)) {
            return
        }

        let resolution = this.map.getView().getResolution()

        if (resolution == undefined) {
            return
        }
     
        let radius = this.radius / resolution
        let pixel = this.map.getPixelFromCoordinate(this.pPosition)
        let renderPixel = getRenderPixel(event, pixel);
        let offset = getRenderPixel(event, [pixel[0] + radius, pixel[1]]);
        let canvasRadius = Math.sqrt(Math.pow(offset[0] - renderPixel[0], 2) + Math.pow(offset[1] - renderPixel[1], 2));

        // TODO: 1 The displayed radius is wrong

        // Clip layer to the spyrole region:
        
        let ctx = event.context;
        
        ctx.save();
        
        // ATTENTION: Here, we create an *inverse* clip shape by first adding the path of the circle and then
        // adding the *inverse/negative* path of the whole canvas area rectangle around it. 
        // This idea is from here: https://stackoverflow.com/questions/6271419/how-to-fill-the-opposite-shape-on-canvas
        ctx.beginPath();
        ctx.arc(renderPixel[0], renderPixel[1], canvasRadius, 0, 2 * Math.PI);
        ctx.rect(ctx.canvas.width, 0, -ctx.canvas.width,ctx.canvas.height);
        ctx.closePath()
      
        ctx.clip();              
    }


    onBaseLayerPostrender(event: RenderEvent) {

        event.context.restore()

        let resolution = this.map.getView().getResolution()

        if (resolution == undefined) {
            return
        }
     
    
        let radius = this.radius / resolution

        let ctx = event.context;


        let pixel = this.map.getPixelFromCoordinate(this.pPosition)
        var renderPixel = getRenderPixel(event, pixel);
        var offset = getRenderPixel(event, [pixel[0] + radius, pixel[1]]);
        var canvasRadius = Math.sqrt(Math.pow(offset[0] - renderPixel[0], 2) + Math.pow(offset[1] - renderPixel[1], 2));


        ctx.save();


        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.setLineDash([0, 5])

        ctx.strokeStyle = "#000"

        ctx.beginPath();
        ctx.arc(renderPixel[0], renderPixel[1], canvasRadius, 0, 2 * Math.PI);
        ctx.closePath()
        ctx.stroke();



        ctx.setLineDash([])
        ctx.lineWidth = 1

        let innerCircleRadius = 4

        ctx.beginPath();
        ctx.arc(renderPixel[0], renderPixel[1], innerCircleRadius, 0, 2 * Math.PI);
        ctx.closePath()
        ctx.stroke()


        ctx.fillStyle = "#000"
        let text = this.radius.toString() + " m"

        ctx.font = this.fontStyle

        let textSize = ctx.measureText(text)

        let gapWidth = textSize.width

        ctx.beginPath();

        let textMargin = 4

        let cr = canvasRadius - innerCircleRadius

        if (textSize.width + innerCircleRadius + textMargin * 2 < canvasRadius) {
            ctx.moveTo(renderPixel[0] + innerCircleRadius, renderPixel[1])
            ctx.lineTo(renderPixel[0] + innerCircleRadius + cr / 2 - (gapWidth / 2 + textMargin), renderPixel[1])
            ctx.moveTo(renderPixel[0] + innerCircleRadius + cr / 2 + (gapWidth / 2 + textMargin), renderPixel[1])

            ctx.lineTo(renderPixel[0] + canvasRadius - 2, renderPixel[1])
            ctx.closePath()
            ctx.stroke()

            ctx.fillText(text, renderPixel[0] + innerCircleRadius + (cr / 2 - textSize.width / 2), renderPixel[1] + 4)
        }
    }


    // NOTE: The type of 'evt' should be 'ObjectEvent', but specifying this causes a build error
    onMapTargetChange(evt : any) {

        let oldTarget = evt.oldValue

        if (oldTarget instanceof HTMLElement) {
            oldTarget.removeEventListener("mousedown", this.onMouseDown)
            oldTarget.removeEventListener("mouseup", this.onMouseUp)
            oldTarget.removeEventListener("mousemove", this.onMouseMove)
    
            oldTarget.removeEventListener("touchstart", this.onTouchStart)
            oldTarget.removeEventListener("touchend", this.onTouchEnd)
            oldTarget.removeEventListener("touchmove", this.onTouchMove)   
        }

        
        let target = this.map.getTarget() as HTMLElement

        if (target == undefined) {
            return
        }


        target.addEventListener("mousedown", this.onMouseDown)
        target.addEventListener("mouseup", this.onMouseUp)
        target.addEventListener("mousemove", this.onMouseMove)

        target.addEventListener("touchstart", this.onTouchStart)
        target.addEventListener("touchend", this.onTouchEnd)
        target.addEventListener("touchmove", this.onTouchMove)           
    }


    onTouchStart(evt: TouchEvent) {
        // TODO: 1 Reimplement
        //this.onPointerDown(this.map.getEventCoordinate(evt))
    }


    onTouchEnd(evt: TouchEvent) {
        this.onPointerUp()      
    }


    onTouchMove(evt: TouchEvent) {
        // TODO: 1 Reimplement
        //this.onPointerMove(this.map.getEventCoordinate(evt))
    }


    onMouseDown(evt: MouseEvent) {
        this.onPointerDown(this.map.getEventCoordinate(evt))
    }


    onMouseMove(evt: MouseEvent) {
        this.onPointerMove(this.map.getEventCoordinate(evt))
    }


    onMouseUp() {
        this.onPointerUp()
    }


    onPointerDown(mouseCoords: Coordinate) {

        if (!this.enabled) {
            return
        }

        let dx = mouseCoords[0] - this.pPosition[0]
        let dy = mouseCoords[1] - this.pPosition[1]

        let dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < this.radius) {
            this.mouseGrabOffset = [mouseCoords[0] - this.pPosition[0], mouseCoords[1] - this.pPosition[1]]
            this.drag = true
        }
    }


    onPointerMove(mouseCoords: Coordinate) {
        
        if (!this.enabled) {
            return
        }

        if (this.pPosition == null || mouseCoords == null) {
            return
        }
        
        let target = this.map.getTarget() as HTMLElement

        let dx = mouseCoords[0] - this.pPosition[0]
        let dy = mouseCoords[1] - this.pPosition[1]

        let dist = Math.sqrt(dx * dx + dy * dy)

      
        if (dist < this.radius) {
      
            target.classList.add("cursor-pointer")
        }
        else {
            target.classList.remove("cursor-pointer")
        }


        if (this.drag) {
            this.pPosition = [mouseCoords[0] - this.mouseGrabOffset[0], mouseCoords[1] - this.mouseGrabOffset[1]];
         
            // This is required:
            this.map.render()

            let position_epsg4326 = ol_proj.transform(this.pPosition, this.map.getView().getProjection(), 'EPSG:4326')
            this.$emit('update:position', position_epsg4326)

            this.onClipAreaChanged()
        }
    }


    onPointerUp() {
        this.drag = false
    }


    onClipAreaChanged() {

        let coords = []
  
        let correction = 1.0031

        for (let ii = 0; ii < this.circle_steps; ii++) {
            let a = ((2 * Math.PI) / this.circle_steps) * ii
            let x = Math.cos(a) * this.radius * correction
            let y = Math.sin(a) * this.radius * correction

            coords.push([this.pPosition[0] + x, this.pPosition[1] + y])
        }

        this.$emit('update:coords', [coords])
    }
}
