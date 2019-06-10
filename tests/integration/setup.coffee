Promise = require('bluebird')
_ = require('lodash')

{ chai } = require('mochainon')
chai.use(require('chai-samsam'))

exports.IS_BROWSER = IS_BROWSER = window?
exports.credentials = {}

if IS_BROWSER
	require('js-polyfills/es6')
	getSdk = window.balenaSdk
	env = window.__env__

	apiUrl = env.TEST_API_URL || 'https://api.balena-cloud.com'
	opts =
		apiUrl: apiUrl
		builderUrl: env.TEST_BUILDER_URL || apiUrl.replace('api.', 'builder.')

else
	getSdk = require('../..')
	settings = require('balena-settings-client')
	env = process.env

	apiUrl = env.TEST_API_URL || settings.get('apiUrl')
	opts =
		apiUrl: apiUrl
		builderUrl: env.TEST_BUILDER_URL || apiUrl.replace('api.', 'builder.')
		dataDirectory: settings.get('dataDirectory')

_.assign opts,
	apiKey: null
	isBrowser: IS_BROWSER,
	retries: 3

exports.getSdk = getSdk
exports.sdkOpts = opts
exports.balena = balena = getSdk(opts)

shouldDeleteTestUser = false

getCredentials = _.once Promise.method ->
	username = "sdk_tests_#{Date.now()}"
	register_username = "#{username}_reg"

	getUserCredentials = (username) ->
		username: username
		email: "#{username}@balena.io"
		password: "#{username}_!@#"

	tmpEnv = env || {}
	envTestUserCredentials =
		username: tmpEnv.TEST_USERNAME
		email: env.TEST_EMAIL
		password: env.TEST_PASSWORD

	envPaidUserCredentials =
		paid:
			email: env.TEST_PAID_EMAIL
			password: env.TEST_PAID_PASSWORD

	credentials = _.assign({},
		getUserCredentials(username),
		envPaidUserCredentials,
		register: getUserCredentials(register_username)
	)

	if _.every(envTestUserCredentials)
		_.assign(credentials, envTestUserCredentials)
		console.log("Using ENV test user #{credentials.email}")
		return credentials

	balena.auth.register
		email: credentials.email
		password: credentials.password
	.tap ->
		shouldDeleteTestUser = true
		console.log("Using autogenerated test user #{credentials.email}")
	.return(credentials)
	.tapCatch ->
		console.error('Failed to autogenerate test credentials!')

exports.resetUser = ->
	return balena.auth.isLoggedIn().then (isLoggedIn) ->
		return if not isLoggedIn

		Promise.all [
			balena.pine.delete
				resource: 'application'

			balena.pine.delete
				resource: 'user__has__public_key'

			balena.pine.delete
				resource: 'api_key'
				# only delete named user api keys
				options: $filter: name: $ne: null
			# Api keys can't delete api keys, just ignore failures here
			.catchReturn()
		]

exports.givenLoggedInUserWithApiKey = (beforeFn) ->
	beforeFn ->
		balena.auth.login
			email: exports.credentials.email
			password: exports.credentials.password
		.then ->
			return balena.request.send
				method: 'POST'
				url: '/api-key/user/full'
				baseUrl: opts.apiUrl
				body:
					name: 'apiKey'
		.get('body')
		.tap(balena.auth.logout)
		.then(balena.auth.loginWithToken)
		.then(exports.resetUser)

	afterFn = if beforeFn == beforeEach then afterEach else after
	afterFn ->
		exports.resetUser()

exports.givenLoggedInUser = (beforeFn) ->
	beforeFn ->
		balena.auth.login
			email: exports.credentials.email
			password: exports.credentials.password
		.then(exports.resetUser)

	afterFn = if beforeFn == beforeEach then afterEach else after
	afterFn ->
		exports.resetUser()

exports.loginPaidUser = ->
	balena.auth.login
		email: exports.credentials.paid.email
		password: exports.credentials.paid.password

resetApplications = ->
	balena.pine.delete
		resource: 'application'

