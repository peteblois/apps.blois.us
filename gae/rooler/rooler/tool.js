var rooler = rooler || {}

rooler.Tool = function() {
  this.root = rooler.createElement('div', 'roolerRoot');

  this.handleWindowScroll = this.handleWindowScroll.bind(this);
  window.addEventListener('scroll', this.handleWindowScroll, false);

  this.initialize(this.root);
};

rooler.Tool.prototype.initialize = function(root) {
  document.body.appendChild(this.root);
};

rooler.Tool.prototype.hide = function() {
  rooler.addClass(this.root, 'roolerHidden');
};

rooler.Tool.prototype.show = function() {
  rooler.removeClass(this.root, 'roolerHidden');
};

rooler.Tool.prototype.handleWindowScroll = function() {
  if (window.Rooler.requestUpdateScreenshot) {
    window.Rooler.requestUpdateScreenshot();
  }
};

rooler.Tool.prototype.canClose = true;
rooler.Tool.prototype.setCanClose = function(canClose) {
  this.canClose = canClose;
};

rooler.Tool.prototype.close = function() {
  window.removeEventListener('scroll', this.handleWindowScroll, false);
  document.body.removeChild(this.root);
};