import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

//################ BEGIN OpenLayers imports ##################
import * as ol from 'ol/'
import { Size } from 'ol/size';
//################ END OpenLayers imports ##################

import jsPDF from 'jspdf';

import FloatingWindow from 'tivigi/src/components/FloatingWindow/FloatingWindow'
import MapLoadingProgressBar from 'tivigi/src/components/gis/MapLoadingProgressBar/MapLoadingProgressBar'
import Superbutton from 'tivigi/src/components/Superbutton/Superbutton'
import ProgressBar from 'tivigi/src/components/ProgressBar/ProgressBar'


import './MapPrint.scss'
import WithRender from './MapPrint.html';

@WithRender
@Component({
    components: {
        FloatingWindow,
        MapLoadingProgressBar,
        ProgressBar,
        Superbutton
    }
})
export default class MapPrint extends Vue {

    @Prop()
    map!: ol.Map;
    
    @Prop()
    trigger!: boolean

    showPrepareMessage = false

    centerTrigger = true

    canceled = false

    imagesLoaded = 0

    //############ BEGIN Configuration parameters (can be changed by user) ############
    cfg_mapPrintResolution_dpi = 300
    cfg_space_between_map_and_legend_mm = 5
    cfg_borderWidth_mm = 5
    cfg_legendWidth_mm = 66
    cfg_legend_graphicSize_mm = 3
    cfg_legend_label_indent_mm = 5

    // Change map resolution from the current display map resolution to the specified print resolution, yes or no?
    cfg_changeRes = true
    //############ END Configuration parameters (can be changed by user) ############


    //########### BEGIN Internal working variables (calculated automatically) #############
    mapPrintSize_px = [0, 0]

    // Used to back up map view state because the PDF export function can change these values.
    // Will be restored after PDF export:
    originalMapViewResolution = 0
    originalMapSize_px: Size = [0, 0]

    // The total area on the page which is available to draw the map. This is computed automatically
    // from the map page size, page border width, legend print options etc.
    availableSize_mm = [0, 0]

    // The map image size in mm. This is computed from the available size and the size of the map as it is
    // displayed on the screen.
    mapImageSize_mm = [0, 0]


    imageLoadPromises = Array<Promise<any>>()

    //########### END Internal working variables (calculated automatically) #############

    // Create jsPDF object:
    doc: jsPDF = new jsPDF('landscape', 'mm', 'A4');


    get imageLoadProgress() : number {
        if (this.imageLoadPromises.length == 0) {
            return 0
        }

        return this.imagesLoaded / this.imageLoadPromises.length
    }


    @Watch('trigger')
    print() {
     
        this.imageLoadPromises = []
        this.imagesLoaded = 0

        // Create jsPDF document instance:
        this.doc = new jsPDF('landscape', 'mm', 'A4');

        this.canceled = false

        this.showPrepareMessage = true
        this.centerTrigger = !this.centerTrigger

        //######### BEGIN Back up original map size and view resolution ########
        let mapSize = this.map.getSize();
        let mapResolution = this.map.getView().getResolution()

        if (mapSize == undefined) {
            console.log("ERROR: Map size is undefined")
            return
        }
       
        if (mapResolution == undefined) {
            console.log("ERROR: Map resolution is undefined")
            return
        }

        this.originalMapSize_px = mapSize
        this.originalMapViewResolution = mapResolution
        //######### END Back up original map size and view resolution ########

        //################# BEGIN Calculate map image size and position ########################

        this.availableSize_mm[0] = this.doc.internal.pageSize.width - this.cfg_legendWidth_mm - this.cfg_borderWidth_mm * 2 - this.cfg_space_between_map_and_legend_mm
        this.availableSize_mm[1] = this.doc.internal.pageSize.height - this.cfg_borderWidth_mm * 2


        let mapSizeRatio = this.originalMapSize_px[1] / this.originalMapSize_px[0]

        // Try landscape mode first:
        this.mapImageSize_mm[0] = this.availableSize_mm[0]
        this.mapImageSize_mm[1] = this.mapImageSize_mm[0] * mapSizeRatio

        // If height in landscape mode exceeds available height, switch to portrait mode:
        if (this.mapImageSize_mm[1] > this.availableSize_mm[1]) {
            this.mapImageSize_mm[1] = this.availableSize_mm[1]
            this.mapImageSize_mm[0] = this.mapImageSize_mm[1] / mapSizeRatio
        }
        //################# END Calculate map image size and position ########################


        if (this.cfg_changeRes) {

            // NOTE: 
            // mapPrintSize_mm / 25.4 gives map print size in inches.
            // Multiplied by dpi gives the required image size in pixels to achieve the desired resolution.
            this.mapPrintSize_px[0] = Math.round((this.mapImageSize_mm[0] / 25.4) * this.cfg_mapPrintResolution_dpi);
            this.mapPrintSize_px[1] = Math.round((this.mapImageSize_mm[1] / 25.4) * this.cfg_mapPrintResolution_dpi);


            let scaleFactor = Math.min(this.mapPrintSize_px[0] / this.originalMapSize_px[0], this.mapPrintSize_px[1] / this.originalMapSize_px[1]);

            // Temporarily change map size and view resolution for printing:
            this.map.setSize([this.mapPrintSize_px[0], this.mapPrintSize_px[1]]);

            this.map.getView().setResolution(this.originalMapViewResolution / scaleFactor);
        }


        // Trigger PDF export on next map render complete:
        this.map.once('rendercomplete', this.exportPdf)
    }


