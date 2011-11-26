var rooler = rooler || {};

rooler.ScreenShot = function(canvas) {
    this.canvas = canvas;
    var context = this.canvas.getContext('2d');
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    this.imageData = imageData;
    this.top = 0;
    this.left = 0;
    this.right = imageData.width;
    this.bottom = imageData.height;
}

rooler.ScreenShot.fromImage = function(img) {
  var canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  var context = canvas.getContext('2d');
  context.fillStyle = 'white'
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.drawImage(img, 0, 0);

  return new rooler.ScreenShot(canvas);
}

rooler.ScreenShot.fromCanvas = function(canvas) {
  return new rooler.ScreenShot(canvas);
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

rooler.ScreenShot.prototype.captureRect = function(rect) {
  var canvas = document.createElement('canvas');
  canvas.width = rect.right - rect.left;
  canvas.height = rect.bottom - rect.top;

  var context = canvas.getContext('2d');
  context.translate(-rect.left, -rect.top);
  context.drawImage(this.canvas, 0, 0);

  return canvas;
};