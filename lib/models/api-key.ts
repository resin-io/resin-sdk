/*
Copyright 2018 Balena

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
import once = require('lodash/once');
import * as errors from 'balena-errors';

import type * as BalenaSdk from '..';
import type { InjectedDependenciesParam, InjectedOptionsParam } from '..';
import { mergePineOptions } from '../util';

const getApiKeysModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const applicationModel = once(() =>
		(require('./application') as typeof import('./application')).default(
			deps,
			opts,
		),
	);

	const { pine, request, sdkInstance } = deps;
	const { apiUrl } = opts;
	const exports = {
		/**
		 * @summary Creates a new user API key
		 * @name create
		 * @public
		 * @function
		 * @memberof balena.models.apiKey
		 *
		 * @description This method registers a new api key for the current user with the name given.
		 *
		 * @param {String} name - the API key name
		 * @param {String} [description=null] - the API key description
		 *
		 * @fulfil {String} - API key
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.apiKey.create(apiKeyName).then(function(apiKey) {
		 * 	console.log(apiKey);
		 * });
		 *
		 * @example
		 * balena.models.apiKey.create(apiKeyName, apiKeyDescription).then(function(apiKey) {
		 * 	console.log(apiKey);
		 * });
		 *
		 * @example
		 * balena.models.apiKey.create(apiKeyName, function(error, apiKey) {
		 * 	if (error) throw error;
		 * 	console.log(apiKey);
		 * });
		 */
		async create(
			name: string,
			description: string | null = null,
		): Promise<string> {
			const apiKeyBody: { name: string; description?: string | null } = {
				name,
			};
			if (typeof description === 'string' && !!description) {
				apiKeyBody.description = description;
			}
			try {
				const { body } = await request.send({
					method: 'POST',
					url: '/api-key/user/full',
					baseUrl: apiUrl,
					body: apiKeyBody,
				});
				return body;
			} catch {
				throw new errors.BalenaNotLoggedIn();
			}
		},

		/**
		 * @summary Get all accessible API keys
		 * @name getAll
		 * @public
		 * @function
		 * @memberof balena.models.apiKey
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - apiKeys
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.apiKey.getAll().then(function(apiKeys) {
		 * 	console.log(apiKeys);
		 * });
		 *
		 * @example
		 * balena.models.apiKey.getAll(function(error, apiKeys) {
		 * 	if (error) throw error;
		 * 	console.log(apiKeys);
		 * });
		 */
		async getAll(
			options: BalenaSdk.PineOptions<BalenaSdk.ApiKey> = {},
		): Promise<BalenaSdk.ApiKey[]> {
			return await pine.get({
				resource: 'api_key',
				options: mergePineOptions(
					{
						$orderby: 'name asc',
					},
					options,
				),
			});
		},

		/**
		 * @summary Get all named user API keys of the current user
		 * @name getAllNamedUserApiKeys
		 * @public
		 * @function
		 * @memberof balena.models.apiKey
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - apiKeys
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.apiKey.getAllNamedUserApiKeys().then(function(apiKeys) {
		 * 	console.log(apiKeys);
		 * });
		 *
		 * @example
		 * balena.models.apiKey.getAllNamedUserApiKeys(function(error, apiKeys) {
		 * 	if (error) throw error;
		 * 	console.log(apiKeys);
		 * });
		 */
		async getAllNamedUserApiKeys(
			options: BalenaSdk.PineOptions<BalenaSdk.ApiKey> = {},
		): Promise<BalenaSdk.ApiKey[]> {
			return await exports.getAll(
				mergePineOptions(
					{
						$filter: {
							is_of__actor: await sdkInstance.auth.getUserActorId(),
							// the only way to reason whether it's
							// a named user api key vs a deprecated user api key
							// is whether it has a name.
							name: {
								$ne: null,
							},
						},
					},
					options,
				),
			);
		},

		/**
		 * @summary Get all provisioning API keys for an application
		 * @name getProvisioningApiKeysByApplication
		 * @public
		 * @function
		 * @memberof balena.models.apiKey
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - apiKeys
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.apiKey.getProvisioningApiKeysByApplication('myorganization/myapp').then(function(apiKeys) {
		 * 	console.log(apiKeys);
		 * });
		 *
		 * @example
		 * balena.models.apiKey.getProvisioningApiKeysByApplication(123, function(error, apiKeys) {
		 * 	if (error) throw error;
		 * 	console.log(apiKeys);
		 * });
		 */
		async getProvisioningApiKeysByApplication(
			slugOrId: string | number,
			options: BalenaSdk.PineOptions<BalenaSdk.ApiKey> = {},
		): Promise<BalenaSdk.ApiKey[]> {
			const { actor } = await applicationModel().get(slugOrId, {
				$select: 'actor',
			});

			return await exports.getAll(
				mergePineOptions(
					{
						$filter: {
							is_of__actor: actor,
						},
						$orderby: 'name asc',
					},
					options,
				),
			);
		},

		/**
		 * @summary Update the details of an API key
		 * @name update
		 * @public
		 * @function
		 * @memberof balena.models.apiKey
		 *
		 * @param {Number} id - API key id
		 * @param {Object} apiKeyInfo - an object with the updated name or description
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.apiKey.update(123, { name: 'updatedName' });
		 *
		 * @example
		 * balena.models.apiKey.update(123, { description: 'updated description' });
		 *
		 * @example
		 * balena.models.apiKey.update(123, { name: 'updatedName', description: 'updated description' });
		 *
		 * @example
		 * balena.models.apiKey.update(123, { name: 'updatedName', description: 'updated description' }, function(error, apiKeys) {
		 * 	if (error) throw error;
		 * 	console.log(apiKeys);
		 * });
		 */
		async update(
			id: number,
			apiKeyInfo: { name?: string; description?: string | null },
		): Promise<void> {
			if (!apiKeyInfo) {
				throw new errors.BalenaInvalidParameterError('apiKeyInfo', apiKeyInfo);
			}
			if (apiKeyInfo.name === null || apiKeyInfo.name === '') {
				throw new errors.BalenaInvalidParameterError(
					'apiKeyInfo.name',
					apiKeyInfo.name,
				);
			}
			const body = {
				name: apiKeyInfo.name,
				description: apiKeyInfo.description,
			};
			await pine.patch<BalenaSdk.ApiKey>({
				resource: 'api_key',
				id,
				body,
			});
		},

		/**
		 * @summary Revoke an API key
		 * @name revoke
		 * @public
		 * @function
		 * @memberof balena.models.apiKey
		 *
		 * @param {Number} id - API key id
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.apiKey.revoke(123);
		 *
		 * @example
		 * balena.models.apiKey.revoke(123, function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		async revoke(id: number): Promise<void> {
			await pine.delete({
				resource: 'api_key',
				id,
			});
		},
	};

	return exports;
};

export default getApiKeysModel;
