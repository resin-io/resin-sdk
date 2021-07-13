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

import * as errors from 'balena-errors';
import once = require('lodash/once');
import type {
	PineOptions,
	InjectedDependenciesParam,
	InjectedOptionsParam,
} from '..';
import type { Service, ServiceEnvironmentVariable } from '../types/models';
import { mergePineOptions } from '../util';

const getServiceModel = (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) => {
	const { pine } = deps;
	const applicationModel = once(() =>
		(require('./application') as typeof import('./application')).default(
			deps,
			opts,
		),
	);

	const { addCallbackSupportToModule } =
		require('../util/callbacks') as typeof import('../util/callbacks');

	const { buildDependentResource } =
		require('../util/dependent-resource') as typeof import('../util/dependent-resource');

	const varModel = buildDependentResource<ServiceEnvironmentVariable>(
		{ pine },
		{
			resourceName: 'service_environment_variable',
			resourceKeyField: 'name',
			parentResourceName: 'service',
			getResourceId: async (id: number): Promise<number> =>
				(await get(id, { $select: 'id' })).id,
		},
	);

	// Not exported for now, but we could document & export it in the future
	// if there are external use cases for this.
	const get = async (id: number, options: PineOptions<Service> = {}) => {
		const service = await pine.get({
			resource: 'service',
			id,
			options,
		});
		if (service == null) {
			throw new errors.BalenaServiceNotFound(id);
		}
		return service;
	};

	const exports = {
		/**
		 * @summary Get all services from an application
		 * @name getAllByApplication
		 * @public
		 * @function
		 * @memberof balena.models.service
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - services
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.service.getAllByApplication('myorganization/myapp').then(function(services) {
		 * 	console.log(services);
		 * });
		 *
		 * @example
		 * balena.models.service.getAllByApplication(123).then(function(services) {
		 * 	console.log(services);
		 * });
		 *
		 * @example
		 * balena.models.service.getAllByApplication('myorganization/myapp', function(error, services) {
		 * 	if (error) throw error;
		 * 	console.log(services);
		 * });
		 */
		async getAllByApplication(
			slugOrId: string | number,
			options: PineOptions<Service> = {},
		): Promise<Service[]> {
			const { id } = await applicationModel().get(slugOrId, {
				$select: 'id',
			});
			return pine.get({
				resource: 'service',
				options: mergePineOptions({ $filter: { application: id } }, options),
			});
		},

		/**
		 * @namespace balena.models.service.var
		 * @memberof balena.models.service
		 */
		var: addCallbackSupportToModule({
			/**
			 * @summary Get all variables for a service
			 * @name getAllByService
			 * @public
			 * @function
			 * @memberof balena.models.service.var
			 *
			 * @param {Number} id - service id
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - service variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.service.var.getAllByService(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.service.var.getAllByService(999999, function(error, vars) {
			 * 	if (error) throw error;
			 * 	console.log(vars)
			 * });
			 */
			getAllByService: varModel.getAllByParent,

			/**
			 * @summary Get all service variables by application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.service.var
			 *
			 * @param {String|Number} slugOrId - application slug (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - service variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.service.var.getAllByApplication('myorganization/myapp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.service.var.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.service.var.getAllByApplication('myorganization/myapp', function(error, vars) {
			 * 	if (error) throw error;
			 * 	console.log(vars)
			 * });
			 */
			async getAllByApplication(
				slugOrId: string | number,
				options: PineOptions<ServiceEnvironmentVariable> = {},
			): Promise<ServiceEnvironmentVariable[]> {
				const { id } = await applicationModel().get(slugOrId, {
					$select: 'id',
				});
				return varModel.getAll(
					mergePineOptions(
						{
							$filter: {
								service: {
									$any: {
										$alias: 's',
										$expr: {
											s: {
												application: id,
											},
										},
									},
								},
							},
							$orderby: 'name asc',
						},
						options,
					),
				);
			},

			/**
			 * @summary Get the value of a specific service variable
			 * @name get
			 * @public
			 * @function
			 * @memberof balena.models.service.var
			 *
			 * @param {Number} id - service id
			 * @param {String} key - variable name
			 * @fulfil {String|undefined} - the variable value (or undefined)
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.service.var.get(999999, 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.service.var.get(999999, 'VAR', function(error, value) {
			 * 	if (error) throw error;
			 * 	console.log(value)
			 * });
			 */
			get: varModel.get,

			/**
			 * @summary Set the value of a specific service variable
			 * @name set
			 * @public
			 * @function
			 * @memberof balena.models.service.var
			 *
			 * @param {Number} id - service id
			 * @param {String} key - variable name
			 * @param {String} value - variable value
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.service.var.set(999999, 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.service.var.set(999999, 'VAR', 'newvalue', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			set: varModel.set,

			/**
			 * @summary Clear the value of a specific service variable
			 * @name remove
			 * @public
			 * @function
			 * @memberof balena.models.service.var
			 *
			 * @param {Number} id - service id
			 * @param {String} key - variable name
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.service.var.remove(999999, 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.service.var.remove(999999, 'VAR', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			remove: varModel.remove,
		}),
	};

	return exports;
};

export default getServiceModel;
