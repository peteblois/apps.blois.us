import cgi
import os
import datetime
import time
import simplejson as json
import base64
import utils
import re

from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.ext.webapp import template

class Script(db.Model):
  title = db.StringProperty()
  data = db.TextProperty()
  owner = db.UserProperty()
  image = db.TextProperty()
  date = db.DateTimeProperty(auto_now_add=True)

class MainPage(webapp.RequestHandler):
  def get(self):
    path = os.path.join(os.path.dirname(__file__), 'index.htm');

    username = None
    if users.get_current_user():
      username = users.get_current_user().nickname()

    template_values = {
      'user': username
    };

    self.response.out.write(template.render(path, template_values));

class LoginPage(webapp.RequestHandler):
  def get(self):
    if users.get_current_user():
      self.redirect('/draw')
    else:
      self.redirect(users.create_login_url(self.request.uri))

class LogoutPage(webapp.RequestHandler):
  def get(self):
    self.redirect(users.create_logout_url('/draw'))

class SaveScript(webapp.RequestHandler):
  def post(self):
    self.save();

  def get(self):
    self.save();

  def save(self):
    id = self.request.get('id')
    user = users.get_current_user()

    script = None
    if id:
      script = Script.get_by_id(int(id))

    if not script:
      script = Script()

    if script.owner and (not user or script.owner.user_id() != user.user_id()):
      script = Script()

    script.title = self.request.get('title')
    script.data = self.request.get('text')
    if user:
      script.owner = user

    key = script.put()

    scriptDict = utils.to_dict(script);
    scriptDict['data'] = script.data
    scriptDict['title'] = script.title
    scriptDict['id'] = key.id()

    #self.response.out.write(key.id())
    #self.response.out.write(user)
    #if not user:
    #  self.response.out.write('no user')

    self.response.out.write(json.dumps(scriptDict))

class GetScripts(webapp.RequestHandler):
  def get(self):
    id = self.request.get('id')

    scripts = []
    query = Script.all().order('-date')
    for script in query.fetch(10):
      item = utils.to_dict(script)
      item['id'] = script.key().id()

      scripts.append(item)

    self.response.out.write(json.dumps(scripts))

class GetScript(webapp.RequestHandler):
  def get(self):
    p = re.compile('.*/draw/([0-9]+)$')
    match = p.search(self.request.url)
    id = match.group(1)
    script = Script.get_by_id(int(id))
    item = utils.to_dict(script)
    item['data'] = script.data
    item['title'] = script.title
    item['id'] = script.key().id()

    self.response.out.write(json.dumps(item))

    #self.response.out.write(match.group(1));

class ManageScripts(webapp.RequestHandler):
  def get(self):
    if not users.is_current_user_admin():
      return
    query = Script.all().order('-date')
    scripts = query.fetch(10)

    for script in scripts:
      script.id = script.key().id()

    template_values = {
      'scripts': scripts,
    }
    path = os.path.join(os.path.dirname(__file__), 'manage.htm');
    self.response.out.write(template.render(path, template_values));

class DeleteScript(webapp.RequestHandler):
  def get(self):
    if not users.is_current_user_admin():
      return
    id = self.request.get('id')

    if id:
      script = Script.get_by_id(int(id))

      item = utils.to_dict(script)
      script.delete()
      self.redirect('manage')

    else:
      self.response.out.write('no id')

pages = [
  ('/draw', MainPage),
  ('/draw/save', SaveScript),
  ('/draw/login', LoginPage),
  ('/draw/logout', LogoutPage),
  ('/draw/get', GetScripts),
  ('/draw/manage', ManageScripts),
  ('/draw/delete', DeleteScript),
  (r'/draw/[0-9]+$', GetScript),
]

