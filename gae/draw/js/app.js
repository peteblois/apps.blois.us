var draw = draw || {};

/**
 * @constructor
 */
draw.App = function() {
  this.editorElement = document.getElementById('source');
  this.editorElement.style.height = window.innerHeight + 'px';

  this.editor = ace.edit(this.editorElement);

  var JavaScriptMode = require('ace/mode/javascript').Mode;
  this.editor.getSession().setMode(new JavaScriptMode());


  this.image = document.getElementById('image');
  this.bkg = document.getElementById('imgbkg');
  new draw.Dragger(this.bkg);
  this.canvas = document.createElement('canvas');
  this.canvas.width = 300;
  this.canvas.height = 300;

  this.context = this.canvas.getContext('2d');

  this.timeout = undefined;

  this.handleSrcChange = this.handleSrcChange.bind(this);
  this.handleTimeout = this.handleTimeout.bind(this);
  this.handleResize = this.handleResize.bind(this);
  this.handleUnload = this.handleUnload.bind(this);
  this.handleKeyDown = this.handleKeyDown.bind(this);
  this.handleSaveClick = this.handleSaveClick.bind(this);
  this.handleNewClick = this.handleNewClick.bind(this);
  this.handleSaveComplete = this.handleSaveComplete.bind(this);
  this.handleLoadComplete = this.handleLoadComplete.bind(this);
  this.editorElement.addEventListener('keydown', this.handleSrcChange, false);
  document.addEventListener('keydown', this.handleKeyDown, false);
  document.getElementById('save').addEventListener('click', this.handleSaveClick, false);
  document.getElementById('new').addEventListener('click', this.handleNewClick, false);

  this.id = undefined;

  this.script = undefined;
  this.trialScript = undefined;

  window.Draw = this;

  if (window.location.hash && window.location.hash.length > 1) {
    this.id = window.location.hash.substr(1);
  }
  var data = undefined;
  if (window.localStorage) {
    var dataStr = window.localStorage.getItem('data');
    if (dataStr) {
      data = JSON.parse(dataStr);
    }
  }
  if (data && data.id == this.id) {
    this.setText(data.text);
  } else if (this.id) {
    this.load(this.id);
  } else {
    this.setText(draw.App.defaultText);
  }

  window.addEventListener('unload', this.handleUnload, false);
  window.addEventListener('resize', this.handleResize, false);
  this.handleResize();
};

draw.App.defaultText = "canvas.width = 110;\ncanvas.height = 110;\n\ncontext.fillStyle = 'yellow';\ncontext.lineWidth = 10;\n\ncontext.arc(55, 55, 50, 0, 2 *Math.PI);\ncontext.fill();\ncontext.stroke();\n\ncontext.lineCap = 'round';\ncontext.beginPath();\ncontext.arc(55, 55, 30, 0, Math.PI);\ncontext.stroke();\n\ncontext.beginPath();\ncontext.arc(35, 35, 5, 0, Math.PI * 2);\ncontext.stroke();\n\ncontext.beginPath();\ncontext.arc(75, 35, 5, 0, Math.PI * 2);\ncontext.stroke();"

draw.App.prototype.handleSrcChange = function() {
  if (this.timeout) {
    window.clearTimeout(this.timeout);
  }
  window.setTimeout(this.handleTimeout, 500);
};

draw.App.prototype.handleTimeout = function() {
  this.refresh();
};

draw.App.prototype.getText = function() {
  return this.editor.getSession().getValue();
}

draw.App.prototype.setText = function(value) {
  this.editor.getSession().setValue(value);
  this.refresh();
}

draw.App.prototype.refresh = function() {
  if (this.trialScript) {
    this.trialScript.parentElement.removeChild(this.trialScript);
    delete this.trialScript;
  }

  this.trialScript = document.createElement('script');

  window.context = this.context;
  window.canvas = this.canvas;
  var text = this.getText();
  this.trialText = text;

  var script = '\ntry {\n' + text;
  script += '\n}catch (e) {}; window.Draw.scriptSuccess();';

  this.trialScript.textContent = script;
  try {
    document.body.appendChild(this.trialScript);
  } catch(e) {
    alert(e.message);
  }
};

