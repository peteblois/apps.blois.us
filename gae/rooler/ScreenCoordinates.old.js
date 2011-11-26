rooler = rooler || {}

rooler.ScreenCoordinates = function() {
    this.colorTolerance = 15;
}

rooler.ScreenCoordinates.prototype.expandPoint = function (position, screenshot) {
  var x = position.X;
  var y = position.Y;

  var top = screenshot.top;
  var bottom = screenshot.bottom;

  var left = this.findNearestX(x, y - 5, y + 5, -1, screenshot).x + 1;
  var right = this.findNearestX(x, y - 5, y + 5, 1, screenshot).x;
  var top = this.findNearestY(x - 5, x + 5, y, -1, screenshot).y + 1;
  var bottom = this.findNearestY(x - 5, x + 5, y, 1, screenshot).y;

  if (right > left && bottom > top) {
    return {
      left: left,
      top: top,
      width: right - left,
      height: bottom - top
    };
  }
  return {};
},

rooler.ScreenCoordinates.prototype.findNearestX = function (xStart, yStart, yEnd, xIncrement, screenshot) {

  yStart = Math.max(screenshot.top, yStart);
  yEnd = Math.min(screenshot.bottom, yEnd);

  var xEdge = xIncrement < 0 ? -100000 : 100000;
  var yEdge = yStart;

  var imageData = screenshot.imageData;

  for (var y = yStart; y < yEnd; ++y) {
    var startPixel = screenshot.getScreenPixel(xStart, y);

    var cont = true;
    for (var x = xStart; x >= screenshot.left && x <= screenshot.right && cont == true; x += xIncrement) {
      var currentPixel = Rooler.getScreenPixel(imageData, x, y);
      if (!this.isPixelClose(currentPixel, startPixel)) {
        if (xIncrement > 0 && xEdge > x) {
          xEdge = x;
          yEdge = y;
        }
        else if (xIncrement < 0 && xEdge < x) {
          xEdge = x;
          yEdge = y;
        }
        cont = false;
      }
      startPixel = currentPixel;
    }
  }

  xEdge = Rooler.clamp(xEdge, screenshot.left, screenshot.right);

  return {
    x: xEdge,
    y: yEdge
  };
},

rooler.ScreenCoordinates.prototype.findNearestY = function (xStart, xEnd, yStart, yIncrement, screenshot) {
  xStart = Math.max(screenshot.left, xStart);
  xEnd = Math.min(screenshot.right, xEnd);

  var xEdge = xStart;
  var yEdge = yIncrement < 0 ? -100000 : 100000;

  var imageData = screenshot.imageData;

  for (var x = xStart; x < xEnd; ++x) {
    var startPixel = screenshot.getScreenPixel(x, yStart);

    var cont = true;
    for (var y = yStart; y >= screenshot.top && y <= screenshot.bottom && cont == true; y += yIncrement) {
      var currentPixel = Rooler.getScreenPixel(imageData, x, y);
      if (!this.isPixelClose(currentPixel, startPixel)) {
        if (yIncrement > 0 && yEdge > y) {
          xEdge = x;
          yEdge = y;
        }
        else if (yIncrement < 0 && yEdge < y) {
          xEdge = x;
          yEdge = y;
        }
        cont = false;
      }
      startPixel = currentPixel;
    }
  }

  yEdge = Rooler.clamp(yEdge, screenshot.top, screenshot.bottom);

  return {
    x: xEdge,
    y: yEdge
  };
},

rooler.ScreenCoordinates.prototype.isPixelClose = function (a, b) {

  var totalDifference = Math.abs(a.r - b.r) +
    Math.abs(a.g - b.g) +
    Math.abs(a.b - b.b) +
    Math.abs(a.a - b.a);

  if (totalDifference > this.colorTolerance)
    return false;

  return true;
}

rooler.ScreenShot = function(imageData) {
    this.imageData = imageData;
    this.top = 0;
    this.left = 0;
    this.right = imageData.width;
    this.bottom = imageData.height;
}

rooler.ScreenShot.prototype.getScreenPixel = function(x, y) {
  var index = (y * 4) * this.imageData.width + (x * 4);
  return {
    r: this.imageData.data[index],
    g: this.imageData.data[index + 1],
    b: this.imageData.data[index + 2],
    a: this.imageData.data[index + 3]
  };
}