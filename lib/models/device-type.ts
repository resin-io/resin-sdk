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

import type { InjectedDependenciesParam, PineOptions } from '..';
import { DeviceType } from '../types/models';
import { Contract } from '../types/contract';
import { mergePineOptions } from '../util';
import * as errors from 'balena-errors';
import * as Handlebars from 'handlebars';
import cloneDeep = require('lodash/cloneDeep');

// Hardcoded host OS contract, this should be moved. Here for initial implementatin and testing purposes
const baseHostOS: Contract = {
	slug: 'balenaOS',
	type: 'temp',
	name: 'BalenaOS',
	partials: {
		internalFlash: [
			`{{#each deviceType.partials.connectDevice}}{{{this}}} {{/each}}`,
			`Write the {{name}} file you downloaded to the {{deviceType.name}}. We recommend using <a href="http://www.etcher.io/">Etcher</a>.`,
			`Wait for writing of {{name}} to complete.`,
			`{{#each deviceType.partials.disconnectDevice}}{{{this}}} {{/each}}`,
			`{{{deviceType.partials.bootDevice}}} to boot the device.`,
		],
		externalFlash: [
			`Insert the {{deviceType.data.media.installation}} to the host machine.`,
			`Write the {{name}} file you downloaded to the {{deviceType.data.media.installation}}. We recommend using <a href="http://www.etcher.io/">Etcher</a>.`,
			`Wait for writing of {{name}} to complete.`,
			`Remove the {{deviceType.data.media.installation}} from the host machine.`,
			`Insert the freshly flashed {{deviceType.data.media.installation}} into the {{deviceType.name}}.`,
			`<strong role="alert">Warning!</strong> This will also completely erase internal storage medium, so please make a backup first.`,
			`{{#each deviceType.partials.bootDeviceExternal}}{{{this}}} {{/each}}`,
			`Wait for the {{deviceType.name}} to finish flashing and shutdown. {{#if deviceType.partials.flashIndicator}}Please wait until {{deviceType.partials.flashIndicator}}.{{/if}}`,
			`Remove the {{deviceType.data.media.installation}} from the {{deviceType.name}}.`,
			`{{#each deviceType.partials.bootDeviceInternal}}{{{this}}} {{/each}}`,
			`{{{deviceType.partials.bootDevice}}} to boot the device.`,
		],
		externalBoot: [
			`Insert the {{deviceType.data.media.installation}} to the host machine.`,
			`Write the {{name}} file you downloaded to the {{deviceType.data.media.installation}}. We recommend using <a href="http://www.etcher.io/">Etcher</a>.`,
			`Wait for writing of {{name}} to complete.`,
			`Remove the {{deviceType.data.media.installation}} from the host machine.`,
			`Insert the freshly flashed {{deviceType.data.media.installation}} into the {{deviceType.name}}.`,
			`{{{deviceType.partials.bootDevice}}} to boot the device.`,
		],
		custom: [
			`{{#each deviceType.partials.instructions}}
				{{{this}}}
			{{/each}}`,
			`{{{deviceType.partials.bootDevice}}} to boot the device.`,
		],
	},
};

const interpolatedPartials = (contract: Contract, initial: any = {}) => {
	const fullInitial = { ...contract, ...initial };
	if (contract.partials) {
		const partials = contract.partials;
		return Object.keys(partials).reduce(
			(interpolated: any, partialKey) => {
				interpolated.partials[partialKey] = partials[partialKey].map(
					(partial: string) => Handlebars.compile(partial)(interpolated),
				);
				return interpolated;
			},
			{ ...fullInitial },
		);
	} else {
		return fullInitial;
	}
};