    cancel() {
        this.canceled = true

        // Restore original map size and view resolution:
        this.map.setSize(this.originalMapSize_px);
        this.map.getView().setResolution(this.originalMapViewResolution);

        this.showPrepareMessage = false
    }


    drawSymbolizerLabel(text: string, x: number, y: number) {
        let text_split = this.doc.splitTextToSize(text, this.cfg_legendWidth_mm - this.cfg_legend_label_indent_mm)
        this.doc.text(text_split, x, y)
    }


    exportPdf() {


        if (this.canceled) {
            return
        }

        //######################### BEGIN Prepare map image canvas #####################

        // Create canvas for the map image to put in the PDF (this is not the same as the existing OpenLayers map canvas!):
        let mapCanvas: any = document.createElement('canvas');


        //############ BEGIN Set print map canvas size/resolution ##########
        mapCanvas.width = this.mapPrintSize_px[0];
        mapCanvas.height = this.mapPrintSize_px[1]
        //############ END Set print map canvas size/resolution ##########


        let mapContext = mapCanvas.getContext('2d');

        let mapTarget: HTMLElement = this.map.getTarget() as HTMLElement

        Array.prototype.forEach.call(mapTarget.querySelectorAll('.ol-layer canvas'), function (canvas: HTMLCanvasElement) {

            if (canvas.width > 0) {

                let opacity = ''

                if (canvas.parentElement != null) {
                    opacity = canvas.parentElement.style.opacity;
                }

                mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);

                let transform: any = canvas.style.transform;

                // Get the transform parameters from the style's transform matrix              
                let matrix: any = transform.match(/^matrix\(([^\(]*)\)$/)[1].split(',').map(Number);

                // Apply the transform to the export map context
                CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);

                // Copy original map canvas content to map print canvas content:
                mapContext.drawImage(canvas, 0, 0);
            }
        });
        //######################### END Prepare map image canvas #####################



        //######################### BEGIN Draw map ########################
        let posX_mm = this.cfg_borderWidth_mm + (this.availableSize_mm[0] - this.mapImageSize_mm[0]) / 2
        let posY_mm = this.cfg_borderWidth_mm + (this.availableSize_mm[1] - this.mapImageSize_mm[1]) / 2

        // Add map image to PDF:
        this.addImage(mapCanvas.toDataURL(), posX_mm, posY_mm, this.mapImageSize_mm[0], this.mapImageSize_mm[1])


        // Draw available map area border:    
        this.doc.setDrawColor("#cccccc");
        this.doc.rect(this.cfg_borderWidth_mm, this.cfg_borderWidth_mm, this.availableSize_mm[0], this.availableSize_mm[1]);


        // Draw actual map border for debugging:
        //this.doc.setDrawColor("#000000");
        //this.doc.rect(posX_mm + 1, posY_mm + 1, mapImageWidth_mm - 2, mapImageHeight_mm - 2);

        //######################### END Draw map ########################



        //###################### BEGIN Draw legend ########################

        let legend_x = this.cfg_borderWidth_mm + this.availableSize_mm[0] + this.cfg_space_between_map_and_legend_mm
        let legend_y = this.cfg_borderWidth_mm

