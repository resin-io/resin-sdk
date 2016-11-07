m = require('mochainon')
Promise = require('bluebird')
_ = require('lodash')
fs = Promise.promisifyAll(require('fs'))
path = require('path')
pine = require('resin-pine')
token = require('resin-token')
errors = require('resin-errors')
resinRequest = require('resin-request')
settings = require('resin-settings-client')
request = Promise.promisifyAll(require('request'))
cheerio = require('cheerio')
tmp = require('tmp')
rindle = require('rindle')
resin = require('../lib/resin')

reset = ->
	return resin.auth.isLoggedIn().then (isLoggedIn) ->
		return if not isLoggedIn

		Promise.all [
			pine.delete
				resource: 'application'

			pine.delete
				resource: 'user__has__public_key'
		]

credentials =
	email: process.env.RESINTEST_EMAIL
	password: process.env.RESINTEST_PASSWORD
	username: process.env.RESINTEST_USERNAME
	userId: _.parseInt(process.env.RESINTEST_USERID)
	register:
		email: process.env.RESINTEST_REGISTER_EMAIL
		password: process.env.RESINTEST_REGISTER_PASSWORD
		username: process.env.RESINTEST_REGISTER_USERNAME

if not _.every [
	credentials.email?
	credentials.password?
	credentials.username?
	credentials.userId?
	credentials.register.email?
	credentials.register.password?
	credentials.register.username?
]
	console.error('Missing environment credentials')
	process.exit(1)

