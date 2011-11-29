
/**
 * Runs in the context of the page which is being inspected.
 **/
var rooler = rooler || {};

// From Mozilla's Dev Documentation.
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var fSlice = Array.prototype.slice,
        aArgs = fSlice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP
                                 ? this
                                 : oThis || window,
                               aArgs.concat(fSlice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

rooler.clamp = function(value, min, max) {
	return Math.max(Math.min(value, max), min);
}

rooler.getScreenPixel = function (data, x, y, pixel) {
	var index = (y * 4) * data.width + (x * 4);
  pixel.r = data.data[index];
  pixel.g = data.data[index + 1];
  pixel.b = data.data[index + 2];
}

rooler.createElement = function(type, className) {
  var element = document.createElement(type);
  rooler.addClass(element, className);
  return element;
}

rooler.addClass = function(element, className) {
  var classes = rooler.getClasses(element);
  if (classes.indexOf(className) != -1) {
    return;
  }
  classes.push(className);
  element.className = classes.join(' ');

  return element;
}

rooler.getClasses = function(element) {
  if (!element.className) {
    return [];
  }
  return element.className.split(/\s+/);
}

rooler.removeClass = function(element, className) {
  var classes = rooler.getClasses(element);
  var index = classes.indexOf(className);
  if (index != -1) {
    classes.splice(index, 1);
    element.className = classes.join(' ');
  }

  return element;
}

rooler.Rooler = function() {
  this.port = chrome.extension.connect();

  this.port.onMessage.addListener(this.handleMessage.bind(this));
  //chrome.extension.onRequest.addListener(this.handleRequest.bind(this));

  this.port.postMessage({
    msg: 'start'
  });

  this.tools = [];
  this.screenCoordinates = new rooler.ScreenCoordinates();
}

rooler.Rooler.prototype.handleMessage = function(msg) {
  var fn = this[msg.msg];
  fn.apply(this, msg.args);
}

rooler.Rooler.prototype.startDistanceTool = function() {
  this.tools.push(new rooler.DistanceTool());

  this.requestUpdateScreenshot();
}

rooler.Rooler.prototype.startBoundsTool = function() {
  this.tools.push(new rooler.BoundsTool());

  this.requestUpdateScreenshot();
}

rooler.Rooler.prototype.startMagnifierTool = function() {
  this.tools.push(new rooler.Magnifier());

  this.requestUpdateScreenshot();
}

rooler.Rooler.prototype.requestUpdateScreenshot = function() {
  for (var i = 0; i < this.tools.length; ++i) {
    this.tools[i].hide();
  }
  this.port.postMessage({
    msg: 'getPageImage'
  });
}

rooler.Rooler.prototype.updateScreenshot = function(data) {
  for (var i = 0; i < this.tools.length; ++i) {
    this.tools[i].show();
  }

  var that = this;

  var img = document.createElement('img');
  img.addEventListener('load', function() {

    var canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);

    that.screenShot = new rooler.ScreenShot(canvas);
  }, true);
  img.src = data;
}

if (!window.Rooler && window.chrome && window.chrome.extension) {
  window.Rooler = new rooler.Rooler();
}
