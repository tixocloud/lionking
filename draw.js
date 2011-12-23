(function() {
    var canvas = document.getElementById('imageView');
    var beginDrawing = false,
        context = canvas.getContext('2d');
    $(canvas).mousemove(function(ev) {
        var x, y;

          // Get the mouse position relative to the canvas element.
          if (ev.layerX || ev.layerX == 0) { // Firefox
            x = ev.layerX;
            y = ev.layerY;
          } else if (ev.offsetX || ev.offsetX == 0) { // Opera
            x = ev.offsetX;
            y = ev.offsetY;
          }

          // The event handler works like a drawing pencil which tracks the mouse 
          // movements. We start drawing a path made up of lines.
          if (beginDrawing) {
            context.lineTo(x, y);
            context.stroke();
          }
    });

    $(canvas).mousedown(function(ev) {
        // Get the mouse position relative to the canvas element.
        if (ev.layerX || ev.layerX == 0) { // Firefox
          x = ev.layerX;
          y = ev.layerY;
        } else if (ev.offsetX || ev.offsetX == 0) { // Opera
          x = ev.offsetX;
          y = ev.offsetY;
        }
        context.beginPath();
        context.moveTo(x,y);
        beginDrawing = true;
    });

    $(canvas).mouseup(function(ev) {
        if (beginDrawing) {
            //$(this).mousemove(ev);
            beginDrawing = false;
        } 
    });
})();
