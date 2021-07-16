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
import * as memoizee from 'memoizee';
import type { InjectedDependenciesParam, InjectedOptionsParam } from '.';

const getAuth = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { auth: authBase, pubsub, request, pine } = deps;
	const { apiUrl } = opts;

	const normalizeAuthError = function (err: errors.BalenaRequestError) {
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
		async function () {
			try {
				return await fn.apply(authBase, arguments);
			} finally {
				pubsub.publish(eventName);
			}
		} as T;

	const auth = {
		...authBase,
		setKey: wrapAuthFn('auth.keyChange', authBase.setKey),
		removeKey: wrapAuthFn('auth.keyChange', authBase.removeKey),
	} as typeof authBase;

	/**
	 * @namespace balena.auth.twoFactor
	 * @memberof balena.auth
	 */
	const twoFactor = (require('./2fa') as typeof import('./2fa')).default(
		{
			...deps,
			auth,
		},
		opts,
	);

	interface WhoamiResult {
		id: number;
		username: string;
		email: string;
	}

	const userWhoami = async () => {
		const { body } = await request.send<WhoamiResult>({
			method: 'GET',
			url: '/user/v1/whoami',
			baseUrl: apiUrl,
		});
		return body;
	};

	const memoizedUserWhoami = memoizee(userWhoami, {
		primitive: true,
		promise: true,
	});

	const getUserDetails = async (noCache = false) => {
		if (noCache) {
			memoizedUserWhoami.clear();
		}
		try {
			return await memoizedUserWhoami();
		} catch (err) {
			throw normalizeAuthError(err);
		}
	};

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
	async function whoami(): Promise<string | undefined> {
		try {
			const userDetails = await getUserDetails();
			return userDetails?.username;
		} catch (err) {
			if (err instanceof errors.BalenaNotLoggedIn) {
				return;
			}
			throw err;
		}
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
	async function authenticate(credentials: {
		email: string;
		password: string;
	}): Promise<string> {
		try {
			const { body } = await request.send<string>({
				method: 'POST',
				baseUrl: apiUrl,
				url: '/login_',
				body: {
					username: credentials.email,
					password: String(credentials.password),
				},
				sendToken: false,
			});
			return body;
		} catch (err) {
			if (err.statusCode === 401) {
				throw new errors.BalenaInvalidLoginCredentials();
			}
			if (err.statusCode === 429) {
				throw new errors.BalenaTooManyRequests();
			}
			throw err;
		}
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
	async function login(credentials: {
		email: string;
		password: string;
	}): Promise<void> {
		memoizedUserWhoami.clear();
		const token = await authenticate(credentials);
		await auth.setKey(token);
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
	function loginWithToken(authToken: string): Promise<void> {
		memoizedUserWhoami.clear();
		return auth.setKey(authToken);
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
	async function isLoggedIn(): Promise<boolean> {
		try {
			await getUserDetails(true);
			return true;
		} catch (err) {
			if (err instanceof errors.BalenaNotLoggedIn) {
				return false;
			}
			throw err;
		}
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
	function getToken(): Promise<string> {
		return auth.getKey().catch(function (err) {
			throw normalizeAuthError(err);
		});
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
	async function getUserId(): Promise<number> {
		const { id } = await getUserDetails();
		return id;
	}

	/**
	 * @summary Get current logged in user's actor id
	 * @name getUserActorId
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
	 * balena.auth.getUserActorId().then(function(userActorId) {
	 * 	console.log(userActorId);
	 * });
	 *
	 * @example
	 * balena.auth.getUserActorId(function(error, userActorId) {
	 * 	if (error) throw error;
	 * 	console.log(userActorId);
	 * });
	 */
	async function getUserActorId(): Promise<number> {
		const { actor } = (await pine.get({
			resource: 'user',
			id: await getUserId(),
			options: {
				$select: 'actor',
			},
		}))!;
		return actor;
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
	async function getEmail(): Promise<string> {
		const { email } = await getUserDetails();
		return email;
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
	function logout(): Promise<void> {
		memoizedUserWhoami.clear();
		return auth.removeKey();
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
	 *
	 */
	async function register(credentials: {
		email: string;
		password: string;
		'g-recaptcha-response'?: string;
	}): Promise<string> {
		const { body } = await request.send({
			method: 'POST',
			url: '/user/register',
			baseUrl: apiUrl,
			body: credentials,
			sendToken: false,
		});

		return body;
	}

	/**
	 * @summary Verifies an email
	 * @name verifyEmail
	 * @public
	 * @function
	 * @memberof balena.auth
	 *
	 * @param {Object} verificationPayload - in the form of email, and token
	 * @param {String} verificationPayload.email - the email
	 * @param {String} verificationPayload.token - the verification token
	 *
	 * @fulfil {String} - session token
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.verifyEmail({
	 * 	email: 'johndoe@gmail.com',
	 * 	token: '5bb11d90eefb34a70318f06a43ef063f'
	 * }).then(function(jwt) {
	 * 	console.log(jwt);
	 * });
	 *
	 */
	async function verifyEmail(verificationPayload: {
		email: string;
		token: string;
	}): Promise<string> {
		const email = verificationPayload.email;
		const verificationToken = verificationPayload.token;

		const { body } = await request.send({
			method: 'POST',
			url: '/user/v1/verify-email',
			body: {
				verificationToken,
				email,
			},
			baseUrl: apiUrl,
			sendToken: false,
		});

		return body;
	}

	/**
	 * @summary Re-send verification email to the user
	 * @name requestVerificationEmail
	 * @public
	 * @function
	 * @memberof balena.auth
	 * @description This will only work if you used {@link balena.auth.login} to log in.
	 *
	 * @fulfil {string} - returns with 'OK' status when successful
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.requestVerificationEmail().then(function() {
	 * 	console.log('Requesting verification email operation complete!');
	 * })
	 *
	 */
	async function requestVerificationEmail() {
		const id = await getUserId();
		return await pine.patch({
			resource: 'user',
			id,
			body: {
				has_been_sent_verification_email: true,
			},
		});
	}

	return {
		twoFactor: (
			require('./util/callbacks') as typeof import('./util/callbacks')
		).addCallbackSupportToModule(twoFactor) as typeof twoFactor,
		whoami,
		authenticate,
		login,
		loginWithToken,
		isLoggedIn,
		getToken,
		getUserId,
		getUserActorId,
		getEmail,
		logout,
		register,
		verifyEmail,
		requestVerificationEmail,
	};
};

export default getAuth;
