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

import * as url from 'url';

import * as Promise from 'bluebird';
const once = require('lodash/once');
const without = require('lodash/without');
import * as bSemver from 'balena-semver';
import * as semver from 'semver';
import * as errors from 'balena-errors';
import * as deviceStatus from 'balena-device-status';

import {
	isId,
	isNoDeviceForKeyResponse,
	isNotFoundResponse,
	findCallback,
	getOsUpdateHelper as _getOsUpdateHelper,
	deviceTypes as deviceTypesUtil,
	mergePineOptions,
	treatAsMissingDevice,
	LOCKED_STATUS_CODE,
	timeSince,
} from '../util';

import { hupActionHelper } from '../util/device-actions/os-update/utils';
import {
	getDeviceOsSemverWithVariant,
	normalizeDeviceOsVersion,
} from '../util/device-os-version';
import {
	getCurrentServiceDetailsPineOptions,
	generateCurrentServiceDetails,
} from '../util/device-service-details';

import {
	checkLocalModeSupported,
	getLocalModeSupport,
	LOCAL_MODE_ENV_VAR,
	LOCAL_MODE_SUPPORT_PROPERTIES,
} from '../util/local-mode';

import { OverallStatus } from './device-ts';

// The min version where /apps API endpoints are implemented is 1.8.0 but we'll
// be accepting >= 1.8.0-alpha.0 instead. This is a workaround for a published 1.8.0-p1
// prerelease supervisor version, which precedes 1.8.0 but comes after 1.8.0-alpha.0
// according to semver.
const MIN_SUPERVISOR_APPS_API = '1.8.0-alpha.0';

const MIN_SUPERVISOR_MC_API = '7.0.0';

// Degraded network, slow devices, compressed docker binaries and any combination of these factors
// can cause proxied device requests to surpass the default timeout (currently 30s). This was
// noticed during tests and the endpoints that resulted in container management actions were
// affected in particular.
const CONTAINER_ACTION_ENDPOINT_TIMEOUT = 50000;