describe 'SDK Integration Tests', ->

	# A high timeout number prevents false alarms when
	# running the tests in a slow connection
	@timeout(30 * 60 * 1000)

	describe 'given a not logged in user', ->

		beforeEach (done) ->
			resin.auth.logout().nodeify(done)

		describe 'Authentication', ->

			describe 'resin.auth.isLogged()', ->

				it 'should eventually be false', ->
					promise = resin.auth.isLoggedIn()
					m.chai.expect(promise).to.eventually.be.false

			describe 'resin.auth.whoami()', ->

				it 'should eventually be undefined', ->
					promise = resin.auth.whoami()
					m.chai.expect(promise).to.eventually.be.undefined

			describe 'resin.auth.logout()', ->

				it 'should not be rejected', ->
					promise = resin.auth.logout()
					m.chai.expect(promise).to.not.be.rejected

			describe 'resin.auth.authenticate()', ->

				it 'should eventually be a valid token given valid credentials', (done) ->
					resin.auth.authenticate(credentials).then(token.isValid).then (isValid) ->
						m.chai.expect(isValid).to.be.true
					.nodeify(done)

				it 'should not save the token given valid credentials', (done) ->
					resin.auth.authenticate(credentials).then ->
						promise = resin.auth.isLoggedIn()
						m.chai.expect(promise).to.eventually.be.false
					.nodeify(done)

				it 'should be rejected given invalid credentials', ->
					promise = resin.auth.authenticate
						email: 'helloworld@resin.io',
						password: 'asdfghjkl'

					m.chai.expect(promise).to.be.rejectedWith('Unauthorized')

			describe 'resin.auth.getEmail()', ->

				it 'should be rejected with an error', ->
					promise = resin.auth.getEmail()
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinNotLoggedIn)

			describe 'resin.auth.getUserId()', ->

				it 'should be rejected with an error', ->
					promise = resin.auth.getUserId()
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinNotLoggedIn)

			describe 'resin.auth.register()', ->

				beforeEach (done) ->
					resin.auth.login
						email: credentials.register.email
						password: credentials.register.password
					.then(resin.auth.getUserId)
					.then (userId) ->
						return resinRequest.send
							method: 'DELETE'
							url: "/ewa/user(#{userId})"
							baseUrl: settings.get('apiUrl')
						.then(resin.auth.logout)
					.nodeify (error) ->
						if error?.message is 'Request error: Unauthorized'
							return done()
						return done(error)

				it 'should be able to register an account', (done) ->
					resin.auth.register
						email: credentials.register.email
						password: credentials.register.password
					.then(resin.auth.loginWithToken)
					.then(resin.auth.isLoggedIn)
					.then (isLoggedIn) ->
						m.chai.expect(isLoggedIn).to.be.true
					.nodeify(done)

				it 'should not save the token automatically', (done) ->
					resin.auth.register
						email: credentials.register.email
						password: credentials.register.password
					.then(resin.auth.isLoggedIn)
					.then (isLoggedIn) ->
						m.chai.expect(isLoggedIn).to.be.false
					.nodeify(done)

				it 'should be rejected if the email is invalid', ->
					promise = resin.auth.register
						email: 'foobarbaz'
						password: credentials.register.password

					m.chai.expect(promise).to.be.rejectedWith('Invalid email')

				it 'should be rejected if the email is taken', ->
					promise = resin.auth.register
						email: credentials.email
						password: credentials.register.password

					m.chai.expect(promise).to.be.rejectedWith('This email is already taken')

		describe 'Config Model', ->

			describe 'resin.models.config.getAll()', ->

				it 'should return all the configuration', (done) ->
					resin.models.config.getAll().then (config) ->
						m.chai.expect(_.isPlainObject(config)).to.be.true
						m.chai.expect(_.isEmpty(config)).to.be.false
					.nodeify(done)

			describe 'resin.models.config.getPubNubKeys()', ->

				it 'should become the pubnub keys', (done) ->
					resin.models.config.getPubNubKeys().then (pubnubKeys) ->
						m.chai.expect(_.isString(pubnubKeys.publish_key)).to.be.true
						m.chai.expect(_.isString(pubnubKeys.subscribe_key)).to.be.true
						m.chai.expect(pubnubKeys.publish_key).to.have.length(42)
						m.chai.expect(pubnubKeys.subscribe_key).to.have.length(42)
					.nodeify(done)

			describe 'resin.models.config.getMixpanelToken()', ->

				it 'should become the mixpanel token', (done) ->
					resin.models.config.getMixpanelToken().then (mixpanelToken) ->
						m.chai.expect(_.isString(mixpanelToken)).to.be.true
						m.chai.expect(mixpanelToken).to.have.length(32)
					.nodeify(done)

			describe 'resin.models.config.getDeviceTypes()', ->

				it 'should become the device types', (done) ->
					resin.models.config.getDeviceTypes().then (deviceTypes) ->
						m.chai.expect(deviceTypes).to.not.have.length(0)

						for deviceType in deviceTypes
							m.chai.expect(deviceType.slug).to.exist
							m.chai.expect(deviceType.name).to.exist
							m.chai.expect(deviceType.arch).to.exist
					.nodeify(done)

			describe 'resin.models.config.getDeviceOptions()', ->

				it 'should become the device options', (done) ->
					resin.models.config.getDeviceOptions('raspberry-pi').then (options) ->
						m.chai.expect(_.isArray(options)).to.be.true
					.nodeify(done)

				it 'should become the device options given a device type alias', (done) ->
					resin.models.config.getDeviceOptions('raspberrypi').then (options) ->
						m.chai.expect(_.isArray(options)).to.be.true
					.nodeify(done)

				it 'should reject if device type is invalid', ->
					promise = resin.models.config.getDeviceOptions('foobarbaz')
					m.chai.expect(promise).to.be.rejectedWith('Invalid device type: foobarbaz')

		describe 'Environment Variables Model', ->

			describe 'resin.models.environmentVariables.isSystemVariable()', ->

				it 'should return false for EDITOR', ->
					result = resin.models.environmentVariables.isSystemVariable(name: 'EDITOR')
					m.chai.expect(result).to.be.false

				it 'should return false for RESINATOR', ->
					result = resin.models.environmentVariables.isSystemVariable(name: 'EDITOR')
					m.chai.expect(result).to.be.false

				it 'should return true for RESIN', ->
					result = resin.models.environmentVariables.isSystemVariable(name: 'RESIN')
					m.chai.expect(result).to.be.true

				it 'should return true for RESIN_API_KEY', ->
					result = resin.models.environmentVariables.isSystemVariable(name: 'RESIN_API_KEY')
					m.chai.expect(result).to.be.true

	describe 'given a logged in fresh user', ->

		beforeEach (done) ->
			resin.auth.login
				email: process.env.RESINTEST_EMAIL
				password: process.env.RESINTEST_PASSWORD
			.then(reset)
			.nodeify(done)

		afterEach (done) ->
			reset().nodeify(done)

		describe 'Authentication', ->

			describe 'resin.auth.isLogged()', ->

				it 'should eventually be true', ->
					promise = resin.auth.isLoggedIn()
					m.chai.expect(promise).to.eventually.be.true

			describe 'resin.auth.logout()', ->

				it 'should logout the user', (done) ->
					resin.auth.logout().then ->
						promise = resin.auth.isLoggedIn()
						m.chai.expect(promise).to.eventually.be.false
					.nodeify(done)

			describe 'resin.auth.whoami()', ->

				it 'should eventually be the username', ->
					promise = resin.auth.whoami()
					m.chai.expect(promise).to.eventually.equal(credentials.username)

			describe 'resin.auth.getEmail()', ->

				it 'should eventually be the email', ->
					promise = resin.auth.getEmail()
					m.chai.expect(promise).to.eventually.equal(credentials.email)

			describe 'resin.auth.getUserId()', ->

				it 'should eventually be the user id', ->
					promise = resin.auth.getUserId()
					m.chai.expect(promise).to.eventually.equal(credentials.userId)

		describe 'Device Model', ->

			describe 'resin.models.device.getDisplayName()', ->

				it 'should get the display name for a known slug', ->
					promise = resin.models.device.getDisplayName('raspberry-pi')
					m.chai.expect(promise).to.eventually.equal('Raspberry Pi (v1 and Zero)')

				it 'should get the display name given a device type alias', ->
					promise = resin.models.device.getDisplayName('raspberrypi')
					m.chai.expect(promise).to.eventually.equal('Raspberry Pi (v1 and Zero)')

				it 'should eventually be undefined if the slug is invalid', ->
					promise = resin.models.device.getDisplayName('asdf')
					m.chai.expect(promise).to.eventually.be.undefined

			describe 'resin.models.device.getDeviceSlug()', ->

				it 'should eventually be the slug from a display name', ->
					promise = resin.models.device.getDeviceSlug('Raspberry Pi (v1 and Zero)')
					m.chai.expect(promise).to.eventually.equal('raspberry-pi')

				it 'should eventually be the slug if passing already a slug', ->
					promise = resin.models.device.getDeviceSlug('raspberry-pi')
					m.chai.expect(promise).to.eventually.equal('raspberry-pi')

				it 'should eventually be undefined if the display name is invalid', ->
					promise = resin.models.device.getDeviceSlug('asdf')
					m.chai.expect(promise).to.eventually.be.undefined

				it 'should eventually be the slug if passing an alias', ->
					promise = resin.models.device.getDeviceSlug('raspberrypi')
					m.chai.expect(promise).to.eventually.equal('raspberry-pi')

			describe 'resin.models.device.getSupportedDeviceTypes()', ->

				it 'should return a non empty array', (done) ->
					resin.models.device.getSupportedDeviceTypes().then (deviceTypes) ->
						m.chai.expect(_.isArray(deviceTypes)).to.be.true
						m.chai.expect(deviceTypes).to.not.have.length(0)
					.nodeify(done)

				it 'should return all valid display names', (done) ->
					resin.models.device.getSupportedDeviceTypes().each (deviceType) ->
						promise = resin.models.device.getDeviceSlug(deviceType)
						m.chai.expect(promise).to.eventually.not.be.undefined
					.nodeify(done)

			describe 'resin.models.device.getManifestBySlug()', ->

				it 'should become the manifest if the slug is valid', (done) ->
					resin.models.device.getManifestBySlug('raspberry-pi').then (manifest) ->
						m.chai.expect(_.isPlainObject(manifest)).to.be.true
						m.chai.expect(manifest.slug).to.exist
						m.chai.expect(manifest.name).to.exist
						m.chai.expect(manifest.options).to.exist
					.nodeify(done)

				it 'should be rejected if the device slug is invalid', ->
					promise = resin.models.device.getManifestBySlug('foobar')
					m.chai.expect(promise).to.be.rejectedWith('Invalid device type: foobar')

				it 'should become the manifest given a device type alias', (done) ->
					resin.models.device.getManifestBySlug('raspberrypi').then (manifest) ->
						m.chai.expect(manifest.slug).to.equal('raspberry-pi')
					.nodeify(done)

			describe 'resin.models.device.ensureSupervisorCompatibility()', ->
				MIN_VERSION = '1.0.0'

				it 'should be fulfilled if supervisor version is compatible', ->
					promise = resin.models.device.ensureSupervisorCompatibility('1.1.0', MIN_VERSION)
					m.chai.expect(promise).to.be.fulfilled

				it 'should be rejected if supervisor version is not compatible', ->
					promise = resin.models.device.ensureSupervisorCompatibility('0.9.0', MIN_VERSION)
					m.chai.expect(promise).to.be.rejected

				it 'should be rejected if supervisor version is not semver-compatible', ->
					INVALID_VERSION = 'InvalidSemver'
					promise = resin.models.device.ensureSupervisorCompatibility(INVALID_VERSION, MIN_VERSION)
					m.chai.expect(promise).to.be.rejectedWith("Invalid supervisor version: #{INVALID_VERSION}")

		describe 'given no applications', ->

			describe 'Application Model', ->

				describe 'resin.models.application.getAll()', ->

					it 'should eventually become an empty array', ->
						promise = resin.models.application.getAll()
						m.chai.expect(promise).to.become([])

				describe 'resin.models.application.hasAny()', ->

					it 'should eventually be false', ->
						promise = resin.models.application.hasAny()
						m.chai.expect(promise).to.eventually.be.false

				describe 'resin.models.application.create()', ->

					it 'should be able to create an application', (done) ->
						resin.models.application.create('FooBar', 'raspberry-pi').then (id) ->
							promise = resin.models.application.getAll()
							m.chai.expect(promise).to.eventually.have.length(1)
						.nodeify(done)

					it 'should be rejected if the device type is invalid', ->
						promise = resin.models.application.create('FooBar', 'foobarbaz')
						m.chai.expect(promise).to.be.rejectedWith('Invalid device type: foobarbaz')

					it 'should be rejected if the name has less than three characters', ->
						promise = resin.models.application.create('Fo', 'raspberry-pi')
						m.chai.expect(promise).to.be.rejectedWith('It is necessary that each app name that is of a user (Auth), has a Length (Type) that is greater than or equal to 4.')

					it 'should be able to create an application using a device type alias', (done) ->
						resin.models.application.create('FooBar', 'raspberrypi').then (id) ->
							promise = resin.models.application.getAll()
							m.chai.expect(promise).to.eventually.have.length(1)
						.nodeify(done)

		describe 'Key Model', ->

			describe 'given no keys', ->

				describe 'resin.models.key.getAll()', ->

					it 'should become an empty array', ->
						promise = resin.models.key.getAll()
						m.chai.expect(promise).to.become([])

				describe 'resin.models.key.create()', ->

					it 'should be able to create a key', (done) ->
						key = fs.readFileSync(path.join(__dirname, 'data', 'keys', 'id_rsa.pub'), encoding: 'utf8')
						resin.models.key.create('MyKey', key).then ->
							return resin.models.key.getAll()
						.then (keys) ->
							m.chai.expect(keys).to.have.length(1)
							m.chai.expect(keys[0].public_key).to.equal(key.replace(/\n/g, ''))
							m.chai.expect(keys[0].title).to.equal('MyKey')
						.nodeify(done)

					it 'should be able to create a key from a non trimmed string', (done) ->
						key = fs.readFileSync(path.join(__dirname, 'data', 'keys', 'id_rsa.pub'), encoding: 'utf8')
						resin.models.key.create('MyKey', "    #{key}    ").then ->
							return resin.models.key.getAll()
						.then (keys) ->
							m.chai.expect(keys).to.have.length(1)
							m.chai.expect(keys[0].public_key).to.equal(key.replace(/\n/g, ''))
							m.chai.expect(keys[0].title).to.equal('MyKey')
						.nodeify(done)

			describe 'given a single key', ->

				beforeEach (done) ->
					publicKey = fs.readFileSync(path.join(__dirname, 'data', 'keys', 'id_rsa.pub'), encoding: 'utf8')
					resin.models.key.create('MyKey', publicKey).then (key) =>
						@key = key
					.nodeify(done)

				describe 'resin.models.key.getAll()', ->

					it 'should become the list of keys', (done) ->
						resin.models.key.getAll().then (keys) =>
							m.chai.expect(keys).to.have.length(1)
							m.chai.expect(keys[0].public_key).to.equal(@key.public_key.replace(/\n/g, ''))
							m.chai.expect(keys[0].title).to.equal('MyKey')
						.nodeify(done)

				describe 'resin.models.key.get()', ->

					it 'should be able to get a key', (done) ->
						resin.models.key.get(@key.id).then (key) =>
							m.chai.expect(key.public_key).to.equal(@key.public_key.replace(/\n/g, ''))
							m.chai.expect(key.title).to.equal('MyKey')
						.nodeify(done)

					it 'should be rejected if the key id is invalid', ->
						promise = resin.models.key.get(99999999999)
						m.chai.expect(promise).to.be.rejectedWith('Key not found: 99999999999')

				describe 'resin.models.key.remove()', ->

					it 'should be able to remove the key', (done) ->
						resin.models.key.remove(@key.id).then ->
							promise = resin.models.key.getAll()
							m.chai.expect(promise).to.eventually.have.length(0)
						.nodeify(done)

		describe 'given a single application without devices', ->

			beforeEach (done) ->
				resin.models.application.create('FooBar', 'raspberry-pi').then (application) =>
					@application = application
				.nodeify(done)

			describe 'Application Model', ->

				describe 'resin.models.application.hasAny()', ->

					it 'should eventually be true', ->
						promise = resin.models.application.hasAny()
						m.chai.expect(promise).to.eventually.be.true

				describe 'resin.models.application.create()', ->

					it 'should reject if trying to create an app with the same name', ->
						promise = resin.models.application.create('FooBar', 'beaglebone-black')
						m.chai.expect(promise).to.be.rejectedWith('Application name must be unique')

				describe 'resin.models.application.hasAny()', ->

					it 'should eventually be true', ->
						promise = resin.models.application.hasAny()
						m.chai.expect(promise).to.eventually.be.true

				describe 'resin.models.application.getAll()', ->

					it 'should return an array with length 1', ->
						promise = resin.models.application.getAll()
						m.chai.expect(promise).to.eventually.have.length(1)

					it 'should eventually become an array containing the application', (done) ->
						resin.models.application.getAll().then (applications) =>
							m.chai.expect(applications[0].id).to.equal(@application.id)
						.nodeify(done)

					it 'should add a devices_length property', (done) ->
						resin.models.application.getAll().then (applications) ->
							m.chai.expect(applications[0].devices_length).to.equal(0)
						.nodeify(done)

					it 'should add an online_devices property', (done) ->
						resin.models.application.getAll().then (applications) ->
							m.chai.expect(applications[0].online_devices).to.equal(0)
						.nodeify(done)

				describe 'resin.models.application.get()', ->

					it 'should be able to get an application', ->
						promise = resin.models.application.get(@application.app_name)
						m.chai.expect(promise).to.become(@application)

					it 'should be rejected if the application does not exist', ->
						promise = resin.models.application.get('HelloWorldApp')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

				describe 'resin.models.application.getById()', ->

					it 'should be able to get an application', ->
						promise = resin.models.application.getById(@application.id)
						m.chai.expect(promise).to.become(@application)

					it 'should be rejected if the application does not exist', ->
						promise = resin.models.application.getById(999999)
						m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

				describe 'resin.models.application.has()', ->

					it 'should eventually be true if the application exists', ->
						promise = resin.models.application.has(@application.app_name)
						m.chai.expect(promise).to.eventually.be.true

					it 'should eventually be true if the application does not exist', ->
						promise = resin.models.application.has('HelloWorldApp')
						m.chai.expect(promise).to.eventually.be.false

				describe 'resin.models.application.remove()', ->

					it 'should be able to remove an existing application', (done) ->
						resin.models.application.remove(@application.app_name).then ->
							promise = resin.models.application.getAll()
							m.chai.expect(promise).to.eventually.have.length(0)
						.nodeify(done)

					it 'should be rejected if the application does not exist', ->
						promise = resin.models.application.remove('HelloWorldApp')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

				describe 'resin.models.application.getApiKey()', ->

					it 'should be able to generate an API key', (done) ->
						resin.models.application.getApiKey(@application.app_name).then (apiKey) ->
							m.chai.expect(_.isString(apiKey)).to.be.true
							m.chai.expect(apiKey).to.have.length(32)
						.nodeify(done)

					it 'should be rejected if the application does no exist', ->
						promise = resin.models.application.getApiKey('HelloWorldApp')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

			describe 'Device Model', ->

				describe 'resin.models.device.getAll()', ->

					it 'should become an empty array', ->
						promise = resin.models.device.getAll()
						m.chai.expect(promise).to.become([])

				describe 'resin.models.device.getAllByApplication()', ->

					it 'should become an empty array', ->
						promise = resin.models.device.getAllByApplication(@application.app_name)
						m.chai.expect(promise).to.become([])

				describe 'resin.models.device.generateUUID()', ->

					it 'should generate a valid uuid', (done) ->
						resin.models.device.generateUUID().then (uuid) ->
							m.chai.expect(_.isString(uuid)).to.be.true
							m.chai.expect(uuid).to.have.length(62)
							m.chai.expect(uuid).to.match(/^[a-z0-9]{62}$/)
						.nodeify(done)

					it 'should generate different uuids', (done) ->
						Promise.props
							one: resin.models.device.generateUUID()
							two: resin.models.device.generateUUID()
							three: resin.models.device.generateUUID()
						.then (results) ->
							m.chai.expect(results.one).to.not.equal(results.two)
							m.chai.expect(results.two).to.not.equal(results.three)
						.nodeify(done)

				describe 'resin.models.device.getManifestByApplication()', ->

					it 'should return the appropriate manifest for an application', (done) ->
						resin.models.device.getManifestByApplication(@application.app_name).then (manifest) =>
							m.chai.expect(manifest.slug).to.equal(@application.device_type)
						.nodeify(done)

					it 'should be rejected if the application does not exist', ->
						promise = resin.models.device.getManifestByApplication('HelloWorldApp')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

				describe 'resin.models.device.register()', ->

					it 'should be able to register a device to a valid application', (done) ->
						resin.models.device.generateUUID().then (uuid) =>
							resin.models.device.register(@application.app_name, uuid)
						.then =>
							promise = resin.models.device.getAllByApplication(@application.app_name)
							m.chai.expect(promise).to.eventually.have.length(1)
						.nodeify(done)

					it 'should become a valid device object', (done) ->
						resin.models.device.generateUUID().then (uuid) =>
							resin.models.device.register(@application.app_name, uuid).then (device) ->
								m.chai.expect(device.device_type).to.equal('raspberry-pi')
								m.chai.expect(device.uuid).to.equal(uuid)
						.nodeify(done)

					it 'should be rejected if the application does not exist', (done) ->
						resin.models.device.generateUUID().then (uuid) ->
							promise = resin.models.device.register('HelloWorldApp', uuid)
							m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')
						.nodeify(done)

			describe 'Environment Variables Model', ->

				describe 'resin.models.environmentVariables.getAllByApplication()', ->

					it 'should become an empty array by default', ->
						promise = resin.models.environmentVariables.getAllByApplication(@application.app_name)
						m.chai.expect(promise).to.become([])

					it 'should be rejected if the application does not exist', ->
						promise = resin.models.environmentVariables.getAllByApplication('HelloWorldApp')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

				describe 'resin.models.environmentVariables.create()', ->

					it 'should be able to create a non resin variable', (done) ->
						resin.models.environmentVariables.create(@application.app_name, 'EDITOR', 'vim').then =>
							resin.models.environmentVariables.getAllByApplication(@application.app_name)
						.then (envs) ->
							m.chai.expect(envs).to.have.length(1)
							m.chai.expect(envs[0].name).to.equal('EDITOR')
							m.chai.expect(envs[0].value).to.equal('vim')
						.nodeify(done)

					it 'should be able to create a numeric non resin variable', (done) ->
						resin.models.environmentVariables.create(@application.app_name, 'EDITOR', 1).then =>
							resin.models.environmentVariables.getAllByApplication(@application.app_name)
						.then (envs) ->
							m.chai.expect(envs).to.have.length(1)
							m.chai.expect(envs[0].name).to.equal('EDITOR')
							m.chai.expect(envs[0].value).to.equal('1')
						.nodeify(done)

					it 'should not allow creating a resin variable', ->
						promise = resin.models.environmentVariables.create(@application.app_name, 'RESIN_API_KEY', 'secret')
						m.chai.expect(promise).to.be.rejectedWith('Environment variables beginning with RESIN_ are reserved.')

					it 'should be rejected if the application does not exist', ->
						promise = resin.models.environmentVariables.create('HelloWorldApp', 'EDITOR', 'vim')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

				describe 'given an existing environment variable', ->

					beforeEach (done) ->
						resin.models.environmentVariables.create(@application.app_name, 'EDITOR', 'vim').then (envVar) =>
							@envVar = envVar
						.nodeify(done)

					describe 'resin.models.environmentVariables.update()', ->

						it 'should be able to update an environment variable', (done) ->
							resin.models.environmentVariables.update(@envVar.id, 'emacs').then =>
								resin.models.environmentVariables.getAllByApplication(@application.app_name)
							.then (envs) ->
								m.chai.expect(envs).to.have.length(1)
								m.chai.expect(envs[0].name).to.equal('EDITOR')
								m.chai.expect(envs[0].value).to.equal('emacs')
							.nodeify(done)

					describe 'resin.models.environmentVariables.remove()', ->

						it 'should be able to remove an environment variable', (done) ->
							resin.models.environmentVariables.remove(@envVar.id).then =>
								resin.models.environmentVariables.getAllByApplication(@application.app_name)
							.then (envs) ->
								m.chai.expect(envs).to.have.length(0)
							.nodeify(done)

			describe 'Build Model', ->

				describe 'resin.models.build.getAllByApplication()', ->

					it 'should eventually become an empty array', ->
						promise = resin.models.build.getAllByApplication('FooBar')
						m.chai.expect(promise).to.become([])

				describe 'resin.models.build.getAllByApplication()', ->

					it 'should be rejected with an error if the application does not exist', ->
						promise = resin.models.build.getAllByApplication('Hello')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: Hello')

		describe 'given a single application with a single offline device', ->

			beforeEach (done) ->
				resin.models.application.create('FooBar', 'raspberry-pi').then (application) =>
					@application = application

					resin.models.device.generateUUID().then (uuid) ->
						resin.models.device.register(application.app_name, uuid)
					.then (device) =>
						@device = device
				.nodeify(done)

			describe 'Device Model', ->

				describe 'resin.models.device.getAll()', ->

					it 'should become the device', (done) ->
						resin.models.device.getAll().then (devices) =>
							m.chai.expect(devices).to.have.length(1)
							m.chai.expect(devices[0].id).to.equal(@device.id)
						.nodeify(done)

					it 'should add an application_name property', (done) ->
						resin.models.device.getAll().then (devices) =>
							m.chai.expect(devices[0].application_name).to.equal(@application.app_name)
						.nodeify(done)

				describe 'resin.models.device.getAllByApplication()', ->

					it 'should get the device given the right application', (done) ->
						resin.models.device.getAllByApplication(@application.app_name).then (devices) =>
							m.chai.expect(devices).to.have.length(1)
							m.chai.expect(devices[0].id).to.equal(@device.id)
						.nodeify(done)

					it 'should add an application_name property', (done) ->
						resin.models.device.getAllByApplication(@application.app_name).then (devices) =>
							m.chai.expect(devices[0].application_name).to.equal(@application.app_name)
						.nodeify(done)

					it 'should be rejected if the application does not exist', ->
						promise = resin.models.device.getAllByApplication('HelloWorldApp')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

				describe 'resin.models.device.get()', ->

					it 'should be able to get the device', (done) ->
						resin.models.device.get(@device.uuid).then (device) =>
							m.chai.expect(device.id).to.equal(@device.id)
						.nodeify(done)

					it 'should add an application_name property', (done) ->
						resin.models.device.get(@device.uuid).then (device) =>
							m.chai.expect(device.application_name).to.equal(@application.app_name)
						.nodeify(done)

					it 'should be rejected if the device does not exist', ->
						promise = resin.models.device.get('asdfghjkl')
						m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

					it 'should be able to use a shorter uuid', (done) ->
						resin.models.device.get(@device.uuid.slice(0, 8)).then (device) =>
							m.chai.expect(device.id).to.equal(@device.id)
						.nodeify(done)

				describe 'resin.models.device.getByName()', ->

					it 'should be able to get the device', (done) ->
						resin.models.device.getByName(@device.name).then (devices) =>
							m.chai.expect(devices).to.have.length(1)
							m.chai.expect(devices[0].id).to.equal(@device.id)
						.nodeify(done)

					it 'should add an application_name property', (done) ->
						resin.models.device.getByName(@device.name).then (devices) =>
							m.chai.expect(devices[0].application_name).to.equal(@application.app_name)
						.nodeify(done)

					it 'should be rejected if the device does not exist', ->
						promise = resin.models.device.getByName('HelloWorldDevice')
						m.chai.expect(promise).to.be.rejectedWith('Device not found: HelloWorldDevice')

				describe 'resin.models.device.getName()', ->

					it 'should get the correct name', ->
						promise = resin.models.device.getName(@device.uuid)
						m.chai.expect(promise).to.eventually.equal(@device.name)

					it 'should be rejected if the device does not exist', ->
						promise = resin.models.device.getName('asdfghjkl')
						m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				describe 'resin.models.device.getApplicationName()', ->

					it 'should get the correct application name', ->
						promise = resin.models.device.getApplicationName(@device.uuid)
						m.chai.expect(promise).to.eventually.equal(@application.app_name)

					it 'should be rejected if the device does not exist', ->
						promise = resin.models.device.getApplicationName('asdfghjkl')
						m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				describe 'resin.models.device.has()', ->

					it 'should eventually be true if the device exists', ->
						promise = resin.models.device.has(@device.uuid)
						m.chai.expect(promise).to.eventually.be.true

					it 'should eventually be false if the device does not exist', ->
						promise = resin.models.device.has('asdfghjkl')
						m.chai.expect(promise).to.eventually.be.false

				describe 'resin.models.device.isOnline()', ->

					it 'should eventually be false', ->
						promise = resin.models.device.isOnline(@device.uuid)
						m.chai.expect(promise).to.eventually.be.false

					it 'should be rejected if the device does not exist', ->
						promise = resin.models.device.isOnline('asdfghjkl')
						m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				describe 'resin.models.device.getLocalIPAddresses()', ->

					it 'should be rejected with an offline error', ->
						promise = resin.models.device.getLocalIPAddresses(@device.uuid)
						m.chai.expect(promise).to.be.rejectedWith("The device is offline: #{@device.uuid}")

					it 'should be rejected if the device does not exist', ->
						promise = resin.models.device.getLocalIPAddresses('asdfghjkl')
						m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				describe 'resin.models.device.remove()', ->

					it 'should be able to remove the device', (done) ->
						resin.models.device.remove(@device.uuid)
							.then(resin.models.device.getAll)
							.then (devices) ->
								m.chai.expect(devices).to.deep.equal([])
					  .nodeify(done)

					it 'should be able to remove the device using a shorter uuid', (done) ->
						resin.models.device.remove(@device.uuid.slice(0, 7))
							.then(resin.models.device.getAll)
							.then (devices) ->
								m.chai.expect(devices).to.deep.equal([])
					  .nodeify(done)

					it 'should be rejected if the device does not exist', ->
						promise = resin.models.device.remove('asdfghjkl')
						m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				describe 'resin.models.device.rename()', ->

					it 'should be able to rename the device', (done) ->
						resin.models.device.rename(@device.uuid, 'FooBarDevice').then =>
							resin.models.device.getName(@device.uuid)
						.then (name) ->
							m.chai.expect(name).to.equal('FooBarDevice')
						.nodeify(done)

					it 'should be able to rename the device using a shorter uuid', (done) ->
						resin.models.device.rename(@device.uuid.slice(0, 7), 'FooBarDevice').then =>
							resin.models.device.getName(@device.uuid)
						.then (name) ->
							m.chai.expect(name).to.equal('FooBarDevice')
						.nodeify(done)

					it 'should be rejected if the device does not exist', ->
						promise = resin.models.device.rename('asdfghjkl', 'Foo Bar')
						m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				describe 'resin.models.device.note()', ->

					it 'should be able to note a device', (done) ->
						resin.models.device.note(@device.uuid, 'What you do today can improve all your tomorrows').then =>
							resin.models.device.get(@device.uuid)
						.then (device) ->
							m.chai.expect(device.note).to.equal('What you do today can improve all your tomorrows')
						.nodeify(done)

					it 'should be rejected if the device does not exist', ->
						promise = resin.models.device.note('asdfghjkl', 'My note')
						m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				describe 'given device url is disabled', ->

					describe 'resin.models.device.hasDeviceUrl()', ->

						it 'should eventually be false', ->
							promise = resin.models.device.hasDeviceUrl(@device.uuid)
							m.chai.expect(promise).to.eventually.be.false

						it 'should be rejected if the device does not exist', ->
							promise = resin.models.device.hasDeviceUrl('asdfghjkl')
							m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

					describe 'resin.models.device.getDeviceUrl()', ->

						it 'should be rejected with an error', ->
							promise = resin.models.device.getDeviceUrl(@device.uuid)
							m.chai.expect(promise).to.be.rejectedWith("Device is not web accessible: #{@device.uuid}")

						it 'should be rejected if the device does not exist', ->
							promise = resin.models.device.getDeviceUrl('asdfghjkl')
							m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

					describe 'resin.models.device.enableDeviceUrl()', ->

						it 'should be able to enable web access', (done) ->
							resin.models.device.enableDeviceUrl(@device.uuid).then =>
								promise = resin.models.device.hasDeviceUrl(@device.uuid)
								m.chai.expect(promise).to.eventually.be.true
							.nodeify(done)

						it 'should be able to enable web access using a shorter uuid', (done) ->
							resin.models.device.enableDeviceUrl(@device.uuid.slice(0, 7)).then =>
								promise = resin.models.device.hasDeviceUrl(@device.uuid)
								m.chai.expect(promise).to.eventually.be.true
							.nodeify(done)

						it 'should be rejected if the device does not exist', ->
							promise = resin.models.device.enableDeviceUrl('asdfghjkl')
							m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				describe 'given device url is enabled', ->

					beforeEach (done) ->
						resin.models.device.enableDeviceUrl(@device.uuid).nodeify(done)

					describe 'resin.models.device.hasDeviceUrl()', ->

						it 'should eventually be true', ->
							promise = resin.models.device.hasDeviceUrl(@device.uuid)
							m.chai.expect(promise).to.eventually.be.true

					describe 'resin.models.device.getDeviceUrl()', ->

						it 'should eventually return the correct device url given a shorter uuid', ->
							promise = resin.models.device.getDeviceUrl(@device.uuid.slice(0, 7))
							m.chai.expect(promise).to.eventually.match(/[a-z0-9]{62}/)

						it 'should eventually be an absolute url', (done) ->
							resin.models.device.getDeviceUrl(@device.uuid).then (deviceUrl) ->
								return request.getAsync(deviceUrl)
							.then (response) ->

								# Because the device is not online
								m.chai.expect(response.statusCode).to.equal(503)

								# Standard HTML title for web enabled devices
								$ = cheerio.load(response.body)
								m.chai.expect($('title').text()).to.equal('Resin.io Device Public URLs')
							.nodeify(done)

					describe 'resin.models.device.disableDeviceUrl()', ->

						it 'should be able to disable web access', (done) ->
							resin.models.device.disableDeviceUrl(@device.uuid).then =>
								promise = resin.models.device.hasDeviceUrl(@device.uuid)
								m.chai.expect(promise).to.eventually.be.false
							.nodeify(done)

						it 'should be able to disable web access using a shorter uuid', (done) ->
							resin.models.device.disableDeviceUrl(@device.uuid.slice(0, 7)).then =>
								promise = resin.models.device.hasDeviceUrl(@device.uuid)
								m.chai.expect(promise).to.eventually.be.false
							.nodeify(done)

				describe 'resin.models.device.getStatus()', ->

					it 'should return the correct status slug', ->
						promise = resin.models.device.getStatus(@device.uuid)
						m.chai.expect(promise).to.eventually.equal('offline')

			describe 'Environment Variables Model', ->

				describe 'resin.models.environmentVariables.device.getAll()', ->

					it 'should become an empty array by default', ->
						promise = resin.models.environmentVariables.device.getAll(@device.uuid)
						m.chai.expect(promise).to.become([])

					it 'should be rejected if the device does not exist', ->
						promise = resin.models.environmentVariables.device.getAll('asdfghjkl')
						m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				describe 'resin.models.environmentVariables.device.create()', ->

					it 'should be able to create a non resin variable', (done) ->
						resin.models.environmentVariables.device.create(@device.uuid, 'EDITOR', 'vim').then =>
							resin.models.environmentVariables.device.getAll(@device.uuid)
						.then (envs) ->
							m.chai.expect(envs).to.have.length(1)
							m.chai.expect(envs[0].name).to.equal('EDITOR')
							m.chai.expect(envs[0].value).to.equal('vim')
						.nodeify(done)

					it 'should be able to create a numeric non resin variable', (done) ->
						resin.models.environmentVariables.device.create(@device.uuid, 'EDITOR', 1).then =>
							resin.models.environmentVariables.device.getAll(@device.uuid)
						.then (envs) ->
							m.chai.expect(envs).to.have.length(1)
							m.chai.expect(envs[0].name).to.equal('EDITOR')
							m.chai.expect(envs[0].value).to.equal('1')
						.nodeify(done)

					it 'should not allow creating a resin variable', ->
						promise = resin.models.environmentVariables.device.create(@device.uuid, 'RESIN_API_KEY', 'secret')
						m.chai.expect(promise).to.be.rejectedWith('Environment variables beginning with RESIN_ are reserved.')

					it 'should be rejected if the device does not exist', ->
						promise = resin.models.environmentVariables.device.create('asdfghjkl', 'EDITOR', 'vim')
						m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				describe 'given an existing environment variable', ->

					beforeEach (done) ->
						resin.models.environmentVariables.device.create(@device.uuid, 'EDITOR', 'vim').then (envVar) =>
							@envVar = envVar
						.nodeify(done)

					describe 'resin.models.environmentVariables.device.update()', ->

						it 'should be able to update an environment variable', (done) ->
							resin.models.environmentVariables.device.update(@envVar.id, 'emacs').then =>
								resin.models.environmentVariables.device.getAll(@device.uuid)
							.then (envs) ->
								m.chai.expect(envs).to.have.length(1)
								m.chai.expect(envs[0].name).to.equal('EDITOR')
								m.chai.expect(envs[0].value).to.equal('emacs')
							.nodeify(done)

					describe 'resin.models.environmentVariables.device.remove()', ->

						it 'should be able to remove an environment variable', (done) ->
							resin.models.environmentVariables.device.remove(@envVar.id).then =>
								resin.models.environmentVariables.device.getAll(@device.uuid)
							.then (envs) ->
								m.chai.expect(envs).to.have.length(0)
							.nodeify(done)


		describe 'given a single application with a device id whose shorter uuid is only numbers', ->

			beforeEach (done) ->
				resin.models.application.create('TestApp', 'raspberry-pi').then (application) =>
					@application = application

					uuid = '1234567aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
					resin.models.device.register(application.app_name, uuid)
				.then (device) =>
					@device = device
				.nodeify(done)

			describe 'Device Model', ->

				describe 'resin.models.device.get()', ->

					it 'should return the device given the number shorter uuid', (done) ->
						resin.models.device.get(1234567).then (device) =>
							m.chai.expect(device.id).to.equal(@device.id)
						.nodeify(done)

		describe 'given a single application with two offline devices that share the same uuid root', ->

			beforeEach (done) ->
				resin.models.application.create('FooBar', 'raspberry-pi').then (application) =>
					@application = application

					uuid1 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
					uuid2 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

					Promise.props
						one: resin.models.device.register(application.app_name, uuid1)
						two: resin.models.device.register(application.app_name, uuid2)
					.then (devices) =>
						@devices = devices
				.nodeify(done)

			describe 'Device Model', ->

				describe 'resin.models.device.get()', ->

					it 'should be rejected with an error if there is an ambiguation between shorter uuids', ->
						promise = resin.models.device.get('aaaaaaaaaaaaaaaa')
						m.chai.expect(promise).to.be.rejectedWith(errors.ResinAmbiguousDevice)

				describe 'resin.models.device.has()', ->

					it 'should be rejected with an error for an ambiguous shorter uuid', ->
						promise = resin.models.device.has('aaaaaaaaaaaaaaaa')
						m.chai.expect(promise).to.be.rejectedWith(errors.ResinAmbiguousDevice)

		describe 'given two compatible applications and a single device', ->

			beforeEach (done) ->
				Promise.props
					application1: resin.models.application.create('FooBar', 'raspberry-pi')
					application2: resin.models.application.create('BarBaz', 'raspberry-pi')
				.then (results) =>
					@application1 = results.application1
					@application2 = results.application2

					resin.models.device.generateUUID().then (uuid) ->
						resin.models.device.register(results.application1.app_name, uuid)
					.then (device) =>
						@device = device
				.nodeify(done)

			describe 'resin.models.device.move()', ->

				it 'should be able to move a device', (done) ->
					resin.models.device.move(@device.uuid, @application2.app_name).then =>
						resin.models.device.getApplicationName(@device.uuid)
					.then (applicationName) =>
						m.chai.expect(applicationName).to.equal(@application2.app_name)
					.nodeify(done)

				it 'should be able to move a device using shorter uuids', (done) ->
					resin.models.device.move(@device.uuid.slice(0, 7), @application2.app_name).then =>
						resin.models.device.getApplicationName(@device.uuid)
					.then (applicationName) =>
						m.chai.expect(applicationName).to.equal(@application2.app_name)
					.nodeify(done)

		describe 'given two incompatible applications and a single device', ->

			beforeEach (done) ->
				Promise.props
					application1: resin.models.application.create('FooBar', 'raspberry-pi')
					application2: resin.models.application.create('BarBaz', 'beaglebone-black')
				.then (results) =>
					@application1 = results.application1
					@application2 = results.application2

					resin.models.device.generateUUID().then (uuid) ->
						resin.models.device.register(results.application1.app_name, uuid)
					.then (device) =>
						@device = device
				.nodeify(done)

			describe 'resin.models.device.move()', ->

				it 'should be rejected with an incompatiblity error', ->
					promise = resin.models.device.move(@device.uuid, @application2.app_name)
					m.chai.expect(promise).to.be.rejectedWith("Incompatible application: #{@application2.app_name}")

		describe 'OS Model', ->

			describe 'resin.models.os.getLastModified()', ->

				describe 'given a valid device slug', ->

					it 'should eventually be a valid Date instance', ->
						promise = resin.models.os.getLastModified('raspberry-pi')
						m.chai.expect(promise).to.eventually.be.an.instanceof(Date)

					it 'should eventually be a valid Date instance if passing a device type alias', ->
						promise = resin.models.os.getLastModified('raspberrypi')
						m.chai.expect(promise).to.eventually.be.an.instanceof(Date)

				describe 'given an invalid device slug', ->

					it 'should be rejected with an error message', ->
						promise = resin.models.os.getLastModified('foo-bar-baz')
						m.chai.expect(promise).to.be.rejectedWith('No such device type')

			describe 'resin.models.os.download()', ->

				describe 'given a valid device slug', ->

					it 'should contain a valid mime property', (done) ->
						resin.models.os.download('parallella').then (stream) ->
							m.chai.expect(stream.mime).to.equal('application/octet-stream')
						.nodeify(done)

					it 'should contain a valid mime property if passing a device type alias', (done) ->
						resin.models.os.download('raspberrypi').then (stream) ->
							m.chai.expect(stream.mime).to.equal('application/octet-stream')
						.nodeify(done)

					it 'should be able to download the image', (done) ->
						tmpFile = tmp.tmpNameSync()
						resin.models.os.download('parallella').then (stream) ->
							stream.pipe(fs.createWriteStream(tmpFile))
						.then(rindle.wait)
						.then ->
							return fs.statAsync(tmpFile)
						.then (stat) ->
							m.chai.expect(stat.size).to.not.equal(0)
						.finally ->
							fs.unlinkAsync(tmpFile)
						.nodeify(done)

				describe 'given an invalid device slug', ->

					it 'should be rejected with an error message', ->
						promise = resin.models.os.download('foo-bar-baz')
						m.chai.expect(promise).to.be.rejectedWith('Request error: Device type "foo-bar-baz" not found')
