var rooler = rooler || {};

rooler.DistanceTool = function() {
  this.element = rooler.createElement('div', 'roolerRoot');

  this.crosshairs = rooler.createElement('div', 'roolerCrosshairs');
  this.element.appendChild(this.crosshairs);

  this.vertical = rooler.createElement('div', 'roolerVertical');
  this.crosshairs.appendChild(this.vertical);

  this.vertical.appendChild(rooler.createElement('div', 'roolerVerticalBar'));
  this.vertical.appendChild(rooler.createElement('div', 'roolerVerticalTop'));
  this.vertical.appendChild(rooler.createElement('div', 'roolerVerticalBottom'));

  this.horizontal = rooler.createElement('div', 'roolerHorizontal');
  this.crosshairs.appendChild(this.horizontal);

  this.horizontal.appendChild(rooler.createElement('div', 'roolerHorizontalBar'));
  this.horizontal.appendChild(rooler.createElement('div', 'roolerHorizontalLeft'));
  this.horizontal.appendChild(rooler.createElement('div', 'roolerHorizontalRight'));

  this.handleMouseMove = this.handleMouseMove.bind(this);
  this.handleMouseDown = this.handleMouseDown.bind(this);
  this.handleWindowScroll = this.handleWindowScroll.bind(this);
  this.handleMouseWheel = this.handleMouseWheel.bind(this);

  document.body.addEventListener('mousemove', this.handleMouseMove, false);
  document.body.addEventListener('mousedown', this.handleMouseDown, false);
  window.addEventListener('scroll', this.handleWindowScroll, false);
  window.addEventListener('mousewheel', this.handleMouseWheel, false);

  this.dimensions = rooler.createElement('div', 'roolerDimensions');
  this.element.appendChild(this.dimensions);

  document.body.appendChild(this.element);

  this.overlay = rooler.createElement('div', 'roolerOverlay');
  document.body.appendChild(this.overlay);
}

rooler.DistanceTool.prototype.canClose = true;
rooler.DistanceTool.prototype.setCanClose = function(canClose) {
  this.canClose = canClose;
};

rooler.DistanceTool.prototype.close = function() {
  document.body.removeEventListener('mousemove', this.handleMouseMove, false);
  document.body.removeEventListener('mousedown', this.handleMouseDown, false);
  window.removeEventListener('scroll', this.handleWindowScroll, false);
  window.removeEventListener('mousewheel', this.handleMouseWheel, false);

  document.body.removeChild(this.element);
  document.body.removeChild(this.overlay);
}

rooler.DistanceTool.prototype.hide = function() {
  this.element.className += ' roolerHidden';
}

rooler.DistanceTool.prototype.show = function() {
  this.element.className = this.element.className.replace(' roolerHidden', '');
}

rooler.DistanceTool.prototype.handleMouseDown = function(e) {
  if (this.canClose) {
    this.close();
  }
}

rooler.DistanceTool.prototype.handleMouseMove = function(e) {
  this.cursorPosition = {
    x: e.pageX,
    y: e.pageY
  };

  this.update();
}

rooler.DistanceTool.prototype.update = function() {
  if (!window.Rooler.screenShot) {
    return;
  }

  var myOffset = {left: 0, top: 0};
  var position = {
    x: this.cursorPosition.x - myOffset.left,
    y: this.cursorPosition.y - myOffset.top - window.pageYOffset
  }

  var coordinates = null;
  if (window.Rooler.screenShot) {
    coordinates = window.Rooler.screenCoordinates.expandPoint(position, window.Rooler.screenShot);
  }
  else {
    coordinates = {left: this.cursorPosition.x - 100,
                   top: this.cursorPosition.y - 100,
                   width: 200,
                   height: 200,
                  };
  }

  coordinates.top += window.pageYOffset;
  coordinates.left += window.pageXOffset;

  this.crosshairs.style.left = coordinates.left + myOffset.left + 'px';
  this.crosshairs.style.top = coordinates.top + myOffset.top + 'px';

  var width = coordinates.width + "px";
  this.crosshairs.style.width = width;

  var height = coordinates.height + "px";
  this.crosshairs.style.height = height;

  this.vertical.style.left = (this.cursorPosition.x - coordinates.left - myOffset.left - 5) + 'px';
  this.horizontal.style.top = (this.cursorPosition.y - coordinates.top - myOffset.top - 5) + 'px';

  this.dimensions.textContent = (coordinates.width + ' x ' + coordinates.height);
  this.dimensions.style.top = (this.cursorPosition.y - myOffset.top - 20) + 'px';

  if (this.cursorPosition.x > window.innerWidth - 100) {
    var width = this.dimensions.clientWidth;
    this.dimensions.style.left = (this.cursorPosition.x - myOffset.left - (width + 10)) + 'px';
  } else {
    this.dimensions.style.left = (this.cursorPosition.x - myOffset.left + 10) + 'px';
  }
}

rooler.DistanceTool.prototype.handleWindowScroll = function(e) {
  if (window.Rooler.requestUpdateScreenshot) {
    window.Rooler.requestUpdateScreenshot();
  }
}

rooler.DistanceTool.prototype.handleMouseWheel = function(e) {
  e.preventDefault();
  if (e.wheelDelta > 0) {
    rooler.ScreenCoordinates.colorTolerance += 1;
  }
  else {
    rooler.ScreenCoordinates.colorTolerance -= 1;
    if (rooler.ScreenCoordinates.colorTolerance < 0) {
      rooler.ScreenCoordinates.colorTolerance = 0;
    }
  }
  this.update();
}