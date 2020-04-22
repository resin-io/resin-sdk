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

import * as Promise from 'bluebird';
import { InjectedDependenciesParam, InjectedOptionsParam } from './balena';

const get2fa = function(
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { apiUrl } = opts;

	/**
	 * @summary Check if two factor authentication is enabled
	 * @name isEnabled
	 * @public
	 * @function
	 * @memberof balena.auth.twoFactor
	 *
	 * @fulfil {Boolean} - whether 2fa is enabled
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.twoFactor.isEnabled().then(function(isEnabled) {
	 * 	if (isEnabled) {
	 * 		console.log('2FA is enabled for this account');
	 * 	}
	 * });
	 *
	 * @example
	 * balena.auth.twoFactor.isEnabled(function(error, isEnabled) {
	 * 	if (error) throw error;
	 *
	 * 	if (isEnabled) {
	 * 		console.log('2FA is enabled for this account');
	 * 	}
	 * });
	 */
	function isEnabled(
		callback?: (error?: Error, result?: boolean) => void,
	): Promise<boolean> {
		return deps.auth
			.needs2FA()
			.then(twoFactorRequired => twoFactorRequired != null)
			.asCallback(callback);
	}

	/**
	 * @summary Check if two factor authentication challenge was passed
	 * @name isPassed
	 * @public
	 * @function
	 * @memberof balena.auth.twoFactor
	 *
	 * @fulfil {Boolean} - whether 2fa challenge was passed
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.twoFactor.isPassed().then(function(isPassed) {
	 * 	if (isPassed) {
	 * 		console.log('2FA challenge passed');
	 * 	}
	 * });
	 *
	 * @example
	 * balena.auth.twoFactor.isPassed(function(error, isPassed) {
	 * 	if (error) throw error;
	 *
	 * 	if (isPassed) {
	 * 		console.log('2FA challenge passed');
	 * 	}
	 * });
	 */
	function isPassed(
		callback?: (error?: Error, result?: boolean) => void,
	): Promise<boolean> {
		return deps.auth
			.needs2FA()
			.then(twoFactorRequired => !twoFactorRequired)
			.asCallback(callback);
	}

	/**
	 * @summary Challenge two factor authentication
	 * @name challenge
	 * @public
	 * @function
	 * @memberof balena.auth.twoFactor
	 *
	 * @param {String} code - code
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.twoFactor.challenge('1234');
	 *
	 * @example
	 * balena.auth.twoFactor.challenge('1234', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	function challenge(
		code: string,
		callback?: (error?: Error) => void,
	): Promise<void> {
		return deps.request
			.send({
				method: 'POST',
				url: '/auth/totp/verify',
				baseUrl: apiUrl,
				body: { code },
			})
			.get('body')
			.then(deps.auth.setKey)
			.asCallback(callback);
	}

	return {
		isEnabled,
		isPassed,
		challenge,
	};
};

export default get2fa;
