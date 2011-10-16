import cgi
import os
import datetime
import time
import simplejson as json
import base64

from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.ext.webapp import template

class Drawing(db.Model):
  drawing_name = db.StringProperty()
  drawing_data = db.TextProperty()
  drawing_author = db.StringProperty()
  drawing_image = db.TextProperty()
  drawing_date = db.DateTimeProperty(auto_now_add=True)

class MainPageRedirect(webapp.RequestHandler):
  def get(self):
    self.redirect('/Voxel');

class MainPage(webapp.RequestHandler):
  def get(self):
    path = os.path.join(os.path.dirname(__file__), 'index.htm');

    template_values = {};

    self.response.out.write(template.render(path, template_values));

class SaveDrawing(webapp.RequestHandler):
  def post(self):
    self.save();

  def get(self):
    self.save();

  def save(self):
    drawingId = self.request.get('drawing_id')

    drawing = None
    if drawingId:
      drawing = Drawing.get_by_id(int(drawingId))

    if not drawing:
      drawing = Drawing()

    drawing.drawing_name = self.request.get('drawing_name')
    drawing.drawing_data = self.request.get('drawing_data')
    drawing.drawing_author = self.request.get('drawing_author')
    drawing.drawing_image = self.request.get('drawing_image')

    key = drawing.put()

    drawingDict = to_dict(drawing);

    self.response.out.write(key.id())

class GetDrawings(webapp.RequestHandler):
  def get(self):
    drawingId = self.request.get('id')
    callback = self.request.get('callback')

    drawings = []
    if drawingId:
      drawing = Drawing.get_by_id(int(drawingId))
      drawing_item = to_dict(drawing)
      drawing_item['drawing_id'] = drawing.key().id()
      drawings.append(drawing_item)
    else:
      drawings_query = Drawing.all().order('-drawing_date')
      for drawing in drawings_query.fetch(10):
        drawing_item = to_dict(drawing)
        drawing_item['drawing_id'] = drawing.key().id()

        drawings.append(drawing_item)

    if callback:
      self.response.out.write('%s(' % callback)
    self.response.out.write(json.dumps(drawings))

    if callback:
      self.response.out.write(');')

class GetThumbnail(webapp.RequestHandler):
  def get(self):
    self.response.headers['Content-Type'] = 'image/png'

    drawingId = self.request.get('id')
    drawing = Drawing.get_by_id(int(drawingId))

    img = drawing.drawing_image
    img = img[22:len(img)]
    img = base64.decodestring(img)

    self.response.out.write(img)

class ManageDrawings(webapp.RequestHandler):
  def get(self):
    if not users.is_current_user_admin():
      return
    drawings_query = Drawing.all().order('-drawing_date')
    drawings = drawings_query.fetch(10)

    for drawing in drawings:
      drawing.drawing_id = drawing.key().id()

    template_values = {
      'drawings': drawings,
    }
    path = os.path.join(os.path.dirname(__file__), 'manage.htm');

    self.response.out.write(template.render(path, template_values));

class DeleteDrawing(webapp.RequestHandler):
  def get(self):
    if not users.is_current_user_admin():
      return
    drawingId = self.request.get('id')

    if drawingId:
      drawing = Drawing.get_by_id(int(drawingId))

      drawing_item = to_dict(drawing)
      self.response.out.write(json.dumps(drawing_item))
      drawing.delete()
      self.redirect('manage')

    else:
      self.response.out.write('no id')

class InspectDrawing(webapp.RequestHandler):
  def get(self):
    if not users.is_current_user_admin():
      return

    drawingId = self.request.get('id')

    if drawingId:
      drawing = Drawing.get_by_id(int(drawingId))
      drawing_item = to_dict(drawing)
      drawing_item['drawing_id'] = drawing.key().id()

      template_values = {
        'drawing': drawing_item,
      }
      path = os.path.join(os.path.dirname(__file__), 'inspect.htm')

      self.response.out.write(template.render(path, template_values))
    else:
      self.response.out.write('no id')

class Upload(webapp.RequestHandler):
  def get(self):
    template_values = {
    }
    path = os.path.join(os.path.dirname(__file__), 'upload.htm')

    self.response.out.write(template.render(path, template_values))

class UploadData(webapp.RequestHandler):
  def post(self):
    if not users.is_current_user_admin():
      return
    document = self.request.get('json')
    content = json.loads(document)

    for drawing_item in content:
      drawing = Drawing()
      drawing.drawing_name = drawing_item['drawing_name']
      drawing.drawing_data = drawing_item['drawing_data']
      drawing.drawing_author = drawing_item['drawing_author']
      drawing.drawing_image = drawing_item['drawing_image']
      drawing.put()

    self.redirect('manage')

class Download(webapp.RequestHandler):
  def get(self):
    drawings = []
    drawings_query = Drawing.all().order('-drawing_date')
    for drawing in drawings_query.fetch(10):
      drawing_item = to_dict(drawing)
      drawing_item['drawing_id'] = drawing.key().id()

      drawings.append(drawing_item)
    self.response.out.write(json.dumps(drawings))

SIMPLE_TYPES = (int, long, float, bool, dict, basestring, list)
def to_dict(model):
  output = {}

  for key, prop in model.properties().iteritems():
    value = getattr(model, key)

    if value is None or isinstance(value, SIMPLE_TYPES):
      output[key] = value
    elif isinstance(value, datetime.date):
      # Convert date/datetime to ms-since-epoch ("new Date()").
      ms = time.mktime(value.utctimetuple()) * 1000
      ms += getattr(value, 'microseconds', 0) / 1000
      output[key] = int(ms)
    elif isinstance(value, db.Model):
      output[key] = to_dict(value)
    else:
      raise ValueError('cannot encode ' + repr(prop))

  return output

pages = [
  ('/Voxel', MainPage),
  ('/Voxel/', MainPageRedirect),
  ('/voxel', MainPageRedirect),
  ('/Voxel/save', SaveDrawing),
  ('/Voxel/get', GetDrawings),
  ('/Voxel/manage', ManageDrawings),
  ('/Voxel/delete', DeleteDrawing),
  ('/Voxel/inspect', InspectDrawing),
  ('/Voxel/thumbnail', GetThumbnail),
  ('/Voxel/upload', Upload),
  ('/Voxel/uploaddata', UploadData),
  ('/Voxel/download', Download),
]