        // Draw legend border:            
        // doc.rect(legend_x, legend_y, legendWidth_mm, legendHeight_mm);

        this.doc.setFontSize(15)
        //this.doc.setFontStyle('normal')
        this.doc.text('Legende', legend_x, legend_y + 5)


        let y = legend_y + 13


        this.doc.setFontSize(10)

        let layers = this.map.getLayers().getArray()


        for (let layer of layers) {

            if (!layer.getVisible() || !layer.get('showLegend')) {
                continue
            }

            
            //this.doc.setFontStyle('bold')
            this.doc.setFontSize(10)

            // Draw layer title:
            let splittTitle: string = this.doc.splitTextToSize(layer.get('title'), this.cfg_legendWidth_mm)
            this.doc.text(splittTitle, legend_x, y)

            let size = this.doc.getTextDimensions(splittTitle)

            y += size.h



            let legends = layer.get('legend')

            if (legends == undefined) {
                y += 5
                continue
            }

            this.doc.setFontSize(9)

            //this.doc.setFontStyle('normal')

            // TODO: 2 Don't draw legend if it is too big

            for (let legend of legends.Legend) {

                //################ BEGIN Iterate over all legend rules and draw the symbolizers ##############
                for (let rule of legend.rules) {
                    for (let symbolizer of rule.symbolizers) {

                        if (symbolizer.Line != undefined) {

                            let strokeColor = (symbolizer.Line.stroke != undefined) ? symbolizer.Line.stroke : "#000000"
                            this.doc.setDrawColor(strokeColor)

                            this.doc.line(legend_x, y, legend_x + this.cfg_legend_graphicSize_mm, y + this.cfg_legend_graphicSize_mm)

                            this.drawSymbolizerLabel(rule.title, legend_x + 2 + this.cfg_legend_label_indent_mm, y + 2.7)
                            y += 5
                        }

                        if (symbolizer.Polygon != undefined) {

                            let strokeColor = (symbolizer.Polygon.stroke != undefined) ? symbolizer.Polygon.stroke : "#000000"
                            this.doc.setDrawColor(strokeColor)

                            let fillColor = (symbolizer.Polygon.fill != undefined) ? symbolizer.Polygon.fill : "#000000"

                            this.doc.setFillColor(fillColor);

                            this.doc.rect(legend_x, y, this.cfg_legend_graphicSize_mm, this.cfg_legend_graphicSize_mm, 'FD')

                            // TODO: 3 Understand why it is "name" here instead of "title"
                            this.drawSymbolizerLabel(rule.name, legend_x + 2 + this.cfg_legend_label_indent_mm, y + 2.7)
                            y += 5
                        }

                        if (symbolizer.Point != undefined) {

                            this.addImage(symbolizer.Point.url, legend_x, y - 1, 5, 5)

                            this.drawSymbolizerLabel(rule.title, legend_x + 2 + this.cfg_legend_label_indent_mm, y + 2.7)
                            y += 5
                        }
                    }
                }
                //################ END Iterate over all legend rules and draw the symbolizers ##############

                // Draw separator line between the individual layers.
                y += 3

                this.doc.setDrawColor("#cccccc");
                this.doc.line(legend_x, y, legend_x + this.cfg_legendWidth_mm, y)

                y += 3

            }

            y += 5
        }


        Promise.all(this.imageLoadPromises).then(() => {
            this.doc.save('map.pdf');

            // Restore original map size and view resolution:
            this.map.setSize(this.originalMapSize_px);
            this.map.getView().setResolution(this.originalMapViewResolution);

            this.showPrepareMessage = false
        })
    }


    addImage(url: string, x: number, y: number, width: number, height: number) {

        let image = new Image()
        image.crossOrigin = 'anonymous'
        image.src = url

        let promise = new Promise((resolve, reject) => {

            image.addEventListener("load", () => {

                let canvas: HTMLCanvasElement = document.createElement("canvas")

                canvas.width = image.width;
                canvas.height = image.height;

                let context = canvas.getContext("2d")!

                context.drawImage(image, 0, 0, image.width, image.height)

                let canvasImage = new Image()
                canvasImage.src = canvas.toDataURL()

                canvasImage.addEventListener('load', () => {
                    this.doc.addImage(canvasImage, "png", x, y, width, height)
                    this.imagesLoaded++
                    resolve(true);
                });

            })
        })

        this.imageLoadPromises.push(promise)
    }
}
