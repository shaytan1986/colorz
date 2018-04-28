class OriginPoint {
    constructor(canvasWidthPx, canvasHeightPx) {
        this.X = 0;
        this.Y = 0;
        this.XPixels = canvasWidthPx / 2;
        this.YPixels = canvasHeightPx / 2;
    }
}

class UnitPoint {
    get XPixels() {
        return this.Origin.XPixels + (this.X * this.PixelsPerUnit);
    }

    get YPixels() {
        return this.Origin.YPixels - (this.Y * this.PixelsPerUnit);
    }

    get XPixelsAdjusted() {
        return this.XPixels - (this.PixelsPerUnit / 2);
    }

    get YPixelsAdjusted() {
        return this.YPixels - (this.PixelsPerUnit / 2);
    }


    constructor(xUnits, yUnits, pixelsPerUnit, origin) {
        this.PixelsPerUnit = pixelsPerUnit;
        this.X = xUnits;
        this.Y = yUnits;
        this.Origin = origin;
    }
}

class CartesianCanvas {

    
    constructor(canvasWidthPx, canvasHeightPx, pixelsPerUnit, pointSize) {
        this.PointSize = pointSize || 2;
        this.CanvasWidthPx = canvasWidthPx;
        this.CanvasHeightPx = canvasHeightPx;
        this.PixelsPerUnit = pixelsPerUnit;
        this.Canvas = $("#mainCanvas")[0];
        this.Canvas.width = canvasWidthPx;
        this.Canvas.height = canvasHeightPx;
        this.Origin = new OriginPoint(canvasWidthPx, canvasHeightPx);
        this.ClearButton = $("#clear")[0];
        this.RenderButton = $("#render")[0];
        this.TestButton = $("#test")[0];
        this.Context = this.Canvas.getContext("2d");
        this.Context.fillStyle = "#000000";

        this.Context.lineWidth = this.PointSize;
        
    }
    Clear() {
        this.Context.clearRect(0, 0, this.CanvasWidthPx, this.CanvasHeightPx);
    }

    GetPoint(x, y) {        
        return new UnitPoint(x, y, this.PixelsPerUnit, this.Origin)
    }

    WriteDebugMessage(bold, iColor, clear, ...args) {
        let div = $("#output")[0];
        let hexColor = iColor.toUpperCase();

        if (clear) {
            div.innerHTML = "";
        }
        if (hexColor == undefined || hexColor == "") {
            hexColor = "#000000";
        }
        let str = "<span style='color:" + hexColor + ";'>";
        if (bold)
        {
            str += "<b>";
        }
        
        for (let i = 0; i < args.length; i++) {
            str += args[i];
        }
        if (bold)
        {
            str += "</b>";
        }

        str += "</span><br/>";
        
        div.innerHTML +=str;
    }

    // Context Wrappers
    LineTo(unitPoint) {
        this.Context.lineTo(unitPoint.XPixels, unitPoint.YPixels);
    }

    MoveTo(unitPoint) {
        this.Context.moveTo(unitPoint.XPixels, unitPoint.YPixels);
    }

    MoveToOrigin() {
        this.Context.moveTo(this.Origin.XPixels, this.Origin.YPixels);
    }

    GetColorByPercent(pct, rMult, gMult, bMult) {
        let range = Math.round(255 * pct);
        const r = range * rMult;
        const g = ((range * gMult) - 1 ) % 255;
        const b = ((range * bMult * 2) - 1 ) % 255;

        return "rgb(" + r + "," + g + "," + b + ")";
    }

    GetColorMultipliers() {
        let _rMultInput = $("#rMult")[0];
        let _gMultInput = $("#gMult")[0];
        let _bMultInput = $("#bMult")[0];
        let _rMult = _rMultInput.value;
        let _gMult = _gMultInput.value;
        let _bMult = _bMultInput.value;

        if (isNaN(_rMult)) {
            _rMult = 1;
            _rMultInput.value = _rMult;
        }

        if (isNaN(_gMult)) {
            _gMult = 1;
            _gMultInput.value = _gMult;
        }

        if (isNaN(_bMult)) {
            _bMult = 1;
            _bMultInput.value = _bMult;
        }

        return { rMult:_rMult, gMult: _gMult, bMult: _bMult };
    }

    Rand255() {
        return (Math.floor(Math.random() * 10000) % 255) + 1
    }
    RandomizeInputs(){
         $("#rMult")[0].value = this.Rand255();
         $("#gMult")[0].value = this.Rand255();
         $("#bMult")[0].value = this.Rand255();
         this.DrawColorGrid();
        
    }
    DrawColorGrid() {
        this.Clear();
        let granularity = 1024;
        let factor = Math.round(Math.sqrt(granularity));
        
        let multipliers = this.GetColorMultipliers();
        this.WriteDebugMessage(
            true, 
            "#000000", 
            true, 
            "<span style='color:red;'>Red Multiplier</span>: ", multipliers.rMult,
            ", <span style='color:green;'>Green Multiplier</span>: ", multipliers.gMult,
            ", <span style='color:blue;'>Blue Multiplier</span>: ", multipliers.bMult
        );
        
        for (var i = 0; i < granularity ; i++) {


            let x = 32 -  (Math.floor(i / factor) * 2);
            let y = 32 -  ((i % factor) * 2);
            let pt = this.GetPoint(x, y);
            let colorPct = i / (granularity * 1.0);
            
            let color = this.GetColorByPercent(colorPct, multipliers.rMult, multipliers.gMult, multipliers.bMult);
            
            this.DrawPoint(pt, 10, color);

        }
    }
    

    DrawPoint(point, size, color) {
        var currentStyle = this.Context.fillStyle;
        var pointSize = size || 5;
        var pixelAdjust = pointSize / 2;
        var adjX = point.XPixels - pixelAdjust;
        var adjY = point.YPixels - pixelAdjust;    
        this.Context.fillStyle = color || currentStyle;

        
        this.Context.fillRect(
            adjX, 
            adjY,
            pointSize,
            pointSize);
        this.Context.fillStyle = currentStyle;
    }


}

$(document).ready(function(){
    MyCanvas = new CartesianCanvas(800, 800, 10, 5);
    
    MyCanvas.DrawColorGrid();

})