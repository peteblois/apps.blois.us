import cgi
import os
import datetime
import time
import simplejson as json
import base64
import rooler.index
import town.index
import war.index
import voxel.index

from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.ext.webapp import template

class Home(webapp.RequestHandler):
  def get(self):
    self.redirect('http://blois.us');

class ShowUser(webapp.RequestHandler):
  def get(self):
    user = users.get_current_user();
    if user:
      template_values = {
        'user_name': user.nickname(),
        'user_id': user.user_id(),
        'is_admin': users.is_current_user_admin(),
        'logout_url': users.create_logout_url("/user")
      }
      path = os.path.join(os.path.dirname(__file__), 'user.htm')

      self.response.out.write(template.render(path, template_values))
    else:
      self.redirect(users.create_login_url("/user"))

def main():
  pages = [('/', Home)]
  pages = [('/user', ShowUser)]
  pages.extend(town.index.pages)
  pages.extend(rooler.index.pages)
  pages.extend(war.index.pages)
  pages.extend(voxel.index.pages)
  application = webapp.WSGIApplication(pages, debug=True)
  run_wsgi_app(application)

if __name__ == "__main__":
  main()