draw.App.prototype.scriptSuccess = function() {
  if (this.script) {
    this.script.parentElement.removeChild(this.script);
  }
  this.script = this.trialScript;
  delete this.trialScript;

  this.image.style.width = this.canvas.width + 'px';
  this.image.style.height = this.canvas.height + 'px';
  this.bkg.style.width = this.canvas.width + 'px';
  this.bkg.style.height = this.canvas.height + 'px';
  this.image.src = this.canvas.toDataURL();
};

draw.App.prototype.handleResize = function() {
  this.editorElement.style.height = window.innerHeight + 'px';
  this.editorElement.style.width = window.innerWidth + 'px';
  this.editor.resize();
}

draw.App.prototype.handleKeyDown = function(e) {
 if (e.keyCode == '83' && e.metaKey) {
   this.save();
   e.preventDefault();
   return true;
 }
 return false;
}

draw.App.prototype.handleSaveClick = function(e) {
  this.save();
  e.preventDefault();
  return true;
}

draw.App.prototype.handleNewClick = function(e) {
  this.setText(draw.App.defaultText);
  window.location.hash = '';
  e.preventDefault();
  return true;
}

draw.App.prototype.save = function() {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/draw/save', true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = this.handleSaveComplete;
  var data = 'text=' + encodeURIComponent(this.getText());
  if (this.id) {
    data += '&id=' + this.id;
  }

  xhr.send(data);
};

draw.App.prototype.handleSaveComplete = function(e) {
  if (e.target.readyState == 4) {
    var response = JSON.parse(e.target.responseText);
    if (response.id) {
      this.id = response.id;
      window.location.hash = '#' + this.id;
    }
  }
};

draw.App.prototype.load = function(id) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/draw/' + id, true);
  xhr.onreadystatechange = this.handleLoadComplete;
  xhr.send(null);
}

draw.App.prototype.handleLoadComplete = function(e) {
  if (e.target.readyState == 4) {
    var response = JSON.parse(e.target.responseText);
    if (response.data) {
      this.setText(response.data);
      this.id = response.id;
      window.location.hash = '#' + this.id;
    }
  }
};

draw.App.prototype.handleUnload = function() {
  if (window.localStorage) {
    var data = {
      id: this.id,
      text: this.getText()
    };
    window.localStorage.setItem('data', JSON.stringify(data));
  }
};

draw.Dragger = function(element) {
  this.element = element;
  this.handleMouseDown = this.handleMouseDown.bind(this);
  this.handleMouseMove = this.handleMouseMove.bind(this);
  this.handleMouseUp = this.handleMouseUp.bind(this);
  this.element.addEventListener('mousedown', this.handleMouseDown, false);
};

draw.Dragger.prototype.isMouseDown = false;
draw.Dragger.prototype.startX = 0;
draw.Dragger.prototype.startY = 0;

draw.Dragger.prototype.handleMouseDown = function(e) {
  this.isMouseDown = true;
  document.addEventListener('mousemove', this.handleMouseMove, false);
  document.addEventListener('mouseup', this.handleMouseUp, false);
  e.preventDefault();

  this.startX = e.pageX;
  this.startY = e.pageY;
  var style = window.getComputedStyle(this.element);
  this.initRight = this.parseLength(style.right);
  this.initTop = this.parseLength(style.top);
  return true;
};

draw.Dragger.prototype.handleMouseMove = function(e) {
  if (this.isMouseDown) {
    var offsetX = e.pageX - this.startX;
    var offsetY = e.pageY - this.startY;

    this.element.style.right =  this.initRight - offsetX + 'px';
    this.element.style.top = this.initTop + offsetY + 'px';

    e.preventDefault();
    return true;
  }
  return false;
}

draw.Dragger.prototype.handleMouseUp = function(e) {
  this.isMouseDown = false;
  document.removeEventListener('mousemove', this.handleMouseMove, false);
  document.removeEventListener('mouseup', this.handleMouseUp, false);
}

draw.Dragger.prototype.parseLength = function(val) {
  var pxIndex = val.indexOf('px');
  if (pxIndex != -1) {
    return parseInt(val.substr(0, pxIndex), 10);
  }
  return 0;
}