const getDeviceTypeModel = function (deps: InjectedDependenciesParam) {
	const { pine } = deps;

	const exports = {
		/**
		 * @summary Get a single deviceType
		 * @name get
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {String|Number} idOrSlug - device type slug (string) or id
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - device types
		 * @returns {Promise}
		 *
		 * @description
		 * This method returns a single device type.
		 *
		 * @example
		 * balena.models.deviceType.get('raspberry-pi').then(function(deviceType) {
		 * 	console.log(deviceType);
		 * });
		 *
		 * @example
		 * balena.models.deviceType.get('raspberry-pi', function(error, deviceType) {
		 * 	if (error) throw error;
		 * 	console.log(deviceType);
		 * });
		 */
		async get(
			idOrSlug: number | string,
			options?: PineOptions<DeviceType>,
		): Promise<DeviceType> {
			if (options == null) {
				options = {};
			}

			if (idOrSlug == null) {
				throw new errors.BalenaInvalidDeviceType(idOrSlug);
			}

			const deviceType = await pine.get({
				resource: 'device_type',
				id: typeof idOrSlug === 'string' ? { slug: idOrSlug } : idOrSlug,
				options,
			});

			if (deviceType == null) {
				throw new errors.BalenaInvalidDeviceType(idOrSlug.toString());
			}

			return deviceType;
		},
		/**
		 * @summary Get all deviceTypes
		 * @name getAll
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - device types
		 * @returns {Promise}
		 *
		 * @description
		 * This method returns all device types.
		 *
		 * @example
		 * balena.models.deviceType.getAll().then(function(deviceTypes) {
		 * 	console.log(deviceTypes);
		 * });
		 *
		 * @example
		 * balena.models.deviceType.getAll({ $select: ['name', 'slug'] }).then(function(deviceTypes) {
		 * 	console.log(deviceTypes);
		 * })
		 *
		 * @example
		 * balena.models.deviceType.getAll(function(error, deviceTypes) {
		 * 	if (error) throw error;
		 * 	console.log(deviceTypes);
		 * });
		 */
		async getAll(options?: PineOptions<DeviceType>): Promise<DeviceType[]> {
			if (options == null) {
				options = {};
			}

			const deviceTypes = await pine.get({
				resource: 'device_type',
				options: mergePineOptions({ $orderby: 'name asc' }, options),
			});

			return deviceTypes;
		},

		/**
		 * @summary Get all supported deviceTypes
		 * @name getAllSupported
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - device types
		 * @returns {Promise}
		 *
		 * @description
		 * This method returns all supported device types.
		 *
		 * @example
		 * balena.models.deviceType.getAllSupported().then(function(deviceTypes) {
		 * 	console.log(deviceTypes);
		 * });
		 *
		 * @example
		 * balena.models.deviceType.getAllSupported({ $select: ['name', 'slug'] }).then(function(deviceTypes) {
		 * 	console.log(deviceTypes);
		 * })
		 *
		 * @example
		 * balena.models.deviceType.getAllSupported(function(error, deviceTypes) {
		 * 	if (error) throw error;
		 * 	console.log(deviceTypes);
		 * });
		 */
		async getAllSupported(
			options?: PineOptions<DeviceType>,
		): Promise<DeviceType[]> {
			if (options == null) {
				options = {};
			}

			const deviceTypes = await exports.getAll(
				mergePineOptions(
					{
						$filter: {
							is_default_for__application: {
								$any: {
									$alias: 'idfa',
									$expr: {
										idfa: {
											is_host: true,
											is_archived: false,
										},
									},
								},
							},
						},
					},
					options,
				),
			);

			return deviceTypes;
		},

		/**
		 * @summary Get a deviceType by slug or name
		 * @name getBySlugOrName
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {String} slugOrName - deviceType slug
		 * @fulfil {Object} - device manifest
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.deviceType.getBySlugOrName('raspberry-pi').then(function(manifest) {
		 * 	console.log(manifest);
		 * });
		 *
		 * @example
		 * balena.models.deviceType.getBySlugOrName('raspberry-pi', function(error, manifest) {
		 * 	if (error) throw error;
		 * 	console.log(manifest);
		 * });
		 */
		getBySlugOrName: async (
			slugOrName: string,
			options?: PineOptions<DeviceType>,
		): Promise<DeviceType> => {
			if (options == null) {
				options = {};
			}
			const [deviceType] = await exports.getAll(
				mergePineOptions(
					{
						$top: 1,
						$filter: { $or: { name: slugOrName, slug: slugOrName } },
					},
					options,
				),
			);
			if (deviceType == null) {
				throw new errors.BalenaInvalidDeviceType(slugOrName);
			}
			return deviceType;
		},

		/**
		 * @summary Get display name for a device
		 * @name getName
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {String} deviceTypeSlug - device type slug
		 * @fulfil {String} - device display name
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.deviceType.getName('raspberry-pi').then(function(deviceTypeName) {
		 * 	console.log(deviceTypeName);
		 * 	// Raspberry Pi
		 * });
		 *
		 * @example
		 * balena.models.deviceType.getName('raspberry-pi', function(error, deviceTypeName) {
		 * 	if (error) throw error;
		 * 	console.log(deviceTypeName);
		 * 	// Raspberry Pi
		 * });
		 */
		getName: async (deviceTypeSlug: string): Promise<string> => {
			return (
				await exports.getBySlugOrName(deviceTypeSlug, { $select: 'name' })
			).name;
		},

		/**
		 * @summary Get a contract with resolved partial templates
		 * @name getInterpolatedPartials
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {String} deviceTypeSlug - device type slug
		 * @param {any} initial - Other contract values necessary for interpreting contracts
		 * @fulfil {Contract} - device type contract with resolved partials
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.deviceType.getInterpolatedPartials('raspberry-pi').then(function(contract) {
		 *  for (const partial in contract.partials) {
		 *  	console.log(`${partial}: ${contract.partials[partial]}`);
		 *  }
		 * 	// bootDevice: ["Connect power to the Raspberry Pi (v1 / Zero / Zero W)"]
		 * });
		 */
		getInterpolatedPartials: async (
			deviceTypeSlug: string,
			initial: any = {},
		): Promise<Contract> => {
			const contract = (
				await exports.getBySlugOrName(deviceTypeSlug, { $select: 'contract' })
			).contract;
			if (!contract) {
				throw new Error('Slug does not contain contract');
			}
			return interpolatedPartials(contract, initial);
		},

		/**
		 * @summary Get instructions for installing a host OS on a given device type
		 * @name getInstructions
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {String} deviceTypeSlug - device type slug
		 * @fulfil {String[]} - step by step instructions for installing the host OS to the device
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.deviceType.getInstructions('raspberry-pi').then(function(instructions) {
		 *  for (let instruction of instructions.values()) {
		 * 	 console.log(instruction);
		 *  }
		 *  // Insert the sdcard to the host machine.
		 *  // Write the BalenaOS file you downloaded to the sdcard. We recommend using <a href="http://www.etcher.io/">Etcher</a>.
		 *  // Wait for writing of BalenaOS to complete.
		 *  // Remove the sdcard from the host machine.
		 *  // Insert the freshly flashed sdcard into the Raspberry Pi (v1 / Zero / Zero W).
		 *  // Connect power to the Raspberry Pi (v1 / Zero / Zero W) to boot the device.
		 * });
		 * @example
		 * balena.models.deviceType.getInstructions('raspberry-pi', baseInstructions = {
		 *  `Use the form on the left to configure and download {{name}} for your new {{deviceType.name}}.
		 *  {{#each instructions}}
		 *   {{{this}}}
		 *  {{/each}}
		 *  Your device should appear in your application dashboard within a few minutes. Have fun!`
		 * }).then(function(instructions) {
		 *  for (let instruction of instructions.values()) {
		 * 	 console.log(instruction);
		 *  }
		 *  // Use the form on the left to configure and download BalenaOS for your new Raspberry Pi (v1 / Zero / Zero W).
		 *  // Insert the sdcard to the host machine.
		 *  // Write the BalenaOS file you downloaded to the sdcard. We recommend using <a href="http://www.etcher.io/">Etcher</a>.
		 *  // Wait for writing of BalenaOS to complete.
		 *  // Remove the sdcard from the host machine.
		 *  // Insert the freshly flashed sdcard into the Raspberry Pi (v1 / Zero / Zero W).
		 *  // Connect power to the Raspberry Pi (v1 / Zero / Zero W) to boot the device.
		 *  // Your device should appear in your application dashboard within a few minutes. Have fun!
		 * });
		 */
		getInstructions: async (
			deviceTypeSlug: string,
			baseInstructions?: string,
		): Promise<string[]> => {
			const contract = (
				await exports.getBySlugOrName(deviceTypeSlug, { $select: 'contract' })
			).contract;
			if (contract) {
				const installMethod = contract?.data?.installation?.method;
				if (!installMethod || !contract.partials) {
					throw new Error(
						`Install method or instruction partials not defined for ${deviceTypeSlug}`,
					);
				}
				const interpolatedDeviceType = interpolatedPartials(contract);
				const interpolatedHostOS = interpolatedPartials(cloneDeep(baseHostOS), {
					deviceType: interpolatedDeviceType,
				});

				if (baseInstructions) {
					return Handlebars.compile(baseInstructions)({
						...interpolatedHostOS,
						instructions: interpolatedHostOS.partials[installMethod],
					})
						.split('\n')
						.map((s) => s.trim())
						.filter((s) => s);
				} else {
					return interpolatedHostOS.partials[installMethod];
				}
			} else {
				return [];
			}
		},

		/**
		 * @summary Get device slug
		 * @name getSlugByName
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {String} deviceTypeName - device type name
		 * @fulfil {String} - device slug name
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.deviceType.getSlugByName('Raspberry Pi').then(function(deviceTypeSlug) {
		 * 	console.log(deviceTypeSlug);
		 * 	// raspberry-pi
		 * });
		 *
		 * @example
		 * balena.models.deviceType.getSlugByName('Raspberry Pi', function(error, deviceTypeSlug) {
		 * 	if (error) throw error;
		 * 	console.log(deviceTypeSlug);
		 * 	// raspberry-pi
		 * });
		 */
		getSlugByName: async (deviceTypeName: string): Promise<string> => {
			return (
				await exports.getBySlugOrName(deviceTypeName, { $select: 'slug' })
			).slug;
		},
	};

	return exports;
};

export { getDeviceTypeModel as default };