const getDeviceModel = function(deps, opts) {
	const {
		pine,
		request,
		sdkInstance: { auth },
	} = deps;
	let { apiUrl, dashboardUrl, deviceUrlsBase } = opts;

	const registerDevice = require('balena-register-device')({ request });
	const configModel = once(() => require('./config').default(deps, opts));
	const applicationModel = once(() =>
		require('./application').default(deps, opts),
	);
	const osModel = once(() => require('./os').default(deps, opts));

	const { buildDependentResource } = require('../util/dependent-resource');

	const tagsModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'device_tag',
			resourceKeyField: 'tag_key',
			parentResourceName: 'device',
			getResourceId(uuidOrId) {
				return exports.get(uuidOrId, { $select: 'id' }).get('id');
			},
		},
	);

	const configVarModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'device_config_variable',
			resourceKeyField: 'name',
			parentResourceName: 'device',
			getResourceId(uuidOrId) {
				return exports.get(uuidOrId, { $select: 'id' }).get('id');
			},
		},
	);

	const envVarModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'device_environment_variable',
			resourceKeyField: 'name',
			parentResourceName: 'device',
			getResourceId(uuidOrId) {
				return exports.get(uuidOrId, { $select: 'id' }).get('id');
			},
		},
	);

	var exports = {
		OverallStatus,
	};

	// Infer dashboardUrl from apiUrl if former is undefined
	if (dashboardUrl == null) {
		dashboardUrl = apiUrl.replace(/api/, 'dashboard');
	}

	const getDeviceUrlsBase = once(
		Promise.method(function() {
			if (deviceUrlsBase != null) {
				return deviceUrlsBase;
			}
			return configModel()
				.getAll()
				.get('deviceUrlsBase');
		}),
	);

	const getOsUpdateHelper = once(() =>
		getDeviceUrlsBase().then($deviceUrlsBase =>
			_getOsUpdateHelper($deviceUrlsBase, request),
		),
	);

	// Internal method for uuid/id disambiguation
	// Note that this throws an exception for missing uuids, but not missing ids
	const getId = uuidOrId =>
		Promise.try(function() {
			if (isId(uuidOrId)) {
				return uuidOrId;
			} else {
				return exports.get(uuidOrId, { $select: 'id' }).get('id');
			}
		});

	/**
	 * @summary Ensure supervisor version compatibility using semver
	 * @name ensureSupervisorCompatibility
	 * @private
	 * @function
	 *
	 * @param {String} version - version under check
	 * @param {String} minVersion - minimum accepted version
	 * @throws {Error} Will reject if the given version is < than the given minimum version
	 * @returns {void}
	 *
	 * @example
	 * ensureSupervisorCompatibility(version, MIN_VERSION)
	 * console.log('Is compatible');
	 *
	 */
	const ensureSupervisorCompatibility = function(version, minVersion) {
		if (semver.lt(version, minVersion)) {
			throw new Error(
				`Incompatible supervisor version: ${version} - must be >= ${minVersion}`,
			);
		}
	};

	/**
	 * @summary Get Dashboard URL for a specific device
	 * @function getDashboardUrl
	 * @memberof balena.models.device
	 *
	 * @param {String} uuid - Device uuid
	 *
	 * @returns {String} - Dashboard URL for the specific device
	 * @throws Exception if the uuid is empty
	 *
	 * @example
	 * dashboardDeviceUrl = balena.models.device.getDashboardUrl('a44b544b8cc24d11b036c659dfeaccd8')
	 */
	exports.getDashboardUrl = function(uuid) {
		if (typeof uuid !== 'string' || uuid.length === 0) {
			throw new Error('The uuid option should be a non empty string');
		}

		return url.resolve(dashboardUrl, `/devices/${uuid}/summary`);
	};

	const addExtraInfo = function(device) {
		normalizeDeviceOsVersion(device);
		return device;
	};

	/**
	 * @summary Get all devices
	 * @name getAll
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object[]} - devices
	 * @returns {Promise}
	 *
	 * @description
	 * This method returns all devices that the current user can access.
	 * In order to have the following computed properties in the result
	 * you have to explicitly define them in a `$select` in the extra options:
	 * * `overall_status`
	 * * `overall_progress`
	 *
	 * @example
	 * balena.models.device.getAll().then(function(devices) {
	 * 	console.log(devices);
	 * });
	 *
	 * @example
	 * balena.models.device.getAll({ $select: ['overall_status', 'overall_progress'] }).then(function(device) {
	 * 	console.log(device);
	 * })
	 *
	 * @example
	 * balena.models.device.getAll(function(error, devices) {
	 * 	if (error) throw error;
	 * 	console.log(devices);
	 * });
	 */
	exports.getAll = function(options, callback) {
		if (options == null) {
			options = {};
		}
		callback = findCallback(arguments);

		return pine
			.get({
				resource: 'device',
				options: mergePineOptions({ $orderby: 'device_name asc' }, options),
			})
			.map(addExtraInfo)
			.asCallback(callback);
	};

	/**
	 * @summary Get all devices by application
	 * @name getAllByApplication
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @description
	 * This method returns all devices of a specific application.
	 * In order to have the following computed properties in the result
	 * you have to explicitly define them in a `$select` in the extra options:
	 * * `overall_status`
	 * * `overall_progress`
	 *
	 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object[]} - devices
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getAllByApplication('MyApp').then(function(devices) {
	 * 	console.log(devices);
	 * });
	 *
	 * @example
	 * balena.models.device.getAllByApplication(123).then(function(devices) {
	 * 	console.log(devices);
	 * });
	 *
	 * @example
	 * balena.models.device.getAllByApplication('MyApp', { $select: ['overall_status', 'overall_progress'] }).then(function(device) {
	 * 	console.log(device);
	 * })
	 *
	 * @example
	 * balena.models.device.getAllByApplication('MyApp', function(error, devices) {
	 * 	if (error) throw error;
	 * 	console.log(devices);
	 * });
	 */
	exports.getAllByApplication = function(nameOrSlugOrId, options, callback) {
		if (options == null) {
			options = {};
		}
		callback = findCallback(arguments);

		return applicationModel()
			.get(nameOrSlugOrId, { $select: 'id' })
			.then(({ id }) =>
				exports.getAll(
					mergePineOptions(
						{ $filter: { belongs_to__application: id } },
						options,
					),
					callback,
				),
			);
	};

	/**
	 * @summary Get all devices by parent device
	 * @name getAllByParentDevice
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} parentUuidOrId - parent device uuid (string) or id (number)
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object[]} - devices
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getAllByParentDevice('7cf02a6').then(function(devices) {
	 * 	console.log(devices);
	 * });
	 *
	 * @example
	 * balena.models.device.getAllByParentDevice(123).then(function(devices) {
	 * 	console.log(devices);
	 * });
	 *
	 * @example
	 * balena.models.device.getAllByParentDevice('7cf02a6', function(error, devices) {
	 * 	if (error) throw error;
	 * 	console.log(devices);
	 * });
	 */
	exports.getAllByParentDevice = function(parentUuidOrId, options, callback) {
		if (options == null) {
			options = {};
		}
		callback = findCallback(arguments);

		return exports
			.get(parentUuidOrId, { $select: 'id' })
			.then(({ id }) =>
				exports.getAll(
					mergePineOptions({ $filter: { is_managed_by__device: id } }, options),
					callback,
				),
			);
	};

	/**
	 * @summary Get a single device
	 * @name get
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @description
	 * This method returns a single device by id or uuid.
	 * In order to have the following computed properties in the result
	 * you have to explicitly define them in a `$select` in the extra options:
	 * * `overall_status`
	 * * `overall_progress`
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object} - device
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.get('7cf02a6').then(function(device) {
	 * 	console.log(device);
	 * })
	 *
	 * @example
	 * balena.models.device.get(123).then(function(device) {
	 * 	console.log(device);
	 * })
	 *
	 * @example
	 * balena.models.device.get('7cf02a6', { $select: ['overall_status', 'overall_progress'] }).then(function(device) {
	 * 	console.log(device);
	 * })
	 *
	 * @example
	 * balena.models.device.get('7cf02a6', function(error, device) {
	 * 	if (error) throw error;
	 * 	console.log(device);
	 * });
	 */
	exports.get = function(uuidOrId, options, callback) {
		if (options == null) {
			options = {};
		}
		callback = findCallback(arguments);

		return Promise.try(function() {
			if (uuidOrId == null) {
				throw new errors.BalenaDeviceNotFound(uuidOrId);
			}

			if (isId(uuidOrId)) {
				return pine
					.get({
						resource: 'device',
						id: uuidOrId,
						options,
					})
					.tap(function(device) {
						if (device == null) {
							throw new errors.BalenaDeviceNotFound(uuidOrId);
						}
					});
			} else {
				return pine
					.get({
						resource: 'device',
						options: mergePineOptions(
							{
								$filter: {
									uuid: { $startswith: uuidOrId },
								},
							},
							options,
						),
					})
					.tap(function(devices) {
						if (devices.length === 0) {
							throw new errors.BalenaDeviceNotFound(uuidOrId);
						}

						if (devices.length > 1) {
							throw new errors.BalenaAmbiguousDevice(uuidOrId);
						}
					})
					.get(0);
			}
		})
			.then(addExtraInfo)
			.asCallback(callback);
	};

	/**
	 * @summary Get a single device along with its associated services' details,
	 * including their associated commit
	 * @name getWithServiceDetails
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @description
	 * This method does not map exactly to the underlying model: it runs a
	 * larger prebuilt query, and reformats it into an easy to use and
	 * understand format. If you want more control, or to see the raw model
	 * directly, use `device.get(uuidOrId, options)` instead.
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object} - device with service details
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getWithServiceDetails('7cf02a6').then(function(device) {
	 * 	console.log(device);
	 * })
	 *
	 * @example
	 * balena.models.device.getWithServiceDetails(123).then(function(device) {
	 * 	console.log(device);
	 * })
	 *
	 * @example
	 * balena.models.device.getWithServiceDetails('7cf02a6', function(error, device) {
	 * 	if (error) throw error;
	 * 	console.log(device);
	 * });
	 */
	exports.getWithServiceDetails = function(uuidOrId, options, callback) {
		if (options == null) {
			options = {};
		}
		callback = findCallback(arguments);

		return exports
			.get(
				uuidOrId,
				mergePineOptions(getCurrentServiceDetailsPineOptions(true), options),
			)
			.then(generateCurrentServiceDetails)
			.asCallback(callback);
	};

	/**
	 * @summary Get devices by name
	 * @name getByName
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String} name - device name
	 * @fulfil {Object[]} - devices
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getByName('MyDevice').then(function(devices) {
	 * 	console.log(devices);
	 * });
	 *
	 * @example
	 * balena.models.device.getByName('MyDevice', function(error, devices) {
	 * 	if (error) throw error;
	 * 	console.log(devices);
	 * });
	 */
	exports.getByName = function(name, options, callback) {
		if (options == null) {
			options = {};
		}
		callback = findCallback(arguments);

		return exports
			.getAll(mergePineOptions({ $filter: { device_name: name } }, options))
			.tap(function(devices) {
				if (devices.length === 0) {
					throw new errors.BalenaDeviceNotFound(name);
				}
			})
			.asCallback(callback);
	};

	/**
	 * @summary Get the name of a device
	 * @name getName
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @fulfil {String} - device name
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getName('7cf02a6').then(function(deviceName) {
	 * 	console.log(deviceName);
	 * });
	 *
	 * @example
	 * balena.models.device.getName(123).then(function(deviceName) {
	 * 	console.log(deviceName);
	 * });
	 *
	 * @example
	 * balena.models.device.getName('7cf02a6', function(error, deviceName) {
	 * 	if (error) throw error;
	 * 	console.log(deviceName);
	 * });
	 */
	exports.getName = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, { $select: 'device_name' })
			.get('device_name')
			.asCallback(callback);

	/**
	 * @summary Get application name
	 * @name getApplicationName
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @fulfil {String} - application name
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getApplicationName('7cf02a6').then(function(applicationName) {
	 * 	console.log(applicationName);
	 * });
	 *
	 * @example
	 * balena.models.device.getApplicationName(123).then(function(applicationName) {
	 * 	console.log(applicationName);
	 * });
	 *
	 * @example
	 * balena.models.device.getApplicationName('7cf02a6', function(error, applicationName) {
	 * 	if (error) throw error;
	 * 	console.log(applicationName);
	 * });
	 */
	exports.getApplicationName = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, {
				$select: 'id',
				$expand: { belongs_to__application: { $select: 'app_name' } },
			})
			.then(device => device.belongs_to__application[0].app_name)
			.asCallback(callback);

	/**
	 * @summary Get application container information
	 * @name getApplicationInfo
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @deprecated
	 * @description
	 * This is not supported on multicontainer devices, and will be removed in a future major release
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @fulfil {Object} - application info
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getApplicationInfo('7cf02a6').then(function(appInfo) {
	 * 	console.log(appInfo);
	 * });
	 *
	 * @example
	 * balena.models.device.getApplicationInfo(123).then(function(appInfo) {
	 * 	console.log(appInfo);
	 * });
	 *
	 * @example
	 * balena.models.device.getApplicationInfo('7cf02a6', function(error, appInfo) {
	 * 	if (error) throw error;
	 * 	console.log(appInfo);
	 * });
	 */
	exports.getApplicationInfo = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, {
				$select: ['id', 'supervisor_version'],
				$expand: { belongs_to__application: { $select: 'id' } },
			})
			.then(function(device) {
				ensureSupervisorCompatibility(
					device.supervisor_version,
					MIN_SUPERVISOR_APPS_API,
				);
				const appId = device.belongs_to__application[0].id;
				return request.send({
					method: 'POST',
					url: `/supervisor/v1/apps/${appId}`,
					baseUrl: apiUrl,
					body: {
						deviceId: device.id,
						appId,
						method: 'GET',
					},
				});
			})
			.get('body')
			.asCallback(callback);

	/**
	 * @summary Check if a device exists
	 * @name has
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @fulfil {Boolean} - has device
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.has('7cf02a6').then(function(hasDevice) {
	 * 	console.log(hasDevice);
	 * });
	 *
	 * @example
	 * balena.models.device.has(123).then(function(hasDevice) {
	 * 	console.log(hasDevice);
	 * });
	 *
	 * @example
	 * balena.models.device.has('7cf02a6', function(error, hasDevice) {
	 * 	if (error) throw error;
	 * 	console.log(hasDevice);
	 * });
	 */
	exports.has = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, { $select: ['id'] })
			.return(true)
			.catch(errors.BalenaDeviceNotFound, () => false)
			.asCallback(callback);

	/**
	 * @summary Check if a device is online
	 * @name isOnline
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @fulfil {Boolean} - is device online
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.isOnline('7cf02a6').then(function(isOnline) {
	 * 	console.log('Is device online?', isOnline);
	 * });
	 *
	 * @example
	 * balena.models.device.isOnline(123).then(function(isOnline) {
	 * 	console.log('Is device online?', isOnline);
	 * });
	 *
	 * @example
	 * balena.models.device.isOnline('7cf02a6', function(error, isOnline) {
	 * 	if (error) throw error;
	 * 	console.log('Is device online?', isOnline);
	 * });
	 */
	exports.isOnline = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, { $select: 'is_online' })
			.get('is_online')
			.asCallback(callback);

	/**
	 * @summary Get the local IP addresses of a device
	 * @name getLocalIPAddresses
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @fulfil {String[]} - local ip addresses
	 * @reject {Error} Will reject if the device is offline
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getLocalIPAddresses('7cf02a6').then(function(localIPAddresses) {
	 * 	localIPAddresses.forEach(function(localIP) {
	 * 		console.log(localIP);
	 * 	});
	 * });
	 *
	 * @example
	 * balena.models.device.getLocalIPAddresses(123).then(function(localIPAddresses) {
	 * 	localIPAddresses.forEach(function(localIP) {
	 * 		console.log(localIP);
	 * 	});
	 * });
	 *
	 * @example
	 * balena.models.device.getLocalIPAddresses('7cf02a6', function(error, localIPAddresses) {
	 * 	if (error) throw error;
	 *
	 * 	localIPAddresses.forEach(function(localIP) {
	 * 		console.log(localIP);
	 * 	});
	 * });
	 */
	exports.getLocalIPAddresses = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, { $select: ['is_online', 'ip_address', 'vpn_address'] })
			.then(function({ is_online, ip_address, vpn_address }) {
				if (!is_online) {
					throw new Error(`The device is offline: ${uuidOrId}`);
				}

				const ips = ip_address.split(' ');
				return without(ips, vpn_address);
			})
			.asCallback(callback);

	/**
	 * @summary Remove device
	 * @name remove
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.remove('7cf02a6');
	 *
	 * @example
	 * balena.models.device.remove(123);
	 *
	 * @example
	 * balena.models.device.remove('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.remove = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, { $select: 'uuid' })
			.then(({ uuid }) =>
				pine.delete({
					resource: 'device',
					options: {
						$filter: {
							uuid,
						},
					},
				}),
			)
			.asCallback(callback);

	/**
	 * @summary Identify device
	 * @name identify
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.identify('7cf02a6');
	 *
	 * @example
	 * balena.models.device.identify(123);
	 *
	 * @example
	 * balena.models.device.identify('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.identify = (uuidOrId, callback) =>
		exports
			.get(uuidOrId)
			.then(device =>
				request.send({
					method: 'POST',
					url: '/supervisor/v1/blink',
					baseUrl: apiUrl,
					body: {
						uuid: device.uuid,
					},
				}),
			)
			.return(undefined)
			.asCallback(callback);

	/**
	 * @summary Rename device
	 * @name rename
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @param {String} newName - the device new name
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.rename('7cf02a6', 'NewName');
	 *
	 * @example
	 * balena.models.device.rename(123, 'NewName');
	 *
	 * @example
	 * balena.models.device.rename('7cf02a6', 'NewName', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.rename = (uuidOrId, newName, callback) =>
		exports
			.get(uuidOrId, { $select: 'uuid' })
			.then(({ uuid }) =>
				pine.patch({
					resource: 'device',
					body: {
						device_name: newName,
					},
					options: {
						$filter: {
							uuid,
						},
					},
				}),
			)
			.asCallback(callback);

	/**
	 * @summary Note a device
	 * @name note
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @param {String} note - the note
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.note('7cf02a6', 'My useful note');
	 *
	 * @example
	 * balena.models.device.note(123, 'My useful note');
	 *
	 * @example
	 * balena.models.device.note('7cf02a6', 'My useful note', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.note = (uuidOrId, note, callback) =>
		exports
			.get(uuidOrId, { $select: 'uuid' })
			.then(({ uuid }) =>
				pine.patch({
					resource: 'device',
					body: {
						note,
					},
					options: {
						$filter: {
							uuid,
						},
					},
				}),
			)
			.asCallback(callback);

	/**
	 * @summary Set a custom location for a device
	 * @name setCustomLocation
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @param {Object} location - the location ({ latitude: 123, longitude: 456 })
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.setCustomLocation('7cf02a6', { latitude: 123, longitude: 456 });
	 *
	 * @example
	 * balena.models.device.setCustomLocation(123, { latitude: 123, longitude: 456 });
	 *
	 * @example
	 * balena.models.device.setCustomLocation('7cf02a6', { latitude: 123, longitude: 456 }, function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.setCustomLocation = (uuidOrId, location, callback) =>
		exports
			.get(uuidOrId, { $select: 'uuid' })
			.then(({ uuid }) =>
				pine.patch({
					resource: 'device',
					body: {
						custom_latitude: String(location.latitude),
						custom_longitude: String(location.longitude),
					},
					options: {
						$filter: {
							uuid,
						},
					},
				}),
			)
			.asCallback(callback);

	/**
	 * @summary Clear the custom location of a device
	 * @name unsetCustomLocation
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.unsetCustomLocation('7cf02a6');
	 *
	 * @example
	 * balena.models.device.unsetCustomLocation(123);
	 *
	 * @example
	 * balena.models.device.unsetLocation('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.unsetCustomLocation = (uuidOrId, callback) =>
		exports.setCustomLocation(
			uuidOrId,
			{
				latitude: '',
				longitude: '',
			},
			callback,
		);

	/**
	 * @summary Move a device to another application
	 * @name move
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @param {String|Number} applicationNameOrSlugOrId - application name (string), slug (string) or id (number)
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.move('7cf02a6', 'MyApp');
	 *
	 * @example
	 * balena.models.device.move(123, 'MyApp');
	 *
	 * @example
	 * balena.models.device.move(123, 456);
	 *
	 * @example
	 * balena.models.device.move('7cf02a6', 'MyApp', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.move = (uuidOrId, applicationNameOrSlugOrId, callback) =>
		Promise.props({
			device: exports.get(uuidOrId, { $select: ['uuid', 'device_type'] }),
			deviceTypes: configModel().getDeviceTypes(),
			application: applicationModel().get(applicationNameOrSlugOrId, {
				$select: ['id', 'device_type'],
			}),
		})
			.then(function({ application, device, deviceTypes }) {
				const osDeviceType = deviceTypesUtil.getBySlug(
					deviceTypes,
					device.device_type,
				);
				const targetAppDeviceType = deviceTypesUtil.getBySlug(
					deviceTypes,
					application.device_type,
				);
				const isCompatibleMove = deviceTypesUtil.isDeviceTypeCompatibleWith(
					osDeviceType,
					targetAppDeviceType,
				);
				if (!isCompatibleMove) {
					throw new errors.BalenaInvalidDeviceType(
						`Incompatible application: ${applicationNameOrSlugOrId}`,
					);
				}

				return pine.patch({
					resource: 'device',
					body: {
						belongs_to__application: application.id,
					},
					options: {
						$filter: {
							uuid: device.uuid,
						},
					},
				});
			})
			.asCallback(callback);

	/**
	 * @summary Start application on device
	 * @name startApplication
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @deprecated
	 * @description
	 * This is not supported on multicontainer devices, and will be removed in a future major release
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @fulfil {String} - application container id
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.startApplication('7cf02a6').then(function(containerId) {
	 * 	console.log(containerId);
	 * });
	 *
	 * @example
	 * balena.models.device.startApplication(123).then(function(containerId) {
	 * 	console.log(containerId);
	 * });
	 *
	 * @example
	 * balena.models.device.startApplication('7cf02a6', function(error, containerId) {
	 * 	if (error) throw error;
	 * 	console.log(containerId);
	 * });
	 */
	exports.startApplication = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, {
				$select: ['id', 'supervisor_version'],
				$expand: { belongs_to__application: { $select: 'id' } },
			})
			.then(function(device) {
				ensureSupervisorCompatibility(
					device.supervisor_version,
					MIN_SUPERVISOR_APPS_API,
				);
				const appId = device.belongs_to__application[0].id;
				return request.send({
					method: 'POST',
					url: `/supervisor/v1/apps/${appId}/start`,
					baseUrl: apiUrl,
					body: {
						deviceId: device.id,
						appId,
					},
					timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT,
				});
			})
			.get('body')
			.get('containerId')
			.asCallback(callback);

	/**
	 * @summary Stop application on device
	 * @name stopApplication
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @deprecated
	 * @description
	 * This is not supported on multicontainer devices, and will be removed in a future major release
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @fulfil {String} - application container id
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.stopApplication('7cf02a6').then(function(containerId) {
	 * 	console.log(containerId);
	 * });
	 *
	 * @example
	 * balena.models.device.stopApplication(123).then(function(containerId) {
	 * 	console.log(containerId);
	 * });
	 *
	 * @example
	 * balena.models.device.stopApplication('7cf02a6', function(error, containerId) {
	 * 	if (error) throw error;
	 * 	console.log(containerId);
	 * });
	 */
	exports.stopApplication = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, {
				$select: ['id', 'supervisor_version'],
				$expand: { belongs_to__application: { $select: 'id' } },
			})
			.then(function(device) {
				ensureSupervisorCompatibility(
					device.supervisor_version,
					MIN_SUPERVISOR_APPS_API,
				);
				const appId = device.belongs_to__application[0].id;
				return request.send({
					method: 'POST',
					url: `/supervisor/v1/apps/${appId}/stop`,
					baseUrl: apiUrl,
					body: {
						deviceId: device.id,
						appId,
					},
					timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT,
				});
			})
			.get('body')
			.get('containerId')
			.asCallback(callback);

	/**
	 * @summary Restart application on device
	 * @name restartApplication
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @description
	 * This function restarts the Docker container running
	 * the application on the device, but doesn't reboot
	 * the device itself.
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.restartApplication('7cf02a6');
	 *
	 * @example
	 * balena.models.device.restartApplication(123);
	 *
	 * @example
	 * balena.models.device.restartApplication('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.restartApplication = (uuidOrId, callback) =>
		getId(uuidOrId)
			.then(deviceId =>
				request.send({
					method: 'POST',
					url: `/device/${deviceId}/restart`,
					baseUrl: apiUrl,
					timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT,
				}),
			)
			.get('body')
			.catch(isNotFoundResponse, treatAsMissingDevice(uuidOrId))
			.asCallback(callback);

	/**
	 * @summary Start a service on a device
	 * @name startService
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @param {Number} imageId - id of the image to start
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.startService('7cf02a6', 123).then(function() {
	 * 	...
	 * });
	 *
	 * @example
	 * balena.models.device.startService(1, 123).then(function() {
	 * 	...
	 * });
	 *
	 * @example
	 * balena.models.device.startService('7cf02a6', 123, function(error) {
	 * 	if (error) throw error;
	 * 	...
	 * });
	 */
	exports.startService = (uuidOrId, imageId, callback) =>
		exports
			.get(uuidOrId, {
				$select: ['id', 'supervisor_version'],
				$expand: { belongs_to__application: { $select: 'id' } },
			})
			.then(function(device) {
				ensureSupervisorCompatibility(
					device.supervisor_version,
					MIN_SUPERVISOR_MC_API,
				);
				const appId = device.belongs_to__application[0].id;
				return request.send({
					method: 'POST',
					url: `/supervisor/v2/applications/${appId}/start-service`,
					baseUrl: apiUrl,
					body: {
						deviceId: device.id,
						appId,
						data: {
							appId,
							imageId,
						},
					},
					timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT,
				});
			})
			.asCallback(callback);

	/**
	 * @summary Stop a service on a device
	 * @name stopService
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @param {Number} imageId - id of the image to stop
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.stopService('7cf02a6', 123).then(function() {
	 * 	...
	 * });
	 *
	 * @example
	 * balena.models.device.stopService(1, 123).then(function() {
	 * 	...
	 * });
	 *
	 * @example
	 * balena.models.device.stopService('7cf02a6', 123, function(error) {
	 * 	if (error) throw error;
	 * 	...
	 * });
	 */
	exports.stopService = (uuidOrId, imageId, callback) =>
		exports
			.get(uuidOrId, {
				$select: ['id', 'supervisor_version'],
				$expand: { belongs_to__application: { $select: 'id' } },
			})
			.then(function(device) {
				ensureSupervisorCompatibility(
					device.supervisor_version,
					MIN_SUPERVISOR_MC_API,
				);
				const appId = device.belongs_to__application[0].id;
				return request.send({
					method: 'POST',
					url: `/supervisor/v2/applications/${appId}/stop-service`,
					baseUrl: apiUrl,
					body: {
						deviceId: device.id,
						appId,
						data: {
							appId,
							imageId,
						},
					},
					timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT,
				});
			})
			.asCallback(callback);

	/**
	 * @summary Restart a service on a device
	 * @name restartService
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @param {Number} imageId - id of the image to restart
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.restartService('7cf02a6', 123).then(function() {
	 * 	...
	 * });
	 *
	 * @example
	 * balena.models.device.restartService(1, 123).then(function() {
	 * 	...
	 * });
	 *
	 * @example
	 * balena.models.device.restartService('7cf02a6', 123, function(error) {
	 * 	if (error) throw error;
	 * 	...
	 * });
	 */
	exports.restartService = (uuidOrId, imageId, callback) =>
		exports
			.get(uuidOrId, {
				$select: ['id', 'supervisor_version'],
				$expand: { belongs_to__application: { $select: 'id' } },
			})
			.then(function(device) {
				ensureSupervisorCompatibility(
					device.supervisor_version,
					MIN_SUPERVISOR_MC_API,
				);
				const appId = device.belongs_to__application[0].id;
				return request.send({
					method: 'POST',
					url: `/supervisor/v2/applications/${appId}/restart-service`,
					baseUrl: apiUrl,
					body: {
						deviceId: device.id,
						appId,
						data: {
							appId,
							imageId,
						},
					},
					timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT,
				});
			})
			.asCallback(callback);

	/**
	 * @summary Reboot device
	 * @name reboot
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @param {Object} [options] - options
	 * @param {Boolean} [options.force=false] - override update lock
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.reboot('7cf02a6');
	 *
	 * @example
	 * balena.models.device.reboot(123);
	 *
	 * @example
	 * balena.models.device.reboot('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.reboot = function(uuidOrId, options, callback) {
		if (options == null) {
			options = {};
		}
		callback = findCallback(arguments);

		return getId(uuidOrId)
			.then(deviceId =>
				request
					.send({
						method: 'POST',
						url: '/supervisor/v1/reboot',
						baseUrl: apiUrl,
						body: {
							deviceId,
							data: {
								force: Boolean(options?.force),
							},
						},
					})
					.catch(function(err) {
						if (err.statusCode === LOCKED_STATUS_CODE) {
							throw new errors.BalenaSupervisorLockedError();
						}

						throw err;
					}),
			)
			.get('body')
			.catch(isNotFoundResponse, treatAsMissingDevice(uuidOrId))
			.asCallback(callback);
	};

	/**
	 * @summary Shutdown device
	 * @name shutdown
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @param {Object} [options] - options
	 * @param {Boolean} [options.force=false] - override update lock
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.shutdown('7cf02a6');
	 *
	 * @example
	 * balena.models.device.shutdown(123);
	 *
	 * @example
	 * balena.models.device.shutdown('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.shutdown = function(uuidOrId, options, callback) {
		if (options == null) {
			options = {};
		}
		callback = findCallback(arguments);

		return exports
			.get(uuidOrId, {
				$select: 'id',
				$expand: { belongs_to__application: { $select: 'id' } },
			})
			.then(device =>
				request
					.send({
						method: 'POST',
						url: '/supervisor/v1/shutdown',
						baseUrl: apiUrl,
						body: {
							deviceId: device.id,
							appId: device.belongs_to__application[0].id,
							data: {
								force: Boolean(options?.force),
							},
						},
					})
					.catch(function(err) {
						if (err.statusCode === LOCKED_STATUS_CODE) {
							throw new errors.BalenaSupervisorLockedError();
						}

						throw err;
					}),
			)
			.asCallback(callback);
	};

	/**
	 * @summary Purge device
	 * @name purge
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @description
	 * This function clears the user application's `/data` directory.
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.purge('7cf02a6');
	 *
	 * @example
	 * balena.models.device.purge(123);
	 *
	 * @example
	 * balena.models.device.purge('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.purge = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, {
				$select: 'id',
				$expand: { belongs_to__application: { $select: 'id' } },
			})
			.then(device =>
				request
					.send({
						method: 'POST',
						url: '/supervisor/v1/purge',
						baseUrl: apiUrl,
						body: {
							deviceId: device.id,
							appId: device.belongs_to__application[0].id,
							data: {
								appId: device.belongs_to__application[0].id,
							},
						},
					})
					.catch(function(err) {
						if (err.statusCode === LOCKED_STATUS_CODE) {
							throw new errors.BalenaSupervisorLockedError();
						}

						throw err;
					}),
			)
			.asCallback(callback);

	/**
	 * @summary Trigger an update check on the supervisor
	 * @name update
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @param {Object} [options] - options
	 * @param {Boolean} [options.force=false] - override update lock
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.update('7cf02a6', {
	 * 	force: true
	 * });
	 *
	 * @example
	 * balena.models.device.update(123, {
	 * 	force: true
	 * });
	 *
	 * @example
	 * balena.models.device.update('7cf02a6', {
	 * 	force: true
	 * }, function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.update = function(uuidOrId, options, callback) {
		if (options == null) {
			options = {};
		}
		callback = findCallback(arguments);

		return exports
			.get(uuidOrId, {
				$select: 'id',
				$expand: { belongs_to__application: { $select: 'id' } },
			})
			.then(device =>
				request.send({
					method: 'POST',
					url: '/supervisor/v1/update',
					baseUrl: apiUrl,
					body: {
						deviceId: device.id,
						appId: device.belongs_to__application[0].id,
						data: {
							force: Boolean(options?.force),
						},
					},
				}),
			)
			.asCallback(callback);
	};

	/**
	 * @summary Get the target supervisor state on a device
	 * @name getSupervisorTargetState
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getSupervisorTargetState('7cf02a6').then(function(state) {
	 * 	console.log(state);
	 * });
	 *
	 * @example
	 * balena.models.device.getSupervisorTargetState(123).then(function(state) {
	 * 	console.log(state);
	 * });
	 *
	 * @example
	 * balena.models.device.getSupervisorTargetState('7cf02a6', function(error, state) {
	 * 	if (error) throw error;
	 * 	console.log(state);
	 * });
	 */
	exports.getSupervisorTargetState = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, { $select: 'uuid' })
			.then(({ uuid }) =>
				request.send({
					url: `/device/v2/${uuid}/state`,
					baseUrl: apiUrl,
				}),
			)
			.get('body')
			.asCallback(callback);

	/**
	 * @summary Get the supervisor state on a device
	 * @name getSupervisorState
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getSupervisorState('7cf02a6').then(function(state) {
	 * 	console.log(state);
	 * });
	 *
	 * @example
	 * balena.models.device.getSupervisorState(123).then(function(state) {
	 * 	console.log(state);
	 * });
	 *
	 * @example
	 * balena.models.device.getSupervisorState('7cf02a6', function(error, state) {
	 * 	if (error) throw error;
	 * 	console.log(state);
	 * });
	 */
	exports.getSupervisorState = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, { $select: 'uuid' })
			.then(({ uuid }) =>
				request.send({
					method: 'POST',
					url: '/supervisor/v1/device',
					baseUrl: apiUrl,
					body: {
						uuid,
						method: 'GET',
					},
				}),
			)
			.get('body')
			.asCallback(callback);

	/**
	 * @summary Get display name for a device
	 * @name getDisplayName
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @see {@link balena.models.device.getSupportedDeviceTypes} for a list of supported devices
	 *
	 * @param {String} deviceTypeSlug - device type slug
	 * @fulfil {String} - device display name
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getDisplayName('raspberry-pi').then(function(deviceTypeName) {
	 * 	console.log(deviceTypeName);
	 * 	// Raspberry Pi
	 * });
	 *
	 * @example
	 * balena.models.device.getDisplayName('raspberry-pi', function(error, deviceTypeName) {
	 * 	if (error) throw error;
	 * 	console.log(deviceTypeName);
	 * 	// Raspberry Pi
	 * });
	 */
	exports.getDisplayName = (deviceTypeSlug, callback) =>
		exports
			.getManifestBySlug(deviceTypeSlug)
			.get('name')
			.catch(function(error) {
				if (error instanceof errors.BalenaInvalidDeviceType) {
					return;
				}

				throw error;
			})
			.asCallback(callback);

	/**
	 * @summary Get device slug
	 * @name getDeviceSlug
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @see {@link balena.models.device.getSupportedDeviceTypes} for a list of supported devices
	 *
	 * @param {String} deviceTypeName - device type name
	 * @fulfil {String} - device slug name
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getDeviceSlug('Raspberry Pi').then(function(deviceTypeSlug) {
	 * 	console.log(deviceTypeSlug);
	 * 	// raspberry-pi
	 * });
	 *
	 * @example
	 * balena.models.device.getDeviceSlug('Raspberry Pi', function(error, deviceTypeSlug) {
	 * 	if (error) throw error;
	 * 	console.log(deviceTypeSlug);
	 * 	// raspberry-pi
	 * });
	 */
	exports.getDeviceSlug = (deviceTypeName, callback) =>
		exports
			.getManifestBySlug(deviceTypeName)
			.get('slug')
			.catch(function(error) {
				if (error instanceof errors.BalenaInvalidDeviceType) {
					return;
				}

				throw error;
			})
			.asCallback(callback);

	/**
	 * @summary Get supported device types
	 * @name getSupportedDeviceTypes
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @fulfil {String[]} - supported device types
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getSupportedDeviceTypes().then(function(supportedDeviceTypes) {
	 * 	supportedDeviceTypes.forEach(function(supportedDeviceType) {
	 * 		console.log('Balena supports:', supportedDeviceType);
	 * 	});
	 * });
	 *
	 * @example
	 * balena.models.device.getSupportedDeviceTypes(function(error, supportedDeviceTypes) {
	 * 	if (error) throw error;
	 *
	 * 	supportedDeviceTypes.forEach(function(supportedDeviceType) {
	 * 		console.log('Balena supports:', supportedDeviceType);
	 * 	});
	 * });
	 */
	exports.getSupportedDeviceTypes = callback =>
		configModel()
			.getDeviceTypes()
			.then(deviceTypes => deviceTypes.map(dt => dt.name))
			.asCallback(callback);

	/**
	 * @summary Get a device manifest by slug
	 * @name getManifestBySlug
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String} slug - device slug
	 * @fulfil {Object} - device manifest
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getManifestBySlug('raspberry-pi').then(function(manifest) {
	 * 	console.log(manifest);
	 * });
	 *
	 * @example
	 * balena.models.device.getManifestBySlug('raspberry-pi', function(error, manifest) {
	 * 	if (error) throw error;
	 * 	console.log(manifest);
	 * });
	 */
	exports.getManifestBySlug = (slug, callback) =>
		configModel()
			.getDeviceTypes()
			.then(deviceTypes =>
				deviceTypes.find(
					deviceType =>
						deviceType.name === slug ||
						deviceType.slug === slug ||
						deviceType.aliases?.includes(slug),
				),
			)
			.then(function(deviceManifest) {
				if (deviceManifest == null) {
					throw new errors.BalenaInvalidDeviceType(slug);
				}

				return deviceManifest;
			})
			.asCallback(callback);

	/**
	 * @summary Get a device manifest by application name
	 * @name getManifestByApplication
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
	 * @fulfil {Object} - device manifest
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getManifestByApplication('MyApp').then(function(manifest) {
	 * 	console.log(manifest);
	 * });
	 *
	 * @example
	 * balena.models.device.getManifestByApplication(123).then(function(manifest) {
	 * 	console.log(manifest);
	 * });
	 *
	 * @example
	 * balena.models.device.getManifestByApplication('MyApp', function(error, manifest) {
	 * 	if (error) throw error;
	 * 	console.log(manifest);
	 * });
	 */
	exports.getManifestByApplication = (nameOrSlugOrId, callback) =>
		applicationModel()
			.get(nameOrSlugOrId, { $select: 'device_type' })
			.get('device_type')
			.then(exports.getManifestBySlug)
			.asCallback(callback);

	/**
	 * @summary Generate a random key, useful for both uuid and api key.
	 * @name generateUniqueKey
	 * @function
	 * @public
	 * @memberof balena.models.device
	 *
	 * @returns {String} A generated key
	 *
	 * @example
	 * randomKey = balena.models.device.generateUniqueKey();
	 * // randomKey is a randomly generated key that can be used as either a uuid or an api key
	 * console.log(randomKey);
	 */
	exports.generateUniqueKey = registerDevice.generateUniqueKey;

	/**
	 * @summary Register a new device with a Balena application.
	 * @name register
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} applicationNameOrSlugOrId - application name (string), slug (string) or id (number)
	 * @param {String} [uuid] - device uuid
	 *
	 * @fulfil {Object} Device registration info ({ id: "...", uuid: "...", api_key: "..." })
	 * @returns {Promise}
	 *
	 * @example
	 * var uuid = balena.models.device.generateUniqueKey();
	 * balena.models.device.register('MyApp', uuid).then(function(registrationInfo) {
	 * 	console.log(registrationInfo);
	 * });
	 *
	 * @example
	 * var uuid = balena.models.device.generateUniqueKey();
	 * balena.models.device.register(123, uuid).then(function(registrationInfo) {
	 * 	console.log(registrationInfo);
	 * });
	 *
	 * @example
	 * var uuid = balena.models.device.generateUniqueKey();
	 * balena.models.device.register('MyApp', uuid, function(error, registrationInfo) {
	 * 	if (error) throw error;
	 * 	console.log(registrationInfo);
	 * });
	 */
	exports.register = function(applicationNameOrSlugOrId, uuid, callback) {
		callback = findCallback(arguments);

		return Promise.props({
			userId: auth.getUserId(),
			apiKey: applicationModel().generateProvisioningKey(
				applicationNameOrSlugOrId,
			),
			application: applicationModel().get(applicationNameOrSlugOrId, {
				$select: ['id', 'device_type'],
			}),
		})
			.then(({ userId, apiKey, application }) =>
				registerDevice.register({
					userId,
					applicationId: application.id,
					uuid,
					deviceType: application.device_type,
					provisioningApiKey: apiKey,
					apiEndpoint: apiUrl,
				}),
			)
			.asCallback(callback);
	};

	/**
	 * @summary Generate a device key
	 * @name generateDeviceKey
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.generateDeviceKey('7cf02a6').then(function(deviceApiKey) {
	 * 	console.log(deviceApiKey);
	 * });
	 *
	 * @example
	 * balena.models.device.generateDeviceKey(123).then(function(deviceApiKey) {
	 * 	console.log(deviceApiKey);
	 * });
	 *
	 * @example
	 * balena.models.device.generateDeviceKey('7cf02a6', function(error, deviceApiKey) {
	 * 	if (error) throw error;
	 * 	console.log(deviceApiKey);
	 * });
	 */
	exports.generateDeviceKey = (uuidOrId, callback) =>
		getId(uuidOrId)
			.then(deviceId =>
				request.send({
					method: 'POST',
					url: `/api-key/device/${deviceId}/device-key`,
					baseUrl: apiUrl,
				}),
			)
			.get('body')
			.catch(isNoDeviceForKeyResponse, treatAsMissingDevice(uuidOrId))
			.asCallback(callback);

	/**
	 * @summary Check if a device is web accessible with device utls
	 * @name hasDeviceUrl
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @fulfil {Boolean} - has device url
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.hasDeviceUrl('7cf02a6').then(function(hasDeviceUrl) {
	 * 	if (hasDeviceUrl) {
	 * 		console.log('The device has device URL enabled');
	 * 	}
	 * });
	 *
	 * @example
	 * balena.models.device.hasDeviceUrl(123).then(function(hasDeviceUrl) {
	 * 	if (hasDeviceUrl) {
	 * 		console.log('The device has device URL enabled');
	 * 	}
	 * });
	 *
	 * @example
	 * balena.models.device.hasDeviceUrl('7cf02a6', function(error, hasDeviceUrl) {
	 * 	if (error) throw error;
	 *
	 * 	if (hasDeviceUrl) {
	 * 		console.log('The device has device URL enabled');
	 * 	}
	 * });
	 */
	exports.hasDeviceUrl = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, { $select: 'is_web_accessible' })
			.get('is_web_accessible')
			.asCallback(callback);

	/**
	 * @summary Get a device url
	 * @name getDeviceUrl
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @fulfil {String} - device url
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getDeviceUrl('7cf02a6').then(function(url) {
	 * 	console.log(url);
	 * });
	 *
	 * @example
	 * balena.models.device.getDeviceUrl(123).then(function(url) {
	 * 	console.log(url);
	 * });
	 *
	 * @example
	 * balena.models.device.getDeviceUrl('7cf02a6', function(error, url) {
	 * 	if (error) throw error;
	 * 	console.log(url);
	 * });
	 */
	exports.getDeviceUrl = (uuidOrId, callback) =>
		exports
			.hasDeviceUrl(uuidOrId)
			.then(function(hasDeviceUrl) {
				if (!hasDeviceUrl) {
					throw new Error(`Device is not web accessible: ${uuidOrId}`);
				}

				return getDeviceUrlsBase().then($deviceUrlsBase =>
					exports
						.get(uuidOrId, { $select: 'uuid' })
						.get('uuid')
						.then(uuid => `https://${uuid}.${$deviceUrlsBase}`),
				);
			})
			.asCallback(callback);

	/**
	 * @summary Enable device url for a device
	 * @name enableDeviceUrl
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.enableDeviceUrl('7cf02a6');
	 *
	 * @example
	 * balena.models.device.enableDeviceUrl(123);
	 *
	 * @example
	 * balena.models.device.enableDeviceUrl('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.enableDeviceUrl = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, { $select: 'uuid' })
			.then(({ uuid }) =>
				pine.patch({
					resource: 'device',
					body: {
						is_web_accessible: true,
					},
					options: {
						$filter: {
							uuid,
						},
					},
				}),
			)
			.asCallback(callback);

	/**
	 * @summary Disable device url for a device
	 * @name disableDeviceUrl
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.disableDeviceUrl('7cf02a6');
	 *
	 * @example
	 * balena.models.device.disableDeviceUrl(123);
	 *
	 * @example
	 * balena.models.device.disableDeviceUrl('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.disableDeviceUrl = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, { $select: 'uuid' })
			.then(({ uuid }) =>
				pine.patch({
					resource: 'device',
					body: {
						is_web_accessible: false,
					},
					options: {
						$filter: {
							uuid,
						},
					},
				}),
			)
			.asCallback(callback);

	/**
	 * @summary Enable local mode
	 * @name enableLocalMode
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.enableLocalMode('7cf02a6');
	 *
	 * @example
	 * balena.models.device.enableLocalMode(123);
	 *
	 * @example
	 * balena.models.device.enableLocalMode('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.enableLocalMode = function(uuidOrId, callback) {
		const selectedProps = ['id', ...LOCAL_MODE_SUPPORT_PROPERTIES];
		return exports
			.get(uuidOrId, { $select: selectedProps })
			.then(function(device) {
				checkLocalModeSupported(device);
				return exports.configVar.set(device.id, LOCAL_MODE_ENV_VAR, '1');
			})
			.asCallback(callback);
	};

	/**
	 * @summary Disable local mode
	 * @name disableLocalMode
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.disableLocalMode('7cf02a6');
	 *
	 * @example
	 * balena.models.device.disableLocalMode(123);
	 *
	 * @example
	 * balena.models.device.disableLocalMode('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.disableLocalMode = (uuidOrId, callback) =>
		exports.configVar
			.set(uuidOrId, LOCAL_MODE_ENV_VAR, '0')
			.asCallback(callback);

	/**
	 * @summary Check if local mode is enabled on the device
	 * @name isInLocalMode
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @fulfil {Boolean} - has device url
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.isInLocalMode('7cf02a6').then(function(isInLocalMode) {
	 * 	if (isInLocalMode) {
	 * 		console.log('The device has local mode enabled');
	 * 	}
	 * });
	 *
	 * @example
	 * balena.models.device.isInLocalMode(123).then(function(isInLocalMode) {
	 * 	if (isInLocalMode) {
	 * 		console.log('The device has local mode enabled');
	 * 	}
	 * });
	 *
	 * @example
	 * balena.models.device.isInLocalMode('7cf02a6', function(error, isInLocalMode) {
	 * 	if (error) throw error;
	 *
	 * 	if (isInLocalMode) {
	 * 		console.log('The device has local mode enabled');
	 * 	}
	 * });
	 */
	exports.isInLocalMode = (uuidOrId, callback) =>
		exports.configVar
			.get(uuidOrId, LOCAL_MODE_ENV_VAR)
			.then(value => value === '1')
			.asCallback(callback);

	/**
	 * @summary Returns whether local mode is supported along with a message describing the reason why local mode is not supported.
	 * @name getLocalModeSupport
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {Object} device - A device object
	 * @returns {Object} Local mode support info ({ supported: true/false, message: "..." })
	 *
	 * @example
	 * balena.models.device.get('7cf02a6').then(function(device) {
	 * 	balena.models.device.getLocalModeSupport(device);
	 * })
	 */
	exports.getLocalModeSupport = getLocalModeSupport;

	const setLockOverriden = (uuidOrId, shouldOverride, callback) =>
		getId(uuidOrId)
			.then(function(deviceId) {
				const value = shouldOverride ? '1' : '0';
				return request.send({
					method: 'POST',
					url: `/device/${deviceId}/lock-override`,
					baseUrl: apiUrl,
					body: {
						value,
					},
				});
			})
			.asCallback(callback);

	/**
	 * @summary Enable lock override
	 * @name enableLockOverride
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.enableLockOverride('7cf02a6');
	 *
	 * @example
	 * balena.models.device.enableLockOverride(123);
	 *
	 * @example
	 * balena.models.device.enableLockOverride('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.enableLockOverride = (uuidOrId, callback) =>
		setLockOverriden(uuidOrId, true, callback);

	/**
	 * @summary Disable lock override
	 * @name disableLockOverride
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.disableLockOverride('7cf02a6');
	 *
	 * @example
	 * balena.models.device.disableLockOverride(123);
	 *
	 * @example
	 * balena.models.device.disableLockOverride('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.disableLockOverride = (uuidOrId, callback) =>
		setLockOverriden(uuidOrId, false, callback);

	/**
	 * @summary Check if a device has the lock override enabled
	 * @name hasLockOverride
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.hasLockOverride('7cf02a6');
	 *
	 * @example
	 * balena.models.device.hasLockOverride(123);
	 *
	 * @example
	 * balena.models.device.hasLockOverride('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.hasLockOverride = (uuidOrId, callback) =>
		getId(uuidOrId)
			.then(deviceId =>
				request.send({
					method: 'GET',
					url: `/device/${deviceId}/lock-override`,
					baseUrl: apiUrl,
				}),
			)
			.then(({ body }) => body === '1')
			.asCallback(callback);

	/**
	 * @summary Ping a device
	 * @name ping
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @description
	 * This is useful to signal that the supervisor is alive and responding.
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.ping('7cf02a6');
	 *
	 * @example
	 * balena.models.device.ping(123);
	 *
	 * @example
	 * balena.models.device.ping('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.ping = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, {
				$select: 'id',
				$expand: { belongs_to__application: { $select: 'id' } },
			})
			.then(device =>
				request.send({
					method: 'POST',
					url: '/supervisor/ping',
					baseUrl: apiUrl,
					body: {
						method: 'GET',
						deviceId: device.id,
						appId: device.belongs_to__application[0].id,
					},
				}),
			)
			.asCallback(callback);

	/**
	 * @summary Get the status of a device
	 * @name getStatus
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @description
	 * Computes the status of an already retrieved device object.
	 * It's recommended to use `balena.models.device.get(deviceUuid, { $select: ['overall_status'] })` instead,
	 * in case that you need to retrieve more device fields than just the status.
	 *
	 * @see {@link balena.models.device.getWithServiceDetails} for retrieving the device object that this method accepts.
	 *
	 * @param {Object} device - A device object
	 * @fulfil {String} - device status
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getWithServiceDetails('7cf02a6').then(function(device) {
	 * 	return balena.models.device.getStatus(device);
	 * }).then(function(status) {
	 * 	console.log(status);
	 * });
	 *
	 * @example
	 * balena.models.device.getStatus(device, function(error, status) {
	 * 	if (error) throw error;
	 * 	console.log(status);
	 * });
	 */
	exports.getStatus = (device, callback) =>
		Promise.try(() => deviceStatus.getStatus(device).key).asCallback(callback);

	/**
	 * @summary Grant support access to a device until a specified time
	 * @name grantSupportAccess
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @param {Number} expiryTimestamp - a timestamp in ms for when the support access will expire
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.grantSupportAccess('7cf02a6', Date.now() + 3600 * 1000);
	 *
	 * @example
	 * balena.models.device.grantSupportAccess(123, Date.now() + 3600 * 1000);
	 *
	 * @example
	 * balena.models.device.grantSupportAccess('7cf02a6', Date.now() + 3600 * 1000, function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.grantSupportAccess = function(uuidOrId, expiryTimestamp, callback) {
		if (expiryTimestamp == null || expiryTimestamp <= Date.now()) {
			throw new errors.BalenaInvalidParameterError(
				'expiryTimestamp',
				expiryTimestamp,
			);
		}

		return exports
			.get(uuidOrId, { $select: 'id' })
			.then(({ id }) =>
				pine.patch({
					resource: 'device',
					id,
					body: { is_accessible_by_support_until__date: expiryTimestamp },
				}),
			)
			.asCallback(callback);
	};

	/**
	 * @summary Revoke support access to a device
	 * @name revokeSupportAccess
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.revokeSupportAccess('7cf02a6');
	 *
	 * @example
	 * balena.models.device.revokeSupportAccess(123);
	 *
	 * @example
	 * balena.models.device.revokeSupportAccess('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.revokeSupportAccess = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, { $select: 'id' })
			.then(({ id }) =>
				pine.patch({
					resource: 'device',
					id,
					body: { is_accessible_by_support_until__date: null },
				}),
			)
			.asCallback(callback);

	/**
	 * @summary Get a string showing when a device was last set as online
	 * @name lastOnline
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @description
	 * If the device has never been online this method returns the string `Connecting...`.
	 *
	 * @param {Object} device - A device object
	 * @returns {String}
	 *
	 * @example
	 * balena.models.device.get('7cf02a6').then(function(device) {
	 * 	balena.models.device.lastOnline(device);
	 * })
	 */
	exports.lastOnline = function(device) {
		const lce = device.last_connectivity_event;

		if (!lce) {
			return 'Connecting...';
		}

		if (device.is_online) {
			return `Online (for ${timeSince(lce, false)})`;
		}

		return timeSince(lce);
	};

	/**
	 * @summary Get the OS version (version number and variant combined) running on a device
	 * @name getOsVersion
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {Object} device - A device object
	 * @returns {?String}
	 *
	 * @example
	 * balena.models.device.get('7cf02a6').then(function(device) {
	 * 	console.log(device.os_version); // => 'balenaOS 2.26.0+rev1'
	 * 	console.log(device.os_variant); // => 'prod'
	 * 	balena.models.device.getOsVersion(device); // => '2.26.0+rev1.prod'
	 * })
	 */
	exports.getOsVersion = device => getDeviceOsSemverWithVariant(device);

	/**
	 * @summary Get whether the device is configured to track the current application release
	 * @name isTrackingApplicationRelease
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @fulfil {Boolean} - is tracking the current application release
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.isTrackingApplicationRelease('7cf02a6').then(function(isEnabled) {
	 * 	console.log(isEnabled);
	 * });
	 *
	 * @example
	 * balena.models.device.isTrackingApplicationRelease('7cf02a6', function(error, isEnabled) {
	 * 	console.log(isEnabled);
	 * });
	 */
	exports.isTrackingApplicationRelease = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, { $select: 'should_be_running__release' })
			.then(({ should_be_running__release }) => !should_be_running__release)
			.asCallback(callback);

	/**
	 * @summary Get the hash of the currently tracked release for a specific device
	 * @name getTargetReleaseHash
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @fulfil {String} - The release hash of the currently tracked release
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getTargetReleaseHash('7cf02a6').then(function(release) {
	 * 	console.log(release);
	 * });
	 *
	 * @example
	 * balena.models.device.getTargetReleaseHash('7cf02a6', function(release) {
	 * 	console.log(release);
	 * });
	 */
	exports.getTargetReleaseHash = (uuidOrId, callback) =>
		exports
			.get(uuidOrId, {
				$select: 'id',
				$expand: {
					should_be_running__release: {
						$select: 'commit',
					},
					belongs_to__application: {
						$select: 'id',
						$expand: { should_be_running__release: { $select: ['commit'] } },
					},
				},
			})
			.then(function({ should_be_running__release, belongs_to__application }) {
				if (should_be_running__release.length > 0) {
					return should_be_running__release[0].commit;
				}
				const targetRelease =
					belongs_to__application[0].should_be_running__release[0];
				if (targetRelease) {
					return targetRelease.commit;
				}
			})
			.asCallback(callback);

	/**
	 * @summary Set a specific device to run a particular release
	 * @name pinToRelease
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @description Configures the device to run a particular release
	 * and not get updated when the current application release changes.
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @param {String|Number} fullReleaseHashOrId - the hash of a successful release (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.pinToRelease('7cf02a6', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
	 * 	...
	 * });
	 *
	 * @example
	 * balena.models.device.pinToRelease(123, 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
	 * 	...
	 * });
	 *
	 * @example
	 * balena.models.device.pinToRelease('7cf02a6', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847', function(error) {
	 * 	if (error) throw error;
	 * 	...
	 * });
	 */
	exports.pinToRelease = (uuidOrId, fullReleaseHashOrId, callback) =>
		Promise.try(function() {
			if (isId(uuidOrId) && isId(fullReleaseHashOrId)) {
				return {
					deviceId: uuidOrId,
					releaseId: fullReleaseHashOrId,
				};
			}

			const releaseFilterProperty = isId(fullReleaseHashOrId) ? 'id' : 'commit';
			return exports
				.get(uuidOrId, {
					$select: 'id',
					$expand: {
						belongs_to__application: {
							$select: 'id',
							$expand: {
								owns__release: {
									$top: 1,
									$select: 'id',
									$filter: {
										[releaseFilterProperty]: fullReleaseHashOrId,
										status: 'success',
									},
									$orderby: 'created_at desc',
								},
							},
						},
					},
				})
				.then(function({ id, belongs_to__application }) {
					const app = belongs_to__application[0];
					const release = app.owns__release[0];
					if (!release) {
						throw new errors.BalenaReleaseNotFound(fullReleaseHashOrId);
					}
					return {
						deviceId: id,
						releaseId: release.id,
					};
				});
		})
			.then(({ deviceId, releaseId }) =>
				pine.patch({
					resource: 'device',
					id: deviceId,
					body: { should_be_running__release: releaseId },
				}),
			)
			.asCallback(callback);

	/**
	 * @summary Configure a specific device to track the current application release
	 * @name trackApplicationRelease
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @description The device's current release will be updated with each new successfully built release.
	 *
	 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.trackApplicationRelease('7cf02a6').then(function() {
	 * 	...
	 * });
	 *
	 * @example
	 * balena.models.device.trackApplicationRelease('7cf02a6', function(error) {
	 * 	if (error) throw error;
	 * 	...
	 * });
	 */
	exports.trackApplicationRelease = (uuidOrId, callback) =>
		getId(uuidOrId)
			.then(deviceId =>
				pine.patch({
					resource: 'device',
					id: deviceId,
					body: { should_be_running__release: null },
				}),
			)
			.asCallback(callback);

	/**
	 * @summary Check whether the provided device can update to the target os version
	 * @name _checkOsUpdateTarget
	 * @private
	 * @function
	 * @memberof balena.models.device
	 *
	 * @description
	 * Utility method exported for testability
	 *
	 * @param {Object} device - A device object
	 * @param {String} targetOsVersion - semver-compatible version for the target device
	 * @throws Exception if update isn't supported
	 * @returns {void}
	 */
	exports._checkOsUpdateTarget = function(
		{ uuid, device_type, is_online, os_version, os_variant },
		targetOsVersion,
	) {
		if (!uuid) {
			throw new Error('The uuid of the device is not available');
		}

		if (!is_online) {
			throw new Error(`The device is offline: ${uuid}`);
		}

		if (!os_version) {
			throw new Error(
				`The current os version of the device is not available: ${uuid}`,
			);
		}

		if (!device_type) {
			throw new Error(
				`The device type of the device is not available: ${uuid}`,
			);
		}

		// error the property is missing
		if (os_variant === undefined) {
			throw new Error(`The os variant of the device is not available: ${uuid}`);
		}

		let currentOsVersion =
			getDeviceOsSemverWithVariant({
				os_version,
				os_variant,
			}) || os_version;

		// if the os_version couldn't be parsed
		// rely on getHUPActionType to throw an error

		// this will throw an error if the action isn't available
		hupActionHelper.getHUPActionType(
			device_type,
			currentOsVersion,
			targetOsVersion,
		);
	};

	// TODO: This is a temporary solution for ESR, as the ESR-supported versions are not part of the SDK yet.
	// 	It should be removed once the getSupportedVersions is updated to support ESR as well.
	exports._startOsUpdate = (uuid, targetOsVersion, skipCheck, callback) =>
		Promise.try(function() {
			if (!targetOsVersion) {
				throw new errors.BalenaInvalidParameterError(
					'targetOsVersion',
					targetOsVersion,
				);
			}

			return exports.get(uuid, {
				$select: ['device_type', 'is_online', 'os_version', 'os_variant'],
			});
		})
			.then(function(device) {
				device.uuid = uuid;
				// this will throw an error if the action isn't available
				exports._checkOsUpdateTarget(device, targetOsVersion);
				if (skipCheck) {
					return;
				}

				return osModel()
					.getSupportedVersions(device.device_type)
					.then(function({ versions: allVersions }) {
						if (
							!allVersions.some(v => bSemver.compare(v, targetOsVersion) === 0)
						) {
							throw new errors.BalenaInvalidParameterError(
								'targetOsVersion',
								targetOsVersion,
							);
						}
					});
			})
			.then(function() {
				return getOsUpdateHelper();
			})
			.then(osUpdateHelper =>
				osUpdateHelper.startOsUpdate(uuid, targetOsVersion),
			)
			.asCallback(callback);
	/**
	 * @summary Start an OS update on a device
	 * @name startOsUpdate
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String} uuid - full device uuid
	 * @param {String} targetOsVersion - semver-compatible version for the target device
	 * Unsupported (unpublished) version will result in rejection.
	 * The version **must** be the exact version number, a "prod" variant and greater than the one running on the device.
	 * To resolve the semver-compatible range use `balena.model.os.getMaxSatisfyingVersion`.
	 * @fulfil {Object} - action response
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.startOsUpdate('7cf02a687b74206f92cb455969cf8e98', '2.29.2+rev1.prod').then(function(status) {
	 * 	console.log(result.status);
	 * });
	 *
	 * @example
	 * balena.models.device.startOsUpdate('7cf02a687b74206f92cb455969cf8e98', '2.29.2+rev1.prod', function(error, status) {
	 * 	if (error) throw error;
	 * 	console.log(result.status);
	 * });
	 */
	exports.startOsUpdate = (uuid, targetOsVersion, callback) =>
		Promise.try(function() {
			if (!targetOsVersion) {
				throw new errors.BalenaInvalidParameterError(
					'targetOsVersion',
					targetOsVersion,
				);
			}

			return exports.get(uuid, {
				$select: ['device_type', 'is_online', 'os_version', 'os_variant'],
			});
		})
			.then(function(device) {
				device.uuid = uuid;
				// this will throw an error if the action isn't available
				exports._checkOsUpdateTarget(device, targetOsVersion);

				return osModel().getSupportedVersions(device.device_type);
			})
			.then(function({ versions: allVersions }) {
				if (!allVersions.some(v => bSemver.compare(v, targetOsVersion) === 0)) {
					throw new errors.BalenaInvalidParameterError(
						'targetOsVersion',
						targetOsVersion,
					);
				}

				return getOsUpdateHelper();
			})
			.then(osUpdateHelper =>
				osUpdateHelper.startOsUpdate(uuid, targetOsVersion),
			)
			.asCallback(callback);

	/**
	 * @summary Get the OS update status of a device
	 * @name getOsUpdateStatus
	 * @public
	 * @function
	 * @memberof balena.models.device
	 *
	 * @param {String} uuid - full device uuid
	 * @fulfil {Object} - action response
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.device.getOsUpdateStatus('7cf02a687b74206f92cb455969cf8e98').then(function(status) {
	 * 	console.log(result.status);
	 * });
	 *
	 * @example
	 * balena.models.device.getOsUpdateStatus('7cf02a687b74206f92cb455969cf8e98', function(error, status) {
	 * 	if (error) throw error;
	 * 	console.log(result.status);
	 * });
	 */
	exports.getOsUpdateStatus = (uuid, callback) =>
		getOsUpdateHelper()
			.then(osUpdateHelper => osUpdateHelper.getOsUpdateStatus(uuid))
			.catch(function(err) {
				if (err.statusCode !== 400) {
					throw err;
				}

				// as an attempt to reduce the requests for this method
				// check whether the device exists only when the request rejects
				// so that it's rejected with the appropriate BalenaDeviceNotFound error
				return (
					exports
						.get(uuid, { $select: 'id' })
						// if the device exists, then re-throw the original error
						.throw(err)
				);
			})
			.asCallback(callback);

	/**
	 * @namespace balena.models.device.tags
	 * @memberof balena.models.device
	 */
	exports.tags = {
		/**
		 * @summary Get all device tags for an application
		 * @name getAllByApplication
		 * @public
		 * @function
		 * @memberof balena.models.device.tags
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - device tags
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.tags.getAllByApplication('MyApp').then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.device.tags.getAllByApplication(999999).then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.device.tags.getAllByApplication('MyApp', function(error, tags) {
		 * 	if (error) throw error;
		 * 	console.log(tags)
		 * });
		 */
		getAllByApplication(nameOrSlugOrId, options, callback) {
			if (options == null) {
				options = {};
			}
			return applicationModel()
				.get(nameOrSlugOrId, { $select: 'id' })
				.get('id')
				.then(id =>
					tagsModel.getAll(
						mergePineOptions(
							{
								$filter: {
									device: {
										$any: {
											$alias: 'd',
											$expr: { d: { belongs_to__application: id } },
										},
									},
								},
							},
							options,
						),
					),
				)
				.asCallback(callback);
		},

		/**
		 * @summary Get all device tags for a device
		 * @name getAllByDevice
		 * @public
		 * @function
		 * @memberof balena.models.device.tags
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - device tags
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.tags.getAllByDevice('7cf02a6').then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.device.tags.getAllByDevice(123).then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.device.tags.getAllByDevice('7cf02a6', function(error, tags) {
		 * 	if (error) throw error;
		 * 	console.log(tags)
		 * });
		 */
		getAllByDevice: tagsModel.getAllByParent,

		/**
		 * @summary Get all device tags
		 * @name getAll
		 * @public
		 * @function
		 * @memberof balena.models.device.tags
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - device tags
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.tags.getAll().then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.device.tags.getAll(function(error, tags) {
		 * 	if (error) throw error;
		 * 	console.log(tags)
		 * });
		 */
		getAll: tagsModel.getAll,

		/**
		 * @summary Set a device tag
		 * @name set
		 * @public
		 * @function
		 * @memberof balena.models.device.tags
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {String} tagKey - tag key
		 * @param {String|undefined} value - tag value
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.tags.set('7cf02a6', 'EDITOR', 'vim');
		 *
		 * @example
		 * balena.models.device.tags.set(123, 'EDITOR', 'vim');
		 *
		 * @example
		 * balena.models.device.tags.set('7cf02a6', 'EDITOR', 'vim', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		set: tagsModel.set,

		/**
		 * @summary Remove a device tag
		 * @name remove
		 * @public
		 * @function
		 * @memberof balena.models.device.tags
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {String} tagKey - tag key
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.tags.remove('7cf02a6', 'EDITOR');
		 *
		 * @example
		 * balena.models.device.tags.remove('7cf02a6', 'EDITOR', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		remove: tagsModel.remove,
	};

	/**
	 * @namespace balena.models.device.configVar
	 * @memberof balena.models.device
	 */
	exports.configVar = {
		/**
		 * @summary Get all config variables for a device
		 * @name getAllByDevice
		 * @public
		 * @function
		 * @memberof balena.models.device.configVar
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - device config variables
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.configVar.getAllByDevice('7cf02a6').then(function(vars) {
		 * 	console.log(vars);
		 * });
		 *
		 * @example
		 * balena.models.device.configVar.getAllByDevice(999999).then(function(vars) {
		 * 	console.log(vars);
		 * });
		 *
		 * @example
		 * balena.models.device.configVar.getAllByDevice('7cf02a6', function(error, vars) {
		 * 	if (error) throw error;
		 * 	console.log(vars)
		 * });
		 */
		getAllByDevice: configVarModel.getAllByParent,

		/**
		 * @summary Get all device config variables by application
		 * @name getAllByApplication
		 * @public
		 * @function
		 * @memberof balena.models.device.configVar
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - device config variables
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.configVar.getAllByApplication('MyApp').then(function(vars) {
		 * 	console.log(vars);
		 * });
		 *
		 * @example
		 * balena.models.device.configVar.getAllByApplication(999999).then(function(vars) {
		 * 	console.log(vars);
		 * });
		 *
		 * @example
		 * balena.models.device.configVar.getAllByApplication('MyApp', function(error, vars) {
		 * 	if (error) throw error;
		 * 	console.log(vars)
		 * });
		 */
		getAllByApplication(nameOrSlugOrId, options, callback) {
			if (options == null) {
				options = {};
			}
			callback = findCallback(arguments);

			return applicationModel()
				.get(nameOrSlugOrId, { $select: 'id' })
				.get('id')
				.then(id =>
					configVarModel.getAll(
						mergePineOptions(
							{
								$filter: {
									device: {
										$any: {
											$alias: 'd',
											$expr: {
												d: {
													belongs_to__application: id,
												},
											},
										},
									},
								},
								$orderby: 'name asc',
							},
							options,
						),
					),
				)
				.asCallback(callback);
		},

		/**
		 * @summary Get the value of a specific config variable
		 * @name get
		 * @public
		 * @function
		 * @memberof balena.models.device.configVar
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {String} key - config variable name
		 * @fulfil {String|undefined} - the config variable value (or undefined)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.configVar.get('7cf02a6', 'BALENA_VAR').then(function(value) {
		 * 	console.log(value);
		 * });
		 *
		 * @example
		 * balena.models.device.configVar.get(999999, 'BALENA_VAR').then(function(value) {
		 * 	console.log(value);
		 * });
		 *
		 * @example
		 * balena.models.device.configVar.get('7cf02a6', 'BALENA_VAR', function(error, value) {
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
		 * @memberof balena.models.device.configVar
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {String} key - config variable name
		 * @param {String} value - config variable value
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.configVar.set('7cf02a6', 'BALENA_VAR', 'newvalue').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.configVar.set(999999, 'BALENA_VAR', 'newvalue').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.configVar.set('7cf02a6', 'BALENA_VAR', 'newvalue', function(error) {
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
		 * @memberof balena.models.device.configVar
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {String} key - config variable name
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.configVar.remove('7cf02a6', 'BALENA_VAR').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.configVar.remove(999999, 'BALENA_VAR').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.configVar.remove('7cf02a6', 'BALENA_VAR', function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		remove: configVarModel.remove,
	};

	/**
	 * @namespace balena.models.device.envVar
	 * @memberof balena.models.device
	 */
	exports.envVar = {
		/**
		 * @summary Get all environment variables for a device
		 * @name getAllByDevice
		 * @public
		 * @function
		 * @memberof balena.models.device.envVar
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - device environment variables
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.envVar.getAllByDevice('7cf02a6').then(function(vars) {
		 * 	console.log(vars);
		 * });
		 *
		 * @example
		 * balena.models.device.envVar.getAllByDevice(999999).then(function(vars) {
		 * 	console.log(vars);
		 * });
		 *
		 * @example
		 * balena.models.device.envVar.getAllByDevice('7cf02a6', function(error, vars) {
		 * 	if (error) throw error;
		 * 	console.log(vars)
		 * });
		 */
		getAllByDevice: envVarModel.getAllByParent,

		/**
		 * @summary Get all device environment variables by application
		 * @name getAllByApplication
		 * @public
		 * @function
		 * @memberof balena.models.device.envVar
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - device environment variables
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.envVar.getAllByApplication('MyApp').then(function(vars) {
		 * 	console.log(vars);
		 * });
		 *
		 * @example
		 * balena.models.device.envVar.getAllByApplication(999999).then(function(vars) {
		 * 	console.log(vars);
		 * });
		 *
		 * @example
		 * balena.models.device.envVar.getAllByApplication('MyApp', function(error, vars) {
		 * 	if (error) throw error;
		 * 	console.log(vars)
		 * });
		 */
		getAllByApplication(nameOrSlugOrId, options, callback) {
			if (options == null) {
				options = {};
			}
			callback = findCallback(arguments);

			return applicationModel()
				.get(nameOrSlugOrId, { $select: 'id' })
				.get('id')
				.then(id =>
					envVarModel.getAll(
						mergePineOptions(
							{
								$filter: {
									device: {
										$any: {
											$alias: 'd',
											$expr: {
												d: {
													belongs_to__application: id,
												},
											},
										},
									},
								},
								$orderby: 'name asc',
							},
							options,
						),
					),
				)
				.asCallback(callback);
		},

		/**
		 * @summary Get the value of a specific environment variable
		 * @name get
		 * @public
		 * @function
		 * @memberof balena.models.device.envVar
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {String} key - environment variable name
		 * @fulfil {String|undefined} - the environment variable value (or undefined)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.envVar.get('7cf02a6', 'VAR').then(function(value) {
		 * 	console.log(value);
		 * });
		 *
		 * @example
		 * balena.models.device.envVar.get(999999, 'VAR').then(function(value) {
		 * 	console.log(value);
		 * });
		 *
		 * @example
		 * balena.models.device.envVar.get('7cf02a6', 'VAR', function(error, value) {
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
		 * @memberof balena.models.device.envVar
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {String} key - environment variable name
		 * @param {String} value - environment variable value
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.envVar.set('7cf02a6', 'VAR', 'newvalue').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.envVar.set(999999, 'VAR', 'newvalue').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.envVar.set('7cf02a6', 'VAR', 'newvalue', function(error) {
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
		 * @memberof balena.models.device.envVar
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {String} key - environment variable name
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.envVar.remove('7cf02a6', 'VAR').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.envVar.remove(999999, 'VAR').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.envVar.remove('7cf02a6', 'VAR', function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		remove: envVarModel.remove,
	};

	/**
	 * @namespace balena.models.device.serviceVar
	 * @memberof balena.models.device
	 */
	exports.serviceVar = {
		/**
		 * @summary Get all service variable overrides for a device
		 * @name getAllByDevice
		 * @public
		 * @function
		 * @memberof balena.models.device.serviceVar
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - service variables
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.serviceVar.getAllByDevice('7cf02a6').then(function(vars) {
		 * 	console.log(vars);
		 * });
		 *
		 * @example
		 * balena.models.device.serviceVar.getAllByDevice(999999).then(function(vars) {
		 * 	console.log(vars);
		 * });
		 *
		 * @example
		 * balena.models.device.serviceVar.getAllByDevice('7cf02a6', function(error, vars) {
		 * 	if (error) throw error;
		 * 	console.log(vars)
		 * });
		 */
		getAllByDevice(uuidOrId, options, callback) {
			if (options == null) {
				options = {};
			}
			callback = findCallback(arguments);

			return exports
				.get(uuidOrId, { $select: 'id' })
				.get('id')
				.then(deviceId =>
					pine.get({
						resource: 'device_service_environment_variable',
						options: mergePineOptions(
							{
								$filter: {
									service_install: {
										$any: {
											$alias: 'si',
											$expr: { si: { device: deviceId } },
										},
									},
								},
							},
							options,
						),
					}),
				)
				.asCallback(callback);
		},

		/**
		 * @summary Get all device service variable overrides by application
		 * @name getAllByApplication
		 * @public
		 * @function
		 * @memberof balena.models.device.serviceVar
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - service variables
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.serviceVar.getAllByApplication('MyApp').then(function(vars) {
		 * 	console.log(vars);
		 * });
		 *
		 * @example
		 * balena.models.device.serviceVar.getAllByApplication(999999).then(function(vars) {
		 * 	console.log(vars);
		 * });
		 *
		 * @example
		 * balena.models.device.serviceVar.getAllByApplication('MyApp', function(error, vars) {
		 * 	if (error) throw error;
		 * 	console.log(vars)
		 * });
		 */
		getAllByApplication(nameOrSlugOrId, options, callback) {
			if (options == null) {
				options = {};
			}
			callback = findCallback(arguments);

			return applicationModel()
				.get(nameOrSlugOrId, { $select: 'id' })
				.get('id')
				.then(id =>
					pine.get({
						resource: 'device_service_environment_variable',
						options: mergePineOptions(
							{
								$filter: {
									service_install: {
										$any: {
											$alias: 'si',
											$expr: {
												si: {
													device: {
														$any: {
															$alias: 'd',
															$expr: {
																d: {
																	belongs_to__application: id,
																},
															},
														},
													},
												},
											},
										},
									},
								},
								$orderby: 'name asc',
							},
							options,
						),
					}),
				)
				.asCallback(callback);
		},

		/**
		 * @summary Get the overriden value of a service variable on a device
		 * @name get
		 * @public
		 * @function
		 * @memberof balena.models.device.serviceVar
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Number} id - service id
		 * @param {String} key - variable name
		 * @fulfil {String|undefined} - the variable value (or undefined)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.serviceVar.get('7cf02a6', 123, 'VAR').then(function(value) {
		 * 	console.log(value);
		 * });
		 *
		 * @example
		 * balena.models.device.serviceVar.get(999999, 123, 'VAR').then(function(value) {
		 * 	console.log(value);
		 * });
		 *
		 * @example
		 * balena.models.device.serviceVar.get('7cf02a6', 123, 'VAR', function(error, value) {
		 * 	if (error) throw error;
		 * 	console.log(value)
		 * });
		 */
		get(uuidOrId, serviceId, key, callback) {
			callback = findCallback(arguments);

			return exports
				.get(uuidOrId, { $select: 'id' })
				.get('id')
				.then(deviceId =>
					pine.get({
						resource: 'device_service_environment_variable',
						options: {
							$filter: {
								service_install: {
									$any: {
										$alias: 'si',
										$expr: {
											si: {
												device: deviceId,
												service: serviceId,
											},
										},
									},
								},
								name: key,
							},
						},
					}),
				)
				.get(0)
				.then(variable => variable?.value)
				.asCallback(callback);
		},

		/**
		 * @summary Set the overriden value of a service variable on a device
		 * @name set
		 * @public
		 * @function
		 * @memberof balena.models.device.serviceVar
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Number} id - service id
		 * @param {String} key - variable name
		 * @param {String} value - variable value
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.serviceVar.set('7cf02a6', 123, 'VAR', 'override').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.serviceVar.set(999999, 123, 'VAR', 'override').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.serviceVar.set('7cf02a6', 123, 'VAR', 'override', function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		set(uuidOrId, serviceId, key, value, callback) {
			return Promise.try(function() {
				value = String(value);

				const deviceFilter = isId(uuidOrId)
					? uuidOrId
					: {
							$any: {
								$alias: 'd',
								$expr: {
									d: {
										uuid: uuidOrId,
									},
								},
							},
					  };

				return pine
					.get({
						resource: 'service_install',
						options: {
							$filter: {
								device: deviceFilter,
								service: serviceId,
							},
						},
					})
					.tap(function(serviceInstalls) {
						if (serviceInstalls.length === 0) {
							throw new errors.BalenaServiceNotFound(serviceId);
						}
						if (serviceInstalls.length > 1) {
							throw new errors.BalenaAmbiguousDevice(uuidOrId);
						}
					})
					.get(0)
					.get('id');
			})
				.then(serviceInstallId =>
					pine.upsert(
						{
							resource: 'device_service_environment_variable',
							id: {
								service_install: serviceInstallId,
								name: key,
							},
							body: {
								value,
							},
						},
						['service_install', 'name'],
					),
				)
				.asCallback(callback);
		},

		/**
		 * @summary Clear the overridden value of a service variable on a device
		 * @name remove
		 * @public
		 * @function
		 * @memberof balena.models.device.serviceVar
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Number} id - service id
		 * @param {String} key - variable name
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.serviceVar.remove('7cf02a6', 123, 'VAR').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.serviceVar.remove(999999, 123, 'VAR').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.serviceVar.remove('7cf02a6', 123, 'VAR', function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		remove(uuidOrId, serviceId, key, callback) {
			return exports
				.get(uuidOrId, { $select: 'id' })
				.get('id')
				.then(deviceId =>
					pine.delete({
						resource: 'device_service_environment_variable',
						options: {
							$filter: {
								service_install: {
									$any: {
										$alias: 'si',
										$expr: {
											si: {
												device: deviceId,
												service: serviceId,
											},
										},
									},
								},
								name: key,
							},
						},
					}),
				)
				.asCallback(callback);
		},
	};

	return exports;
};

export { getDeviceModel as default };