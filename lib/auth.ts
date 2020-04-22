/*
Copyright 2016 Balena

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import * as errors from 'balena-errors';
import * as Promise from 'bluebird';
// TODO: change to type-only import when we bump TS to 3.8
import _get2faModel from './2fa';
import { InjectedDependenciesParam, InjectedOptionsParam } from './balena';

const getAuth = function(
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { apiUrl } = opts;

	const normalizeAuthError = function(err: errors.BalenaRequestError) {
		if (err.statusCode === 401) {
			return new errors.BalenaNotLoggedIn();
		} else if (err.code === 'BalenaMalformedToken') {
			return new errors.BalenaNotLoggedIn();
		} else {
			return err;
		}
	};

	const wrapAuthFn = <T extends (...args: any[]) => Promise<any>>(
		eventName: string,
		fn: T,
	): T =>
		function() {
			return fn
				.apply(deps.auth, arguments)
				.finally(() => deps.pubsub.publish(eventName));
		} as T;

	const auth = {
		...deps.auth,
		setKey: wrapAuthFn('auth.keyChange', deps.auth.setKey),
		removeKey: wrapAuthFn('auth.keyChange', deps.auth.removeKey),
	} as typeof deps.auth;

	/**
	 * @namespace balena.auth.twoFactor
	 * @memberof balena.auth
	 */
	const twoFactor = (require('./2fa').default as typeof _get2faModel)(
		deps,
		opts,
	);

	interface WhoamiResult {
		id: number;
		username: string;
		email: string;
	}

	let userDetailsCache: WhoamiResult | null = null;

	const getUserDetails = () =>
		Promise.try(() => {
			if (userDetailsCache) {
				return userDetailsCache;
			}
			return deps.request
				.send<WhoamiResult>({
					method: 'GET',
					url: '/user/v1/whoami',
					baseUrl: apiUrl,
				})
				.then(({ body }) => {
					return (userDetailsCache = body);
				})
				.catch(function(err) {
					throw normalizeAuthError(err);
				});
		});

	/**
	 * @summary Return current logged in username
	 * @name whoami
	 * @public
	 * @function
	 * @memberof balena.auth
	 *
	 * @description This will only work if you used {@link balena.auth.login} to log in.
	 *
	 * @fulfil {(String|undefined)} - username, if it exists
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.whoami().then(function(username) {
	 * 	if (!username) {
	 * 		console.log('I\'m not logged in!');
	 * 	} else {
	 * 		console.log('My username is:', username);
	 * 	}
	 * });
	 *
	 * @example
	 * balena.auth.whoami(function(error, username) {
	 * 	if (error) throw error;
	 *
	 * 	if (!username) {
	 * 		console.log('I\'m not logged in!');
	 * 	} else {
	 * 		console.log('My username is:', username);
	 * 	}
	 * });
	 */
	function whoami(
		callback?: (error?: Error, result?: string | undefined) => void,
	): Promise<string | undefined> {
		return getUserDetails()
			.then(userDetails => userDetails?.username)
			.catchReturn(errors.BalenaNotLoggedIn, undefined)
			.asCallback(callback);
	}

	/**
	 * @summary Authenticate with the server
	 * @name authenticate
	 * @protected
	 * @function
	 * @memberof balena.auth
	 *
	 * @description You should use {@link balena.auth.login} when possible,
	 * as it takes care of saving the token and email as well.
	 *
	 * Notice that if `credentials` contains extra keys, they'll be discarted
	 * by the server automatically.
	 *
	 * @param {Object} credentials - in the form of email, password
	 * @param {String} credentials.email - the email
	 * @param {String} credentials.password - the password
	 *
	 * @fulfil {String} - session token
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.authenticate(credentials).then(function(token) {
	 * 	console.log('My token is:', token);
	 * });
	 *
	 * @example
	 * balena.auth.authenticate(credentials, function(error, token) {
	 * 	if (error) throw error;
	 * 	console.log('My token is:', token);
	 * });
	 */
	function authenticate(
		credentials: {
			email: string;
			password: string;
		},
		callback?: (error?: Error, result?: string) => void,
	): Promise<string> {
		return deps.request
			.send<string>({
				method: 'POST',
				baseUrl: apiUrl,
				url: '/login_',
				body: {
					username: credentials.email,
					password: String(credentials.password),
				},
				sendToken: false,
			})
			.get('body')
			.asCallback(callback);
	}

	/**
	 * @summary Login
	 * @name login
	 * @public
	 * @function
	 * @memberof balena.auth
	 *
	 * @description If the login is successful, the token is persisted between sessions.
	 *
	 * @param {Object} credentials - in the form of email, password
	 * @param {String} credentials.email - the email
	 * @param {String} credentials.password - the password
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.login(credentials);
	 *
	 * @example
	 * balena.auth.login(credentials, function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	function login(
		credentials: {
			email: string;
			password: string;
		},
		callback?: (error?: Error) => void,
	): Promise<void> {
		userDetailsCache = null;
		return authenticate(credentials)
			.then(auth.setKey)
			.asCallback(callback);
	}

	/**
	 * @summary Login with a token or api key
	 * @name loginWithToken
	 * @public
	 * @function
	 * @memberof balena.auth
	 *
	 * @description Login to balena with a session token or api key instead of with credentials.
	 *
	 * @param {String} authToken - the auth token
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.loginWithToken(authToken);
	 *
	 * @example
	 * balena.auth.loginWithToken(authToken, function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	function loginWithToken(
		authToken: string,
		callback?: (error?: Error) => void,
	): Promise<void> {
		userDetailsCache = null;
		return auth.setKey(authToken).asCallback(callback);
	}

	/**
	 * @summary Check if you're logged in
	 * @name isLoggedIn
	 * @public
	 * @function
	 * @memberof balena.auth
	 *
	 * @fulfil {Boolean} - is logged in
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.isLoggedIn().then(function(isLoggedIn) {
	 * 	if (isLoggedIn) {
	 * 		console.log('I\'m in!');
	 * 	} else {
	 * 		console.log('Too bad!');
	 * 	}
	 * });
	 *
	 * @example
	 * balena.auth.isLoggedIn(function(error, isLoggedIn) {
	 * 	if (error) throw error;
	 *
	 * 	if (isLoggedIn) {
	 * 		console.log('I\'m in!');
	 * 	} else {
	 * 		console.log('Too bad!');
	 * 	}
	 * });
	 */
	function isLoggedIn(
		callback?: (error?: Error, result?: boolean) => void,
	): Promise<boolean> {
		return getUserDetails()
			.return(true)
			.catchReturn(errors.BalenaNotLoggedIn, false)
			.asCallback(callback);
	}

	/**
	 * @summary Get current logged in user's raw API key or session token
	 * @name getToken
	 * @public
	 * @function
	 * @memberof balena.auth
	 *
	 * @description This will only work if you used {@link balena.auth.login} to log in.
	 *
	 * @fulfil {String} - raw API key or session token
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.getToken().then(function(token) {
	 * 	console.log(token);
	 * });
	 *
	 * @example
	 * balena.auth.getToken(function(error, token) {
	 * 	if (error) throw error;
	 * 	console.log(token);
	 * });
	 */
	function getToken(
		callback?: (error?: Error, result?: string) => void,
	): Promise<string> {
		return auth
			.getKey()
			.catch(function(err) {
				throw normalizeAuthError(err);
			})
			.asCallback(callback);
	}

	/**
	 * @summary Get current logged in user's id
	 * @name getUserId
	 * @public
	 * @function
	 * @memberof balena.auth
	 *
	 * @description This will only work if you used {@link balena.auth.login} to log in.
	 *
	 * @fulfil {Number} - user id
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.getUserId().then(function(userId) {
	 * 	console.log(userId);
	 * });
	 *
	 * @example
	 * balena.auth.getUserId(function(error, userId) {
	 * 	if (error) throw error;
	 * 	console.log(userId);
	 * });
	 */
	function getUserId(
		callback?: (error?: Error, result?: number) => void,
	): Promise<number> {
		return getUserDetails()
			.get('id')
			.asCallback(callback);
	}

	/**
	 * @summary Get current logged in user's email
	 * @name getEmail
	 * @public
	 * @function
	 * @memberof balena.auth
	 *
	 * @description This will only work if you used {@link balena.auth.login} to log in.
	 *
	 * @fulfil {String} - user email
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.getEmail().then(function(email) {
	 * 	console.log(email);
	 * });
	 *
	 * @example
	 * balena.auth.getEmail(function(error, email) {
	 * 	if (error) throw error;
	 * 	console.log(email);
	 * });
	 */
	function getEmail(
		callback?: (error?: Error, result?: string) => void,
	): Promise<string> {
		return getUserDetails()
			.get('email')
			.asCallback(callback);
	}

	/**
	 * @summary Logout
	 * @name logout
	 * @public
	 * @function
	 * @memberof balena.auth
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.logout();
	 *
	 * @example
	 * balena.auth.logout(function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	function logout(callback?: (error?: Error) => void): Promise<void> {
		userDetailsCache = null;
		return auth.removeKey().asCallback(callback);
	}

	/**
	 * @summary Register a user account
	 * @name register
	 * @public
	 * @function
	 * @memberof balena.auth
	 *
	 * @param {Object} credentials - in the form of username, password and email
	 * @param {String} credentials.email - the email
	 * @param {String} credentials.password - the password
	 * @param {(String|undefined)} [credentials.'g-recaptcha-response'] - the captcha response
	 *
	 * @fulfil {String} - session token
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.register({
	 * 	email: 'johndoe@gmail.com',
	 * 	password: 'secret'
	 * }).then(function(token) {
	 * 	console.log(token);
	 * });
	 *
	 * @example
	 * balena.auth.register({
	 * 	email: 'johndoe@gmail.com',
	 * 	password: 'secret'
	 * }, function(error, token) {
	 * 	if (error) throw error;
	 * 	console.log(token);
	 * });
	 */
	function register(
		credentials: {
			email: string;
			password: string;
			'g-recaptcha-response'?: string;
		},
		callback?: (error?: Error, result?: string) => void,
	): Promise<string> {
		return deps.request
			.send({
				method: 'POST',
				url: '/user/register',
				baseUrl: apiUrl,
				body: credentials,
				sendToken: false,
			})
			.get('body')
			.asCallback(callback);
	}

	return {
		twoFactor,
		whoami,
		authenticate,
		login,
		loginWithToken,
		isLoggedIn,
		getToken,
		getUserId,
		getEmail,
		logout,
		register,
	};
};

export default getAuth;