exports.givenAnApplication = (beforeFn) ->
	beforeFn ->
		# calling this.skip() doesn't trigger afterEach,
		# so we need to reset in here as well
		# See: https://github.com/mochajs/mocha/issues/3740
		resetApplications()
		.then ->
			balena.models.application.create
				name: 'FooBar'
				applicationType: 'microservices-starter'
				deviceType: 'raspberry-pi'
		.then (application) =>
			@application = application

	afterFn = if beforeFn == beforeEach then afterEach else after
	afterFn resetApplications

resetDevices = ->
	balena.pine.delete
		resource: 'device'

exports.givenADevice = (beforeFn, extraDeviceProps) ->
	beforeFn ->
		# calling this.skip() doesn't trigger afterEach,
		# so we need to reset in here as well
		# See: https://github.com/mochajs/mocha/issues/3740
		resetDevices()
		.then =>
			uuid = balena.models.device.generateUniqueKey()
			balena.models.device.register(@application.app_name, uuid)
		.tap (deviceInfo) =>
			if !@currentRelease || !@currentRelease.commit
				return

			balena.pine.patch
				resource: 'device'
				body:
					is_on__commit: @currentRelease.commit
				options:
					$filter:
						uuid: deviceInfo.uuid
		.tap (deviceInfo) ->
			if !extraDeviceProps
				return

			balena.pine.patch
				resource: 'device'
				body: extraDeviceProps
				options:
					$filter:
						uuid: deviceInfo.uuid
		.then (deviceInfo) ->
			balena.models.device.get(deviceInfo.uuid)
		.then (device) =>
			@device = device
		.tap (device) =>
			if !@currentRelease || !@currentRelease.commit
				return

			Promise.all [
				# Create image installs for the images on the device
				balena.pine.post
					resource: 'image_install'
					body:
						installs__image: @oldWebImage.id
						is_provided_by__release: @oldRelease.id
						device: device.id
						download_progress: 100
						status: 'running'
						install_date: '2017-10-01'
			,
				balena.pine.post
					resource: 'image_install'
					body:
						installs__image: @newWebImage.id
						is_provided_by__release: @currentRelease.id
						device: device.id
						download_progress: 50,
						status: 'downloading'
						install_date: '2017-10-30'
			,
				balena.pine.post
					resource: 'image_install'
					body:
						installs__image: @oldDbImage.id
						is_provided_by__release: @oldRelease.id
						device: device.id
						download_progress: 100,
						status: 'deleted',
						install_date: '2017-09-30'
			,
				balena.pine.post
					resource: 'image_install'
					body:
						installs__image: @newDbImage.id
						is_provided_by__release: @currentRelease.id
						device: device.id
						download_progress: 100,
						status: 'running',
						install_date: '2017-10-30'
			]
			.spread (oldWebInstall, newWebInstall, oldDbInstall, newDbInstall) =>
				@oldWebInstall = oldWebInstall
				@newWebInstall = newWebInstall
				@newDbInstall = newDbInstall

	afterFn = if beforeFn == beforeEach then afterEach else after
	afterFn resetDevices

exports.givenAnApplicationWithADevice = (beforeFn) ->
	exports.givenAnApplication(beforeFn)
	exports.givenADevice(beforeFn)

exports.givenMulticontainerApplicationWithADevice = (beforeFn) ->
	exports.givenMulticontainerApplication(beforeFn)
	exports.givenADevice(beforeFn)

