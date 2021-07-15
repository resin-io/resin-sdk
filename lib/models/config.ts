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

import type { InjectedDependenciesParam, InjectedOptionsParam } from '..';
import type * as DeviceTypeJson from '../types/device-type-json';

export type { DeviceTypeJson };

export interface Config {
	deployment: string | null;
	deviceUrlsBase: string;
	adminUrl: string;
	apiUrl: string;
	actionsUrl: string;
	gitServerUrl: string;
	pubnub: {
		subscribe_key: string;
		publish_key: string;
	};
	ga?: GaConfig;
	mixpanelToken?: string;
	intercomAppId?: string;
	recurlyPublicKey?: string;
	/** @deprecated */
	deviceTypes: DeviceTypeJson.DeviceType[];
	DEVICE_ONLINE_ICON: string;
	DEVICE_OFFLINE_ICON: string;
	signupCodeRequired: boolean;
	supportedSocialProviders: string[];
}

export interface GaConfig {
	site: string;
	id: string;
}

import once = require('lodash/once');
import union = require('lodash/union');

const getConfigModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { request } = deps;
	const { apiUrl } = opts;

	const deviceModel = once(() =>
		(require('./device') as typeof import('./device')).default(deps, opts),
	);

	const normalizeDeviceTypes = (
		deviceTypes: DeviceTypeJson.DeviceType[], // Patch device types to be marked as ALPHA and BETA instead
	): DeviceTypeJson.DeviceType[] =>
		// of PREVIEW and EXPERIMENTAL, respectively.
		// This logic is literally copy and pasted from balena UI, but
		// there are plans to move this to `resin-device-types` so it
		// should be a matter of time for this to be removed.
		deviceTypes.map(function (deviceType) {
			if (deviceType.state === 'DISCONTINUED') {
				deviceType.name = deviceType.name.replace(
					/(\(PREVIEW|EXPERIMENTAL\))/,
					'(DISCONTINUED)',
				);
			}
			if (deviceType.state === 'PREVIEW') {
				deviceType.state = 'ALPHA';
				deviceType.name = deviceType.name.replace('(PREVIEW)', '(ALPHA)');
			}
			if (deviceType.state === 'EXPERIMENTAL') {
				deviceType.state = 'NEW';
				deviceType.name = deviceType.name.replace('(EXPERIMENTAL)', '(NEW)');
			}
			return deviceType;
		});

	const exports = {
		/**
		 * @summary Get all configuration
		 * @name getAll
		 * @public
		 * @function
		 * @memberof balena.models.config
		 *
		 * @fulfil {Object} - configuration
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.config.getAll().then(function(config) {
		 * 	console.log(config);
		 * });
		 *
		 * @example
		 * balena.models.config.getAll(function(error, config) {
		 * 	if (error) throw error;
		 * 	console.log(config);
		 * });
		 */
		getAll: async (): Promise<Config> => {
			const { body } = await request.send({
				method: 'GET',
				url: '/config',
				baseUrl: apiUrl,
				sendToken: false,
			});
			body.deviceTypes = normalizeDeviceTypes(body.deviceTypes);
			return body;
		},

		/**
		 * @summary Get device types
		 * @name getDeviceTypes
		 * @public
		 * @function
		 * @memberof balena.models.config
		 *
		 * @deprecated use balena.models.deviceType.getAll
		 * @fulfil {Object[]} - device types
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.config.getDeviceTypes().then(function(deviceTypes) {
		 * 	console.log(deviceTypes);
		 * });
		 *
		 * @example
		 * balena.models.config.getDeviceTypes(function(error, deviceTypes) {
		 * 	if (error) throw error;
		 * 	console.log(deviceTypes);
		 * })
		 */
		getDeviceTypes: async (): Promise<DeviceTypeJson.DeviceType[]> => {
			const { body: deviceTypes } = await request.send({
				method: 'GET',
				url: '/device-types/v1',
				baseUrl: apiUrl,
			});
			if (deviceTypes == null) {
				throw new Error('No device types');
			}
			return normalizeDeviceTypes(deviceTypes);
		},

		/**
		 * @summary Get configuration/initialization options for a device type
		 * @name getDeviceOptions
		 * @public
		 * @function
		 * @memberof balena.models.config
		 *
		 * @param {String} deviceType - device type slug
		 * @fulfil {Object[]} - configuration options
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.config.getDeviceOptions('raspberry-pi').then(function(options) {
		 * 	console.log(options);
		 * });
		 *
		 * @example
		 * balena.models.config.getDeviceOptions('raspberry-pi', function(error, options) {
		 * 	if (error) throw error;
		 * 	console.log(options);
		 * });
		 */
		getDeviceOptions: async (
			deviceType: string,
		): Promise<
			Array<
				| DeviceTypeJson.DeviceTypeOptions
				| DeviceTypeJson.DeviceInitializationOptions
			>
		> => {
			const manifest = await deviceModel().getManifestBySlug(deviceType);
			return union<
				| DeviceTypeJson.DeviceTypeOptions
				| DeviceTypeJson.DeviceInitializationOptions
			>(manifest.options, manifest.initialization?.options);
		},
	};

	return exports;
};

export default getConfigModel;
