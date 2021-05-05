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

import type { SubmitBody } from '../../typings/pinejs-client-core';
import type {
	InjectedDependenciesParam,
	InjectedOptionsParam,
	PineOptions,
	PineTypedResult,
	Application,
	ApplicationTag,
	ApplicationVariable,
	BuildVariable,
	Device,
} from '..';
import type {
	CurrentServiceWithCommit,
	DeviceWithServiceDetails,
} from '../util/device-service-details';

import * as url from 'url';

import once = require('lodash/once');
import * as errors from 'balena-errors';

import {
	isId,
	isNoApplicationForKeyResponse,
	isNotFoundResponse,
	mergePineOptions,
	treatAsMissingApplication,
	withSupervisorLockedError,
} from '../util';

import { normalizeDeviceOsVersion } from '../util/device-os-version';
import {
	getCurrentServiceDetailsPineExpand,
	generateCurrentServiceDetails,
} from '../util/device-service-details';

const getApplicationModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { request, pine } = deps;
	const { apiUrl } = opts;

	const deviceModel = once(() =>
		(require('./device') as typeof import('./device')).default(deps, opts),
	);
	const releaseModel = once(() =>
		(require('./release') as typeof import('./release')).default(deps, opts),
	);

	const membershipModel = (
		require('./application-membership') as typeof import('./application-membership')
	).default(deps, (...args: Parameters<typeof exports.get>) =>
		exports.get(...args),
	);

	const inviteModel = (
		require('./application-invite') as typeof import('./application-invite')
	).default(deps, opts, (...args: Parameters<typeof exports.get>) =>
		exports.get(...args),
	);

	const { addCallbackSupportToModule } =
		require('../util/callbacks') as typeof import('../util/callbacks');

	const { buildDependentResource } =
		require('../util/dependent-resource') as typeof import('../util/dependent-resource');

	const tagsModel = buildDependentResource<ApplicationTag>(
		{ pine },
		{
			resourceName: 'application_tag',
			resourceKeyField: 'tag_key',
			parentResourceName: 'application',
			async getResourceId(slugOrId: string | number): Promise<number> {
				const { id } = await exports.get(slugOrId, { $select: 'id' });
				return id;
			},
		},
	);

	const configVarModel = buildDependentResource<ApplicationVariable>(
		{ pine },
		{
			resourceName: 'application_config_variable',
			resourceKeyField: 'name',
			parentResourceName: 'application',
			async getResourceId(slugOrId: string | number): Promise<number> {
				const { id } = await exports.get(slugOrId, { $select: 'id' });
				return id;
			},
		},
	);
	const envVarModel = buildDependentResource<ApplicationVariable>(
		{ pine },
		{
			resourceName: 'application_environment_variable',
			resourceKeyField: 'name',
			parentResourceName: 'application',
			async getResourceId(slugOrId: string | number): Promise<number> {
				const { id } = await exports.get(slugOrId, { $select: 'id' });
				return id;
			},
		},
	);
	const buildVarModel = buildDependentResource<BuildVariable>(
		{ pine },
		{
			resourceName: 'build_environment_variable',
			resourceKeyField: 'name',
			parentResourceName: 'application',
			async getResourceId(slugOrId: string | number): Promise<number> {
				const { id } = await exports.get(slugOrId, { $select: 'id' });
				return id;
			},
		},
	);

	// Infer dashboardUrl from apiUrl if former is undefined
	const dashboardUrl = opts.dashboardUrl ?? apiUrl!.replace(/api/, 'dashboard');

	// Internal method for name/id disambiguation
	// Note that this throws an exception for missing names, but not missing ids
	const getId = async (slugOrId: string | number) => {
		if (isId(slugOrId)) {
			return slugOrId;
		} else {
			const { id } = await exports.get(slugOrId, { $select: 'id' });
			return id;
		}
	};

	const normalizeApplication = function (application: Application) {
		if (Array.isArray(application.owns__device)) {
			application.owns__device.forEach((device) =>
				normalizeDeviceOsVersion(device),
			);
		}
		return application;
	};

	const exports = {
		_getId: getId,

		/**
		 * @summary Get Dashboard URL for a specific application
		 * @function getDashboardUrl
		 * @memberof balena.models.application
		 *
		 * @param {Number} id - Application id
		 *
		 * @returns {String} - Dashboard URL for the specific application
		 * @throws Exception if the id is not a finite number
		 *
		 * @example
		 * balena.models.application.get('myorganization/myapp').then(function(application) {
		 * 	const dashboardApplicationUrl = balena.models.application.getDashboardUrl(application.id);
		 * 	console.log(dashboardApplicationUrl);
		 * });
		 */
		getDashboardUrl(id: number): string {
			if (typeof id !== 'number' || !Number.isFinite(id)) {
				throw new Error('The id option should be a finite number');
			}

			return url.resolve(dashboardUrl, `/apps/${id}`);
		},

		/**
		 * @summary Get all applications
		 * @name getAll
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @param {String} [context] - extra access filters, undefined or 'directly_accessible'
		 * @fulfil {Object[]} - applications
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getAll().then(function(applications) {
		 * 	console.log(applications);
		 * });
		 *
		 * @example
		 * balena.models.application.getAll(function(error, applications) {
		 * 	if (error) throw error;
		 * 	console.log(applications);
		 * });
		 */
		async getAll(
			options?: PineOptions<Application>,
			context?: 'directly_accessible',
		): Promise<Application[]> {
			const apps = await pine.get({
				resource: 'application',
				options: mergePineOptions(
					{
						...(context === 'directly_accessible' && {
							$filter: {
								is_directly_accessible_by__user: {
									$any: {
										$alias: 'dau',
										$expr: {
											1: 1,
										},
									},
								},
							},
						}),
						$orderby: 'app_name asc',
					},
					options ?? {},
				),
			});
			return apps.map(normalizeApplication);
		},

		/**
		 * @summary Get a single application
		 * @name get
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object} - application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.get('myorganization/myapp').then(function(application) {
		 * 	console.log(application);
		 * });
		 *
		 * @example
		 * balena.models.application.get(123).then(function(application) {
		 * 	console.log(application);
		 * });
		 *
		 * @example
		 * balena.models.application.get('myorganization/myapp', function(error, application) {
		 * 	if (error) throw error;
		 * 	console.log(application);
		 * });
		 */
		async get(
			slugOrId: string | number,
			options?: PineOptions<Application>,
		): Promise<Application> {
			if (options == null) {
				options = {};
			}

			if (slugOrId == null) {
				throw new errors.BalenaApplicationNotFound(slugOrId);
			}

			let application;
			if (isId(slugOrId)) {
				application = await pine.get({
					resource: 'application',
					id: slugOrId,
					options: mergePineOptions({}, options),
				});
				if (application == null) {
					throw new errors.BalenaApplicationNotFound(slugOrId);
				}
			} else {
				const applications = await pine.get({
					resource: 'application',
					options: mergePineOptions(
						{
							$filter: {
								slug: slugOrId.toLowerCase(),
							},
						},
						options,
					),
				});
				if (applications.length === 0) {
					throw new errors.BalenaApplicationNotFound(slugOrId);
				}

				if (applications.length > 1) {
					throw new errors.BalenaAmbiguousApplication(slugOrId);
				}
				application = applications[0];
			}
			return normalizeApplication(application);
		},

		/**
		 * @summary Get a single application and its devices, along with each device's
		 * associated services' essential details
		 * @name getWithDeviceServiceDetails
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @description
		 * This method does not map exactly to the underlying model: it runs a
		 * larger prebuilt query, and reformats it into an easy to use and
		 * understand format. If you want more control, or to see the raw model
		 * directly, use `application.get(uuidOrId, options)` instead.
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object} - application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getWithDeviceServiceDetails('myorganization/myapp').then(function(device) {
		 * 	console.log(device);
		 * })
		 *
		 * @example
		 * balena.models.application.getWithDeviceServiceDetails(123).then(function(device) {
		 * 	console.log(device);
		 * })
		 *
		 * @example
		 * balena.models.application.getWithDeviceServiceDetails('myorganization/myapp', function(error, device) {
		 * 	if (error) throw error;
		 * 	console.log(device);
		 * });
		 */
		async getWithDeviceServiceDetails(
			slugOrId: string | number,
			options?: PineOptions<Application>,
		): Promise<
			Application & {
				owns__device: Array<DeviceWithServiceDetails<CurrentServiceWithCommit>>;
			}
		> {
			if (options == null) {
				options = {};
			}

			const serviceOptions = mergePineOptions(
				{
					$expand: [
						{
							owns__device: {
								$expand: getCurrentServiceDetailsPineExpand(true),
							},
						},
					],
				},
				options,
			);

			const app = (await exports.get(
				slugOrId,
				serviceOptions,
			)) as Application & {
				owns__device: Array<DeviceWithServiceDetails<CurrentServiceWithCommit>>;
			};
			if (app && app.owns__device) {
				app.owns__device = app.owns__device.map((d) =>
					generateCurrentServiceDetails<CurrentServiceWithCommit>(d),
				);
			}
			return app;
		},

		/**
		 * @summary Get a single application using the appname and the handle of the owning organization
		 * @name getAppByName
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String} appName - application name
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object} - application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getAppByName('MyApp').then(function(application) {
		 * 	console.log(application);
		 * });
		 */
		async getAppByName(
			appName: string,
			options?: PineOptions<Application>,
		): Promise<Application> {
			if (options == null) {
				options = {};
			}

			const applications = await pine.get({
				resource: 'application',
				options: mergePineOptions(
					{
						$filter: {
							app_name: appName,
						},
					},
					options,
				),
			});
			if (applications.length === 0) {
				throw new errors.BalenaApplicationNotFound(appName);
			}

			if (applications.length > 1) {
				throw new errors.BalenaAmbiguousApplication(appName);
			}
			const [application] = applications;
			return normalizeApplication(application);
		},

		/**
		 * @summary Get a single application using the appname and the handle of the owning organization
		 * @name getAppByOwner
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String} appName - application name
		 * @param {String} owner - The handle of the owning organization
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object} - application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getAppByOwner('myorganization/myapp', 'MyOrg').then(function(application) {
		 * 	console.log(application);
		 * });
		 */
		async getAppByOwner(
			appName: string,
			owner: string,
			options?: PineOptions<Application>,
		): Promise<Application> {
			if (options == null) {
				options = {};
			}

			appName = appName.toLowerCase();
			owner = owner.toLowerCase();

			const application = await pine.get({
				resource: 'application',
				id: {
					slug: `${owner}/${appName}`,
				},
				options,
			});
			if (application == null) {
				throw new errors.BalenaApplicationNotFound(`${owner}/${appName}`);
			}
			return normalizeApplication(application);
		},

		/**
		 * @summary Check if an application exists
		 * @name has
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @fulfil {Boolean} - has application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.has('myorganization/myapp').then(function(hasApp) {
		 * 	console.log(hasApp);
		 * });
		 *
		 * @example
		 * balena.models.application.has(123).then(function(hasApp) {
		 * 	console.log(hasApp);
		 * });
		 *
		 * @example
		 * balena.models.application.has('myorganization/myapp', function(error, hasApp) {
		 * 	if (error) throw error;
		 * 	console.log(hasApp);
		 * });
		 */
		has: async (slugOrId: string | number): Promise<boolean> => {
			try {
				await exports.get(slugOrId, { $select: ['id'] });
				return true;
			} catch (err) {
				if (err instanceof errors.BalenaApplicationNotFound) {
					return false;
				}
				throw err;
			}
		},

		/**
		 * @summary Check if the user has access to any applications
		 * @name hasAny
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @fulfil {Boolean} - has any applications
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.hasAny().then(function(hasAny) {
		 * 	console.log('Has any?', hasAny);
		 * });
		 *
		 * @example
		 * balena.models.application.hasAny(function(error, hasAny) {
		 * 	if (error) throw error;
		 * 	console.log('Has any?', hasAny);
		 * });
		 */
		hasAny: async (): Promise<boolean> => {
			const applications = await exports.getAll(
				{ $select: ['id'] },
				'directly_accessible',
			);
			return applications.length !== 0;
		},

		/**
		 * @summary Create an application
		 * @name create
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {Object} options - application creation parameters
		 * @param {String} options.name - application name
		 * @param {String} [options.applicationType] - application type slug e.g. microservices-starter
		 * @param {String} options.deviceType - device type slug
		 * @param {(Number|String)} [options.parent] - parent application name or id
		 * @param {(String|Number)} options.organization - handle (string) or id (number) of the organization that the application will belong to or null
		 *
		 * @fulfil {Object} - application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.create({ name: 'My App', applicationType: 'essentials', deviceType: 'raspberry-pi' }).then(function(application) {
		 * 	console.log(application);
		 * });
		 *
		 * @example
		 * balena.models.application.create({ name: 'My App', applicationType: 'microservices', deviceType: 'raspberry-pi', parent: 'ParentApp' }).then(function(application) {
		 * 	console.log(application);
		 * });
		 *
		 * @example
		 * balena.models.application.create({ name: 'My App', applicationType: 'microservices-starter', deviceType: 'raspberry-pi' }, function(error, application) {
		 * 	if (error) throw error;
		 * 	console.log(application);
		 * });
		 */
		async create({
			name,
			applicationType,
			deviceType,
			parent,
			organization,
		}: {
			name: string;
			applicationType?: string;
			deviceType: string;
			parent?: number | string;
			organization: number | string;
		}): Promise<Application> {
			if (organization == null) {
				throw new errors.BalenaInvalidParameterError(
					'organization',
					organization,
				);
			}

			const applicationTypePromise = !applicationType
				? undefined
				: pine
						.get({
							resource: 'application_type',
							id: {
								slug: applicationType,
							},
							options: {
								$select: 'id',
							},
						})
						.then(function (appType) {
							if (!appType) {
								throw new Error(`Invalid application type: ${applicationType}`);
							}
							return appType.id;
						});

			const parentAppPromise = parent
				? exports.get(parent, { $select: ['id'] })
				: undefined;

			const deviceTypeIdPromise = deviceModel()
				.getManifestBySlug(deviceType)
				.then(async function (deviceManifest) {
					if (deviceManifest == null) {
						throw new errors.BalenaInvalidDeviceType(deviceType);
					}

					if (deviceManifest.state === 'DISCONTINUED') {
						throw new errors.BalenaDiscontinuedDeviceType(deviceType);
					}

					const dt = await pine.get({
						resource: 'device_type',
						id: {
							// this way we get the un-aliased device type slug
							slug: deviceManifest.slug,
						},
						options: {
							$select: ['id'],
						},
					});
					if (dt == null) {
						throw new errors.BalenaInvalidDeviceType(deviceType);
					}
					return dt.id;
				});

			const organizationPromise = pine
				.get({
					resource: 'organization',
					id: {
						[isId(organization) ? 'id' : 'handle']: organization,
					},
					options: {
						$select: ['id'],
					},
				})
				.then(function (org) {
					if (!org) {
						throw new errors.BalenaOrganizationNotFound(organization);
					}
					return org.id;
				});

			const [
				deviceTypeId,
				applicationTypeId,
				parentApplication,
				organizationId,
			] = await Promise.all([
				deviceTypeIdPromise,
				applicationTypePromise,
				parentAppPromise,
				organizationPromise,
			]);
			const body: SubmitBody<Application> = {
				app_name: name,
				is_for__device_type: deviceTypeId,
			};

			if (parentApplication) {
				body.depends_on__application = parentApplication.id;
			}

			if (applicationTypeId) {
				body.application_type = applicationTypeId;
			}

			if (organizationId) {
				body.organization = organizationId;
			}

			return await pine.post({
				resource: 'application',
				body,
			});
		},

		/**
		 * @summary Remove application
		 * @name remove
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.remove('myorganization/myapp');
		 *
		 * @example
		 * balena.models.application.remove(123);
		 *
		 * @example
		 * balena.models.application.remove('myorganization/myapp', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		remove: async (slugOrId: string | number): Promise<void> => {
			try {
				const applicationId = await getId(slugOrId);
				await pine.delete({
					resource: 'application',
					id: applicationId,
				});
			} catch (err) {
				if (isNotFoundResponse(err)) {
					treatAsMissingApplication(slugOrId, err);
				}
				throw err;
			}
		},

		/**
		 * @summary Rename application
		 * @name rename
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @param {String} newName - new application name (string)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.rename('myorganization/myapp', 'MyRenamedApp');
		 *
		 * @example
		 * balena.models.application.rename(123, 'MyRenamedApp');
		 *
		 * @example
		 * balena.models.application.rename('myorganization/myapp', 'MyRenamedApp', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		rename: async (
			slugOrId: string | number,
			newAppName: string,
		): Promise<void> => {
			try {
				const applicationId = await getId(slugOrId);
				await pine.patch({
					resource: 'application',
					id: applicationId,
					body: {
						app_name: newAppName,
					},
				});
			} catch (err) {
				if (isNotFoundResponse(err)) {
					treatAsMissingApplication(slugOrId, err);
				}
				throw err;
			}
		},

		/**
		 * @summary Restart application
		 * @name restart
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.restart('myorganization/myapp');
		 *
		 * @example
		 * balena.models.application.restart(123);
		 *
		 * @example
		 * balena.models.application.restart('myorganization/myapp', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		restart: (slugOrId: string | number): Promise<void> =>
			withSupervisorLockedError(async () => {
				try {
					const applicationId = await getId(slugOrId);

					await request.send({
						method: 'POST',
						url: `/application/${applicationId}/restart`,
						baseUrl: apiUrl,
					});
				} catch (err) {
					if (isNotFoundResponse(err)) {
						treatAsMissingApplication(slugOrId, err);
					}
					throw err;
				}
			}),

		/**
		 * @summary Generate an API key for a specific application
		 * @name generateApiKey
		 * @public
		 * @function
		 * @memberof balena.models.application
		 * @deprecated
		 * @description
		 * Generally you shouldn't use this method: if you're provisioning a recent BalenaOS
		 * version (2.4.0+) then generateProvisioningKey should work just as well, but
		 * be more secure.
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @fulfil {String} - api key
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.generateApiKey('myorganization/myapp').then(function(apiKey) {
		 * 	console.log(apiKey);
		 * });
		 *
		 * @example
		 * balena.models.application.generateApiKey(123).then(function(apiKey) {
		 * 	console.log(apiKey);
		 * });
		 *
		 * @example
		 * balena.models.application.generateApiKey('myorganization/myapp', function(error, apiKey) {
		 * 	if (error) throw error;
		 * 	console.log(apiKey);
		 * });
		 */
		generateApiKey: async (slugOrId: string | number): Promise<string> => {
			// Do a full get, not just getId, because the actual api endpoint doesn't fail if the id
			// doesn't exist. TODO: Can use getId once https://github.com/balena-io/balena-api/issues/110 is resolved
			const { id } = await exports.get(slugOrId, { $select: 'id' });
			const { body } = await request.send({
				method: 'POST',
				url: `/application/${id}/generate-api-key`,
				baseUrl: apiUrl,
			});
			return body;
		},

		/**
		 * @summary Generate a device provisioning key for a specific application
		 * @name generateProvisioningKey
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @fulfil {String} - device provisioning key
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.generateProvisioningKey('myorganization/myapp').then(function(key) {
		 * 	console.log(key);
		 * });
		 *
		 * @example
		 * balena.models.application.generateProvisioningKey(123).then(function(key) {
		 * 	console.log(key);
		 * });
		 *
		 * @example
		 * balena.models.application.generateProvisioningKey('myorganization/myapp', function(error, key) {
		 * 	if (error) throw error;
		 * 	console.log(key);
		 * });
		 */
		generateProvisioningKey: async (
			slugOrId: string | number,
		): Promise<string> => {
			try {
				const applicationId = await getId(slugOrId);
				const { body } = await request.send({
					method: 'POST',
					url: `/api-key/application/${applicationId}/provisioning`,
					baseUrl: apiUrl,
				});
				return body;
			} catch (err) {
				if (isNoApplicationForKeyResponse(err)) {
					treatAsMissingApplication(slugOrId, err);
				}
				throw err;
			}
		},

		/**
		 * @summary Purge devices by application id
		 * @name purge
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {Number} appId - application id
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.purge(123);
		 *
		 * @example
		 * balena.models.application.purge(123, function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		purge: (appId: number): Promise<void> =>
			withSupervisorLockedError(async () => {
				await request.send({
					method: 'POST',
					url: '/supervisor/v1/purge',
					baseUrl: apiUrl,
					body: {
						appId,
						data: {
							appId: `${appId}`,
						},
					},
				});
			}),

		/**
		 * @summary Shutdown devices by application id
		 * @name shutdown
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {Number} appId - application id
		 * @param {Object} [options] - options
		 * @param {Boolean} [options.force=false] - override update lock
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.shutdown(123);
		 *
		 * @example
		 * balena.models.application.shutdown(123, function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		shutdown: (appId: number, options?: { force?: boolean }): Promise<void> =>
			withSupervisorLockedError(async () => {
				if (options == null) {
					options = {};
				}

				await request.send({
					method: 'POST',
					url: '/supervisor/v1/shutdown',
					baseUrl: apiUrl,
					body: {
						appId,
						data: {
							force: Boolean(options.force),
						},
					},
				});
			}),

		/**
		 * @summary Reboot devices by application id
		 * @name reboot
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {Number} appId - application id
		 * @param {Object} [options] - options
		 * @param {Boolean} [options.force=false] - override update lock
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.reboot(123);
		 *
		 * @example
		 * balena.models.application.reboot(123, function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		reboot: (appId: number, options?: { force?: boolean }): Promise<void> =>
			withSupervisorLockedError(async () => {
				if (options == null) {
					options = {};
				}

				await request.send({
					method: 'POST',
					url: '/supervisor/v1/reboot',
					baseUrl: apiUrl,
					body: {
						appId,
						data: {
							force: Boolean(options.force),
						},
					},
				});
			}),

		/**
		 * @summary Get whether the application is configured to receive updates whenever a new release is available
		 * @name willTrackNewReleases
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @fulfil {Boolean} - is tracking the latest release
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.willTrackNewReleases('myorganization/myapp').then(function(isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 *
		 * @example
		 * balena.models.application.willTrackNewReleases(123).then(function(isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 *
		 * @example
		 * balena.models.application.willTrackNewReleases('myorganization/myapp', function(error, isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 */
		willTrackNewReleases: async (
			slugOrId: string | number,
		): Promise<boolean> => {
			const { should_track_latest_release } = await exports.get(slugOrId, {
				$select: 'should_track_latest_release',
			});
			return should_track_latest_release;
		},

		/**
		 * @summary Get whether the application is up to date and is tracking the latest release for updates
		 * @name isTrackingLatestRelease
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @fulfil {Boolean} - is tracking the latest release
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.isTrackingLatestRelease('myorganization/myapp').then(function(isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 *
		 * @example
		 * balena.models.application.isTrackingLatestRelease(123).then(function(isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 *
		 * @example
		 * balena.models.application.isTrackingLatestRelease('myorganization/myapp', function(error, isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 */
		isTrackingLatestRelease: async (
			slugOrId: string | number,
		): Promise<boolean> => {
			const appOptions = {
				$select: 'should_track_latest_release',
				$expand: {
					should_be_running__release: { $select: 'id' },
					owns__release: {
						$select: 'id',
						$top: 1,
						$filter: {
							status: 'success',
						},
						$orderby: 'created_at desc',
					},
				},
			} as const;

			const application = (await exports.get(
				slugOrId,
				appOptions,
			)) as PineTypedResult<Application, typeof appOptions>;
			const trackedRelease = application.should_be_running__release[0];
			const latestRelease = application.owns__release[0];
			return (
				application.should_track_latest_release &&
				(!latestRelease || trackedRelease?.id === latestRelease.id)
			);
		},

		/**
		 * @summary Set a specific application to run a particular release
		 * @name pinToRelease
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @description Configures the application to run a particular release
		 * and not get updated when the latest release changes.
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @param {String} fullReleaseHash - the hash of a successful release (string)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.pinToRelease('myorganization/myapp', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.application.pinToRelease(123, 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.application.pinToRelease('myorganization/myapp', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847', function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		pinToRelease: async (
			slugOrId: string | number,
			fullReleaseHash: string,
		): Promise<void> => {
			const applicationId = await getId(slugOrId);
			const release = await releaseModel().get(fullReleaseHash, {
				$select: 'id',
				$top: 1,
				$filter: {
					belongs_to__application: applicationId,
					status: 'success',
				},
			});
			await pine.patch({
				resource: 'application',
				id: applicationId,
				body: {
					should_be_running__release: release.id,
					should_track_latest_release: false,
				},
			});
		},

		/**
		 * @summary Get the hash of the current release for a specific application
		 * @name getTargetReleaseHash
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @fulfil {String|undefined} - The release hash of the current release
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getTargetReleaseHash('myorganization/myapp').then(function(release) {
		 * 	console.log(release);
		 * });
		 *
		 * @example
		 * balena.models.application.getTargetReleaseHash(123).then(function(release) {
		 * 	console.log(release);
		 * });
		 *
		 * @example
		 * balena.models.application.getTargetReleaseHash('myorganization/myapp', function(release) {
		 * 	console.log(release);
		 * });
		 */
		getTargetReleaseHash: async (
			slugOrId: string | number,
		): Promise<string | undefined> => {
			const appOptions = {
				$select: 'id',
				$expand: { should_be_running__release: { $select: 'commit' } },
			} as const;

			const application = (await exports.get(
				slugOrId,
				appOptions,
			)) as PineTypedResult<Application, typeof appOptions>;
			return application.should_be_running__release[0]?.commit;
		},

		/**
		 * @summary Configure a specific application to track the latest available release
		 * @name trackLatestRelease
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @description The application's current release will be updated with each new successfully built release.
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.trackLatestRelease('myorganization/myapp').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.application.trackLatestRelease(123).then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.application.trackLatestRelease('myorganization/myapp', function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		trackLatestRelease: async (slugOrId: string | number): Promise<void> => {
			const appOptions = {
				$select: 'id',
				$expand: {
					owns__release: {
						$select: 'id',
						$top: 1,
						$filter: {
							status: 'success',
						},
						$orderby: 'created_at desc',
					},
				},
			} as const;

			const application = (await exports.get(
				slugOrId,
				appOptions,
			)) as PineTypedResult<Application, typeof appOptions>;
			const body: SubmitBody<Application> = {
				should_track_latest_release: true,
			};
			const latestRelease = application.owns__release[0];
			if (latestRelease) {
				body.should_be_running__release = latestRelease.id;
			}
			await pine.patch({
				resource: 'application',
				id: application.id,
				body,
			});
		},

		/**
		 * @summary Enable device urls for all devices that belong to an application
		 * @name enableDeviceUrls
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.enableDeviceUrls('myorganization/myapp');
		 *
		 * @example
		 * balena.models.application.enableDeviceUrls(123);
		 *
		 * @example
		 * balena.models.device.enableDeviceUrls('myorganization/myapp', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		enableDeviceUrls: async (slugOrId: string | number): Promise<void> => {
			const { id } = await exports.get(slugOrId, { $select: 'id' });
			await pine.patch<Device>({
				resource: 'device',
				body: {
					is_web_accessible: true,
				},
				options: {
					$filter: {
						belongs_to__application: id,
					},
				},
			});
		},

		/**
		 * @summary Disable device urls for all devices that belong to an application
		 * @name disableDeviceUrls
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.disableDeviceUrls('myorganization/myapp');
		 *
		 * @example
		 * balena.models.application.disableDeviceUrls(123);
		 *
		 * @example
		 * balena.models.device.disableDeviceUrls('myorganization/myapp', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		disableDeviceUrls: async (slugOrId: string | number): Promise<void> => {
			const { id } = await exports.get(slugOrId, { $select: 'id' });
			await pine.patch<Device>({
				resource: 'device',
				body: {
					is_web_accessible: false,
				},
				options: {
					$filter: {
						belongs_to__application: id,
					},
				},
			});
		},

		/**
		 * @summary Grant support access to an application until a specified time
		 * @name grantSupportAccess
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @param {Number} expiryTimestamp - a timestamp in ms for when the support access will expire
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.grantSupportAccess('myorganization/myapp', Date.now() + 3600 * 1000);
		 *
		 * @example
		 * balena.models.application.grantSupportAccess(123, Date.now() + 3600 * 1000);
		 *
		 * @example
		 * balena.models.application.grantSupportAccess('myorganization/myapp', Date.now() + 3600 * 1000, function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		async grantSupportAccess(
			slugOrId: string | number,
			expiryTimestamp: number,
		): Promise<void> {
			if (expiryTimestamp == null || expiryTimestamp <= Date.now()) {
				throw new errors.BalenaInvalidParameterError(
					'expiryTimestamp',
					expiryTimestamp,
				);
			}

			try {
				const applicationId = await getId(slugOrId);
				await pine.patch({
					resource: 'application',
					id: applicationId,
					body: { is_accessible_by_support_until__date: expiryTimestamp },
				});
			} catch (err) {
				if (isNotFoundResponse(err)) {
					treatAsMissingApplication(slugOrId, err);
				}
				throw err;
			}
		},

		/**
		 * @summary Revoke support access to an application
		 * @name revokeSupportAccess
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.revokeSupportAccess('myorganization/myapp');
		 *
		 * @example
		 * balena.models.application.revokeSupportAccess(123);
		 *
		 * @example
		 * balena.models.application.revokeSupportAccess('myorganization/myapp', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		revokeSupportAccess: async (slugOrId: string | number): Promise<void> => {
			try {
				const applicationId = await getId(slugOrId);
				await pine.patch({
					resource: 'application',
					id: applicationId,
					body: { is_accessible_by_support_until__date: null },
				});
			} catch (err) {
				if (isNotFoundResponse(err)) {
					treatAsMissingApplication(slugOrId, err);
				}
				throw err;
			}
		},

		/**
		 * @namespace balena.models.application.tags
		 * @memberof balena.models.application
		 */
		tags: addCallbackSupportToModule({
			/**
			 * @summary Get all application tags for an application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.application.tags
			 *
			 * @param {String|Number} slugOrId - application slug (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - application tags
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.tags.getAllByApplication('myorganization/myapp').then(function(tags) {
			 * 	console.log(tags);
			 * });
			 *
			 * @example
			 * balena.models.application.tags.getAllByApplication(999999).then(function(tags) {
			 * 	console.log(tags);
			 * });
			 *
			 * @example
			 * balena.models.application.tags.getAllByApplication('myorganization/myapp', function(error, tags) {
			 * 	if (error) throw error;
			 * 	console.log(tags)
			 * });
			 */
			getAllByApplication: tagsModel.getAllByParent,

			/**
			 * @summary Get all application tags
			 * @name getAll
			 * @public
			 * @function
			 * @memberof balena.models.application.tags
			 *
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - application tags
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.tags.getAll().then(function(tags) {
			 * 	console.log(tags);
			 * });
			 *
			 * @example
			 * balena.models.application.tags.getAll(function(error, tags) {
			 * 	if (error) throw error;
			 * 	console.log(tags)
			 * });
			 */
			getAll: tagsModel.getAll,

			/**
			 * @summary Set an application tag
			 * @name set
			 * @public
			 * @function
			 * @memberof balena.models.application.tags
			 *
			 * @param {String|Number} slugOrId - application slug (string) or id (number)
			 * @param {String} tagKey - tag key
			 * @param {String|undefined} value - tag value
			 *
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.tags.set('myorganization/myapp', 'EDITOR', 'vim');
			 *
			 * @example
			 * balena.models.application.tags.set(123, 'EDITOR', 'vim');
			 *
			 * @example
			 * balena.models.application.tags.set('myorganization/myapp', 'EDITOR', 'vim', function(error) {
			 * 	if (error) throw error;
			 * });
			 */
			set: tagsModel.set,

			/**
			 * @summary Remove an application tag
			 * @name remove
			 * @public
			 * @function
			 * @memberof balena.models.application.tags
			 *
			 * @param {String|Number} slugOrId - application slug (string) or id (number)
			 * @param {String} tagKey - tag key
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.tags.remove('myorganization/myapp', 'EDITOR');
			 *
			 * @example
			 * balena.models.application.tags.remove('myorganization/myapp', 'EDITOR', function(error) {
			 * 	if (error) throw error;
			 * });
			 */
			remove: tagsModel.remove,
		}),

		/**
		 * @namespace balena.models.application.configVar
		 * @memberof balena.models.application
		 */
		configVar: addCallbackSupportToModule({
			/**
			 * @summary Get all config variables for an application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.application.configVar
			 *
			 * @param {String|Number} slugOrId - application slug (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - application config variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.configVar.getAllByApplication('myorganization/myapp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.getAllByApplication('myorganization/myapp', function(error, vars) {
			 * 	if (error) throw error;
			 * 	console.log(vars)
			 * });
			 */
			getAllByApplication: configVarModel.getAllByParent,

			/**
			 * @summary Get the value of a specific config variable
			 * @name get
			 * @public
			 * @function
			 * @memberof balena.models.application.configVar
			 *
			 * @param {String|Number} slugOrId - application slug (string) or id (number)
			 * @param {String} key - config variable name
			 * @fulfil {String|undefined} - the config variable value (or undefined)
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.configVar.get('myorganization/myapp', 'BALENA_VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.get(999999, 'BALENA_VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.get('myorganization/myapp', 'BALENA_VAR', function(error, value) {
			 * 	if (error) throw error;
			 * 	console.log(value)
			 * });
			 */
			get: configVarModel.get,

			/**
			 * @summary Set the value of a specific config variable
			 * @name set
			 * @public
			 * @function
			 * @memberof balena.models.application.configVar
			 *
			 * @param {String|Number} slugOrId - application slug (string) or id (number)
			 * @param {String} key - config variable name
			 * @param {String} value - config variable value
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.configVar.set('myorganization/myapp', 'BALENA_VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.set(999999, 'BALENA_VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.set('myorganization/myapp', 'BALENA_VAR', 'newvalue', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			set: configVarModel.set,

			/**
			 * @summary Clear the value of a specific config variable
			 * @name remove
			 * @public
			 * @function
			 * @memberof balena.models.application.configVar
			 *
			 * @param {String|Number} slugOrId - application slug (string) or id (number)
			 * @param {String} key - config variable name
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.configVar.remove('myorganization/myapp', 'BALENA_VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.remove(999999, 'BALENA_VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.remove('myorganization/myapp', 'BALENA_VAR', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			remove: configVarModel.remove,
		}),

		/**
		 * @namespace balena.models.application.envVar
		 * @memberof balena.models.application
		 */
		envVar: addCallbackSupportToModule({
			/**
			 * @summary Get all environment variables for an application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.application.envVar
			 *
			 * @param {String|Number} slugOrId - application slug (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - application environment variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.envVar.getAllByApplication('myorganization/myapp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.getAllByApplication('myorganization/myapp', function(error, vars) {
			 * 	if (error) throw error;
			 * 	console.log(vars)
			 * });
			 */
			getAllByApplication: envVarModel.getAllByParent,

			/**
			 * @summary Get the value of a specific environment variable
			 * @name get
			 * @public
			 * @function
			 * @memberof balena.models.application.envVar
			 *
			 * @param {String|Number} slugOrId - application slug (string) or id (number)
			 * @param {String} key - environment variable name
			 * @fulfil {String|undefined} - the environment variable value (or undefined)
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.envVar.get('myorganization/myapp', 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.get(999999, 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.get('myorganization/myapp', 'VAR', function(error, value) {
			 * 	if (error) throw error;
			 * 	console.log(value)
			 * });
			 */
			get: envVarModel.get,

			/**
			 * @summary Set the value of a specific environment variable
			 * @name set
			 * @public
			 * @function
			 * @memberof balena.models.application.envVar
			 *
			 * @param {String|Number} slugOrId - application slug (string) or id (number)
			 * @param {String} key - environment variable name
			 * @param {String} value - environment variable value
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.envVar.set('myorganization/myapp', 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.set(999999, 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.set('myorganization/myapp', 'VAR', 'newvalue', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			set: envVarModel.set,

			/**
			 * @summary Clear the value of a specific environment variable
			 * @name remove
			 * @public
			 * @function
			 * @memberof balena.models.application.envVar
			 *
			 * @param {String|Number} slugOrId - application slug (string) or id (number)
			 * @param {String} key - environment variable name
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.envVar.remove('myorganization/myapp', 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.remove(999999, 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.remove('myorganization/myapp', 'VAR', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			remove: envVarModel.remove,
		}),

		/**
		 * @namespace balena.models.application.buildVar
		 * @memberof balena.models.application
		 */
		buildVar: addCallbackSupportToModule({
			/**
			 * @summary Get all build environment variables for an application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.application.buildVar
			 *
			 * @param {String|Number} slugOrId - application slug (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - application build environment variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.buildVar.getAllByApplication('myorganization/myapp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.getAllByApplication('myorganization/myapp', function(error, vars) {
			 * 	if (error) throw error;
			 * 	console.log(vars)
			 * });
			 */
			getAllByApplication: buildVarModel.getAllByParent,

			/**
			 * @summary Get the value of a specific build environment variable
			 * @name get
			 * @public
			 * @function
			 * @memberof balena.models.application.buildVar
			 *
			 * @param {String|Number} slugOrId - application slug (string) or id (number)
			 * @param {String} key - build environment variable name
			 * @fulfil {String|undefined} - the build environment variable value (or undefined)
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.buildVar.get('myorganization/myapp', 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.get(999999, 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.get('myorganization/myapp', 'VAR', function(error, value) {
			 * 	if (error) throw error;
			 * 	console.log(value)
			 * });
			 */
			get: buildVarModel.get,

			/**
			 * @summary Set the value of a specific build environment variable
			 * @name set
			 * @public
			 * @function
			 * @memberof balena.models.application.buildVar
			 *
			 * @param {String|Number} slugOrId - application slug (string) or id (number)
			 * @param {String} key - build environment variable name
			 * @param {String} value - build environment variable value
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.buildVar.set('myorganization/myapp', 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.set(999999, 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.set('myorganization/myapp', 'VAR', 'newvalue', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			set: buildVarModel.set,

			/**
			 * @summary Clear the value of a specific build environment variable
			 * @name remove
			 * @public
			 * @function
			 * @memberof balena.models.application.buildVar
			 *
			 * @param {String|Number} slugOrId - application slug (string) or id (number)
			 * @param {String} key - build environment variable name
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.buildVar.remove('myorganization/myapp', 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.remove(999999, 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.remove('myorganization/myapp', 'VAR', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			remove: buildVarModel.remove,
		}),

		/**
		 * @namespace balena.models.application.membership
		 * @memberof balena.models.application
		 */
		membership: addCallbackSupportToModule(membershipModel),

		/**
		 * @namespace balena.models.application.invite
		 * @memberof balena.models.application
		 */
		invite: addCallbackSupportToModule(inviteModel),
	};

	return exports;
};

export { getApplicationModel as default };