exports.givenMulticontainerApplication = (beforeFn) ->
	exports.givenAnApplication(beforeFn)

	beforeFn ->
		Promise.try =>
			userId = @application.user.__id

			Promise.all [
				# Register web & DB services
				balena.pine.post
					resource: 'service'
					body:
						application: @application.id
						service_name: 'web'
			,
				balena.pine.post
					resource: 'service'
					body:
						application: @application.id
						service_name: 'db'
			,
				# Register an old & new release of this application
				Promise.mapSeries [
					resource: 'release'
					body:
						belongs_to__application: @application.id
						is_created_by__user: userId
						commit: 'old-release-commit'
						status: 'success'
						source: 'cloud'
						composition: {}
						start_timestamp: 1234
				,
					resource: 'release'
					body:
						belongs_to__application: @application.id
						is_created_by__user: userId
						commit: 'new-release-commit'
						status: 'success'
						source: 'cloud'
						composition: {}
						start_timestamp: 54321
				], (pineParams) -> balena.pine.post pineParams
			]
		.spread (webService, dbService, [oldRelease, newRelease]) =>
			@webService = webService
			@dbService = dbService
			@oldRelease = oldRelease
			@currentRelease = newRelease

			Promise.all [
				# Register an old & new web image build from the old and new
				# releases, a db build in the new release only
				balena.pine.post
					resource: 'image'
					body:
						is_a_build_of__service: webService.id
						project_type: 'dockerfile'
						content_hash: 'abc'
						build_log: 'old web log'
						start_timestamp: 1234
						push_timestamp: 1234
						status: 'success'
			,
				balena.pine.post
					resource: 'image'
					body:
						is_a_build_of__service: webService.id
						project_type: 'dockerfile'
						content_hash: 'def'
						build_log: 'new web log'
						start_timestamp: 54321
						push_timestamp: 54321
						status: 'success'
			,
				balena.pine.post
					resource: 'image'
					body:
						is_a_build_of__service: dbService.id
						project_type: 'dockerfile'
						content_hash: 'jkl'
						build_log: 'old db log'
						start_timestamp: 123
						push_timestamp: 123
						status: 'success'
			,
				balena.pine.post
					resource: 'image'
					body:
						is_a_build_of__service: dbService.id
						project_type: 'dockerfile'
						content_hash: 'ghi'
						build_log: 'new db log'
						start_timestamp: 54321
						push_timestamp: 54321
						status: 'success'
			]
			.spread (oldWebImage, newWebImage, oldDbImage, newDbImage) =>
				@oldWebImage = oldWebImage
				@newWebImage = newWebImage
				@oldDbImage = oldDbImage
				@newDbImage = newDbImage

				Promise.all [
					# Tie the images to their corresponding releases
					balena.pine.post
						resource: 'image__is_part_of__release'
						body:
							image: oldWebImage.id
							is_part_of__release: oldRelease.id
				,
					balena.pine.post
						resource: 'image__is_part_of__release'
						body:
							image: oldDbImage.id
							is_part_of__release: oldRelease.id
				,
					balena.pine.post
						resource: 'image__is_part_of__release'
						body:
							image: newWebImage.id
							is_part_of__release: newRelease.id
				,
					balena.pine.post
						resource: 'image__is_part_of__release'
						body:
							image: newDbImage.id
							is_part_of__release: newRelease.id
				,
				]

	afterFn = if beforeFn == beforeEach then afterEach else after
	afterFn ->
		@currentRelease = null

before ->
	console.log('************ setup ************')
	console.log("API Url: #{opts.apiUrl}")
	getCredentials()
	.then (result) ->
		# use assign, since this runs asynchronously, after
		# each test has imported the credentials object
		_.assign(exports.credentials, result)
	.finally -> console.log()

teardown = _.once Promise.method ->
	console.log('********** teardown **********')
	if !IS_BROWSER
		process.stderr.write('stderr: ********** teardown **********\n')

	if !shouldDeleteTestUser
		console.log('Nothing to clean.')
		if !IS_BROWSER
			process.stderr.write('stderr: Nothing to clean\n')

		return

	balena.auth.login
		email: exports.credentials.email
		password: exports.credentials.password
	.then(balena.auth.getUserId)
	.then (userId) ->
		shouldDeleteTestUser = false
		return balena.request.send
			method: 'DELETE'
			url: "/v2/user(#{userId})"
			baseUrl: exports.sdkOpts.apiUrl
		.then -> console.log('Deleted autogenerated test user')
		.then(balena.auth.logout)
	.catch(message: 'Request error: Unauthorized', ->)

after teardown

sigTearDown = (signalName) ->
	return ->
		process.stderr.write("Received #{signalName}, cleaning up. Please wait.\n")
		teardown()
		.then ->
			process.stderr.write('Cleaning up finished\n')

if !IS_BROWSER
	[
		'SIGINT'
		'SIGTERM'
	].forEach (signalName) ->
		process.on signalName, sigTearDown(signalName)
