import datetime
import os
import time

from google.appengine.api import users
from google.appengine.ext.webapp import template
from google.appengine.ext import webapp

class TemplatedPage(webapp.RequestHandler):
	def writeTemplate(self, values):
		path = os.path.join(os.path.dirname(__file__), 'templates', self.__class__.__name__ + '.html')
		self.response.out.write(template.render(path, values))
		
class AuthenticatedPage(TemplatedPage):

	@property
	def isValidUser(self):
		if not self.user:
			self.redirect(users.create_login_url(self.request.uri))
			return False
		return True
	
	@property
	def user(self):
		return users.get_current_user()

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