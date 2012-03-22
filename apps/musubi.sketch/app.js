/**
 * Musu Sketch
 */
var testingInBrowser = false;

Musubi.ready(function(appContext) {
  console.log("launching sketchpic... 17");
  var args = {id:"sketchpad", size: 5, color: $("#color").css("background-color") };
  if (appContext.obj != null) {
    console.log("have obj " + appContext.obj);
    var img = Musubi.urlForRawData(appContext.obj.objId);
    console.log("have raw " + img);

    if (img != null) {
      args.bg = img;
    }
  }

  var sketch = new CanvasDrawr(args); 

  $("#post").click(function(e) {
    console.log("posting...");
    var elm = document.getElementById('sketchpad');
    console.log("elm " + elm);
    var imgUrl = elm.toDataURL();
    console.log("got url");
    //var html = '<img src="'+ imgUrl +'" height="200px"/>';
    var json = { "mimeType" : "image/jpg" };
    var obj = new SocialKit.Obj({"type" : "picture", "raw_data_url": imgUrl, "json": json });
    console.log("have obj");
    if (!testingInBrowser) {
      appContext.feed.post(obj);
      appContext.quit();
    }
  });

  $("#color").click(function(e) {
    showColorPicker();
  });
});

// canvasDrawr originally from Mike Taylr  http://miketaylr.com/
// Tim Branyen massaged it: http://timbranyen.com/
// and i did too. with multi touch.
// and boris fixed some touch identifier stuff to be more specific.
           
var CanvasDrawr = function(options) {
  // grab canvas element
  var drawing = false;
  var canvas = document.getElementById(options.id),
  ctxt = canvas.getContext("2d");

  canvas.style.width = '100%'
  canvas.width = canvas.offsetWidth;
  canvas.style.width = '';

  canvas.style.height = $(document).height();
  canvas.height = canvas.offsetHeight;
  canvas.style.height = '';

  // set props from options, but the defaults are for the cool kids
  ctxt.lineWidth = options.size || Math.ceil(Math.random() * 35);
  ctxt.lineCap = options.lineCap || "round";
  ctxt.pX = undefined;
  ctxt.pY = undefined;

  if (options.bg) {
    console.log("fetching bg " + options.bg);
    var img = new Image();
    img.onload = function() {
      var aspect = img.width / img.height;
      var scaleWidth = canvas.width;
      var scaleHeight = scaleWidth / aspect;
      if (scaleHeight > canvas.height) {
        console.log("rescaling from height " + scaleHeight);
        scaleHeight = canvas.height;
        scaleWidth = scaleHeight * aspect;
      }
      ctxt.drawImage(img, 0, (canvas.height - scaleHeight) / 2, scaleWidth, scaleHeight);  
      console.log("drawing img " + scaleWidth + "x" + scaleHeight);
    }
    img.src = options.bg;
  } else {
    ctxt.fillStyle = "white";
    ctxt.fillRect(0,0,canvas.width, canvas.height);
  }
  var lines = [,,];
  var offset = $(canvas).offset();
               
  var self = {
    //bind click events
    init: function() {
      //set pX and pY from first click
      canvas.addEventListener('touchstart', self.preDraw, false);
      canvas.addEventListener('touchmove', self.draw, false);
    },
    postDraw: function(event) {
      drawing = false;
    },
    preDraw: function(event) {
      if (event.type == "mousedown") {
        drawing = true;
        lines[0] = { x : this.pageX - offset.left,
                     y : this.pageY - offset.top,
                     color : $("#color").css("background-color")
                   };
      } else {
        $.each(event.touches, function(i, touch) {
          var id = touch.identifier;
          lines[id] = { x : this.pageX - offset.left, 
                        y : this.pageY - offset.top, 
                        color : $("#color").css("background-color")
                       };
        });
      }
      event.preventDefault();
    },

    draw: function(event) {
      if (event.type == "mousemove") {
        if (!drawing) {
          return;
        }

        var id = 0;
        moveX = this.pageX - offset.left - event.x;
        moveY = this.pageY - offset.top - event.y;
        var ret = self.move(0, moveX, moveY);
        lines[0].x = ret.x;
        lines[0].y = ret.y;
      } else {
        var e = event, hmm = {};
        $.each(event.touches, function(i, touch) {
          var id = touch.identifier,
              moveX = this.pageX - offset.left - lines[id].x,
              moveY = this.pageY - offset.top - lines[id].y;
          var ret = self.move(id, moveX, moveY);
          lines[id].x = ret.x;
          lines[id].y = ret.y;
        });
      }
      event.preventDefault();
    },

    move: function(i, changeX, changeY) {
      ctxt.strokeStyle = lines[i].color;
      ctxt.beginPath();
      ctxt.moveTo(lines[i].x, lines[i].y);

      var newX = lines[i].x + changeX;
      var newY = lines[i].y + changeY;
      ctxt.lineTo(newX, newY);
      ctxt.stroke();
      ctxt.closePath();

      return { x: newX, y: newY};
    }
  };
  return self.init();
};

$(function(){
  if (testingInBrowser) {
    Musubi._launchCallback();
  }
});
