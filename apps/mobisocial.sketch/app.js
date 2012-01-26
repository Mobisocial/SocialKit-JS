/**
 * Musu Sketch
 */

var testingInBrowser = false;

Musubi.ready(function(appContext) {
    console.log("launching sketchpad");

    var sketch = new CanvasDrawr({id:"sketchpad", size: 5, color: 'black' }); 
    $("#post").click(function(e) {
      var imgUrl = document.getElementById('sketchpad').toDataURL("image/png");
      var html = '<img src="'+ imgUrl +'" height="250px"/>';
      var content = { "__html" : html };
      var obj = new SocialKit.Obj({type : "sketchpad", data: content});
      appContext.feed.post(obj);
      $("body").html(html);
    });
});

// canvasDrawr originally from Mike Taylr  http://miketaylr.com/
// Tim Branyen massaged it: http://timbranyen.com/
// and i did too. with multi touch.
// and boris fixed some touch identifier stuff to be more specific.
           
var CanvasDrawr = function(options) {
  // grab canvas element
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

  var lines = [,,];
  var offset = $(canvas).offset();
               
  var self = {
    //bind click events
    init: function() {
      //set pX and pY from first click
      canvas.addEventListener('touchstart', self.preDraw, false);
      canvas.addEventListener('touchmove', self.draw, false);
    },

    preDraw: function(event) {
      $.each(event.touches, function(i, touch) {
        var id = touch.identifier;
        lines[id] = { x : this.pageX - offset.left, 
                      y : this.pageY - offset.top, 
                      color : options.color
                     };
      });
      event.preventDefault();
    },

    draw: function(event) {
      var e = event, hmm = {};
      $.each(event.touches, function(i, touch) {
        var id = touch.identifier,
            moveX = this.pageX - offset.left - lines[id].x,
            moveY = this.pageY - offset.top - lines[id].y;
        var ret = self.move(id, moveX, moveY);
        lines[id].x = ret.x;
        lines[id].y = ret.y;
      });
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
