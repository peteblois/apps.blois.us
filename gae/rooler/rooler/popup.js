var rooler = rooler || {};

rooler.Popup = function() {
  var distanceMenuItem = document.getElementById('distanceTool');
  distanceMenuItem.addEventListener('click', this.openDistanceTool.bind(this), false);

  var boundsMenuItem = document.getElementById('boundsTool');
  boundsMenuItem.addEventListener('click', this.openBoundsTool.bind(this), false);

  var magnifyMenuItem = document.getElementById('magnifierTool');
  magnifyMenuItem.addEventListener('click', this.openMagnifierTool.bind(this), false);
}

rooler.Popup.prototype.openDistanceTool = function() {
  chrome.extension.getBackgroundPage().rooler.background.startDistanceTool();
  window.close();
}

rooler.Popup.prototype.openBoundsTool = function() {
  chrome.extension.getBackgroundPage().rooler.background.startBoundsTool();
  window.close();
}

rooler.Popup.prototype.openMagnifierTool = function() {
  chrome.extension.getBackgroundPage().rooler.background.startMagnifierTool();
  window.close();
}

window.addEventListener('load', function() {
  var popup = new rooler.Popup();
}, false);