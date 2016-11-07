
/*
Copyright 2016 Resin.io

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

(function() {
  var CONTAINER_ACTION_ENDPOINT_TIMEOUT, MIN_SUPERVISOR_APPS_API, Promise, _, applicationModel, auth, configModel, crypto, deviceStatus, ensureSupervisorCompatibility, errors, pine, registerDevice, request, semver, settings;

  Promise = require('bluebird');

  crypto = require('crypto');

  _ = require('lodash');

  semver = require('semver');

  pine = require('resin-pine');

  errors = require('resin-errors');

  request = require('resin-request');

  settings = require('resin-settings-client');

  registerDevice = require('resin-register-device');

  deviceStatus = require('resin-device-status');

  configModel = require('./config');

  applicationModel = require('./application');

  auth = require('../auth');

  MIN_SUPERVISOR_APPS_API = '1.8.0-alpha.0';

  CONTAINER_ACTION_ENDPOINT_TIMEOUT = 50000;


  /**
   * @summary Ensure supervisor version compatibility using semver
   * @name ensureSupervisorCompatibility
   * @private
   * @function
   * @memberof resin.models.device
   *
   * @param {String} version - version under check
   * @param {String} minVersion - minimum accepted version
   * @fulfil {} - is compatible
   * @reject {Error} Will reject if the given version is < than the given minimum version
   * @returns {Promise}
   *
   * @example
   * resin.models.device.ensureSupervisorCompatibility(version, MIN_VERSION).then(function() {
   * 	console.log('Is compatible');
   * });
   *
   * @example
   * resin.models.device.ensureSupervisorCompatibility(version, MIN_VERSION, function(error) {
   * 	if (error) throw error;
   * 	console.log('Is compatible');
   * });
   */

  exports.ensureSupervisorCompatibility = ensureSupervisorCompatibility = Promise.method(function(version, minVersion) {
    if (!semver.valid(version)) {
      throw new Error("Invalid supervisor version: " + version);
    }
    if (semver.lt(version, minVersion)) {
      throw new Error("Incompatible supervisor version: " + version + " - must be >= " + minVersion);
    }
  });


  /**
   * @summary Get all devices
   * @name getAll
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @fulfil {Object[]} - devices
   * @returns {Promise}
   *
   * @example
   * resin.models.device.getAll().then(function(devices) {
   * 	console.log(devices);
   * });
   *
   * @example
   * resin.models.device.getAll(function(error, devices) {
   * 	if (error) throw error;
   * 	console.log(devices);
   * });
   */

  exports.getAll = function(callback) {
    return pine.get({
      resource: 'device',
      options: {
        expand: 'application',
        orderby: 'name asc'
      }
    }).map(function(device) {
      device.application_name = device.application[0].app_name;
      return device;
    }).nodeify(callback);
  };


  /**
   * @summary Get all devices by application
   * @name getAllByApplication
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} name - application name
   * @fulfil {Object[]} - devices
   * @returns {Promise}
   *
   * @example
   * resin.models.device.getAllByApplication('MyApp').then(function(devices) {
   * 	console.log(devices);
   * });
   *
   * @example
   * resin.models.device.getAllByApplication('MyApp', function(error, devices) {
   * 	if (error) throw error;
   * 	console.log(devices);
   * });
   */

  exports.getAllByApplication = function(name, callback) {
    return applicationModel.has(name).then(function(hasApplication) {
      if (!hasApplication) {
        throw new errors.ResinApplicationNotFound(name);
      }
      return pine.get({
        resource: 'device',
        options: {
          filter: {
            application: {
              $any: {
                $alias: 'a',
                $expr: {
                  a: {
                    app_name: name
                  }
                }
              }
            }
          },
          expand: 'application',
          orderby: 'name asc'
        }
      });
    }).map(function(device) {
      device.application_name = device.application[0].app_name;
      return device;
    }).nodeify(callback);
  };


  /**
   * @summary Get a single device
   * @name get
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @fulfil {Object} - device
   * @returns {Promise}
   *
   * @example
   * resin.models.device.get('7cf02a6').then(function(device) {
   * 	console.log(device);
   * })
   *
   * @example
   * resin.models.device.get('7cf02a6', function(error, device) {
   * 	if (error) throw error;
   * 	console.log(device);
   * });
   */

  exports.get = function(uuid, callback) {
    uuid = String(uuid);
    return pine.get({
      resource: 'device',
      options: {
        expand: 'application',
        filter: {
          $eq: [
            {
              $substring: [
                {
                  $: 'uuid'
                }, 0, uuid.length
              ]
            }, uuid
          ]
        }
      }
    }).tap(function(device) {
      if (_.isEmpty(device)) {
        throw new errors.ResinDeviceNotFound(uuid);
      }
      if (device.length > 1) {
        throw new errors.ResinAmbiguousDevice(uuid);
      }
    }).get(0).tap(function(device) {
      return device.application_name = device.application[0].app_name;
    }).nodeify(callback);
  };


  /**
   * @summary Get devices by name
   * @name getByName
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} name - device name
   * @fulfil {Object[]} - devices
   * @returns {Promise}
   *
   * @example
   * resin.models.device.getByName('MyDevice').then(function(devices) {
   * 	console.log(devices);
   * });
   *
   * @example
   * resin.models.device.getByName('MyDevice', function(error, devices) {
   * 	if (error) throw error;
   * 	console.log(devices);
   * });
   */

  exports.getByName = function(name, callback) {
    return pine.get({
      resource: 'device',
      options: {
        expand: 'application',
        filter: {
          name: name
        }
      }
    }).tap(function(devices) {
      if (_.isEmpty(devices)) {
        throw new errors.ResinDeviceNotFound(name);
      }
    }).map(function(device) {
      device.application_name = device.application[0].app_name;
      return device;
    }).nodeify(callback);
  };


  /**
   * @summary Get the name of a device
   * @name getName
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @fulfil {String} - device name
   * @returns {Promise}
   *
   * @example
   * resin.models.device.getName('7cf02a6').then(function(deviceName) {
   * 	console.log(deviceName);
   * });
   *
   * @example
   * resin.models.device.getName('7cf02a6', function(error, deviceName) {
   * 	if (error) throw error;
   * 	console.log(deviceName);
   * });
   */

  exports.getName = function(uuid, callback) {
    return exports.get(uuid).get('name').nodeify(callback);
  };


  /**
   * @summary Get application name
   * @name getApplicationName
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @fulfil {String} - application name
   * @returns {Promise}
   *
   * @example
   * resin.models.device.getApplicationName('7cf02a6').then(function(applicationName) {
   * 	console.log(applicationName);
   * });
   *
   * @example
   * resin.models.device.getApplicationName('7cf02a6', function(error, applicationName) {
   * 	if (error) throw error;
   * 	console.log(applicationName);
   * });
   */

  exports.getApplicationName = function(uuid, callback) {
    return exports.get(uuid).get('application_name').nodeify(callback);
  };


  /**
   * @summary Get application container information
   * @name getApplicationInfo
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @fulfil {Object} - application info
   * @returns {Promise}
   *
   * @example
   * resin.models.device.getApplicationInfo('7cf02a6').then(function(appInfo) {
   * 	console.log(appInfo);
   * });
   *
   * @example
   * resin.models.device.getApplicationInfo('7cf02a6', function(error, appInfo) {
   * 	if (error) throw error;
   * 	console.log(appInfo);
   * });
   */

  exports.getApplicationInfo = function(uuid, callback) {
    return exports.get(uuid).then(function(device) {
      return ensureSupervisorCompatibility(device.supervisor_version, MIN_SUPERVISOR_APPS_API).then(function() {
        var appId;
        appId = device.application[0].id;
        return request.send({
          method: 'POST',
          url: "/supervisor/v1/apps/" + appId,
          baseUrl: settings.get('apiUrl'),
          body: {
            deviceId: device.id,
            appId: appId,
            method: 'GET'
          }
        });
      }).get('body').nodeify(callback);
    });
  };


  /**
   * @summary Check if a device exists
   * @name has
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @fulfil {Boolean} - has device
   * @returns {Promise}
   *
   * @example
   * resin.models.device.has('7cf02a6').then(function(hasDevice) {
   * 	console.log(hasDevice);
   * });
   *
   * @example
   * resin.models.device.has('7cf02a6', function(error, hasDevice) {
   * 	if (error) throw error;
   * 	console.log(hasDevice);
   * });
   */

  exports.has = function(uuid, callback) {
    return exports.get(uuid)["return"](true)["catch"](errors.ResinDeviceNotFound, function() {
      return false;
    }).nodeify(callback);
  };


  /**
   * @summary Check if a device is online
   * @name isOnline
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @fulfil {Boolean} - is device online
   * @returns {Promise}
   *
   * @example
   * resin.models.device.isOnline('7cf02a6').then(function(isOnline) {
   * 	console.log('Is device online?', isOnline);
   * });
   *
   * @example
   * resin.models.device.isOnline('7cf02a6', function(error, isOnline) {
   * 	if (error) throw error;
   * 	console.log('Is device online?', isOnline);
   * });
   */

  exports.isOnline = function(uuid, callback) {
    return exports.get(uuid).get('is_online').nodeify(callback);
  };


  /**
   * @summary Get the local IP addresses of a device
   * @name getLocalIPAddresses
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @fulfil {String[]} - local ip addresses
   * @reject {Error} Will reject if the device is offline
   * @returns {Promise}
   *
   * @example
   * resin.models.device.getLocalIPAddresses('7cf02a6').then(function(localIPAddresses) {
   * 	localIPAddresses.forEach(function(localIP) {
   * 		console.log(localIP);
   * 	});
   * });
   *
   * @example
   * resin.models.device.getLocalIPAddresses('7cf02a6', function(error, localIPAddresses) {
   * 	if (error) throw error;
   *
   * 	localIPAddresses.forEach(function(localIP) {
   * 		console.log(localIP);
   * 	});
   * });
   */

  exports.getLocalIPAddresses = function(uuid, callback) {
    return exports.get(uuid).then(function(device) {
      var ips;
      if (!device.is_online) {
        throw new Error("The device is offline: " + uuid);
      }
      ips = device.ip_address.split(' ');
      return _.without(ips, device.vpn_address);
    }).nodeify(callback);
  };


  /**
   * @summary Remove device
   * @name remove
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @returns {Promise}
   *
   * @example
   * resin.models.device.remove('7cf02a6');
   *
   * @example
   * resin.models.device.remove('7cf02a6', function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.remove = function(uuid, callback) {
    return exports.get(uuid).then(function(device) {
      return pine["delete"]({
        resource: 'device',
        options: {
          filter: {
            uuid: device.uuid
          }
        }
      });
    }).nodeify(callback);
  };


  /**
   * @summary Identify device
   * @name identify
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @returns {Promise}
   *
   * @example
   * resin.models.device.identify('7cf02a6');
   *
   * @example
   * resin.models.device.identify('7cf02a6', function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.identify = function(uuid, callback) {
    return exports.get(uuid).then(function(device) {
      return request.send({
        method: 'POST',
        url: '/blink',
        baseUrl: settings.get('apiUrl'),
        body: {
          uuid: device.uuid
        }
      });
    })["return"](void 0).nodeify(callback);
  };


  /**
   * @summary Rename device
   * @name rename
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @param {String} newName - the device new name
   *
   * @returns {Promise}
   *
   * @example
   * resin.models.device.rename('7cf02a6', 'NewName');
   *
   * @example
   * resin.models.device.rename('7cf02a6', 'NewName', function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.rename = function(uuid, newName, callback) {
    return exports.get(uuid).then(function(device) {
      return pine.patch({
        resource: 'device',
        body: {
          name: newName
        },
        options: {
          filter: {
            uuid: device.uuid
          }
        }
      });
    }).nodeify(callback);
  };


  /**
   * @summary Note a device
   * @name note
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @param {String} note - the note
   *
   * @returns {Promise}
   *
   * @example
   * resin.models.device.note('7cf02a6', 'My useful note');
   *
   * @example
   * resin.models.device.note('7cf02a6', 'My useful note', function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.note = function(uuid, note, callback) {
    return exports.get(uuid).then(function(device) {
      return pine.patch({
        resource: 'device',
        body: {
          note: note
        },
        options: {
          filter: {
            uuid: device.uuid
          }
        }
      });
    }).nodeify(callback);
  };


  /**
   * @summary Move a device to another application
   * @name move
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @param {String} application - application name
   *
   * @returns {Promise}
   *
   * @example
   * resin.models.device.move('7cf02a6', 'MyApp');
   *
   * @example
   * resin.models.device.move('7cf02a6', 'MyApp', function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.move = function(uuid, application, callback) {
    return Promise.props({
      device: exports.get(uuid),
      application: applicationModel.get(application)
    }).then(function(results) {
      if (results.device.device_type !== results.application.device_type) {
        throw new Error("Incompatible application: " + application);
      }
      return pine.patch({
        resource: 'device',
        body: {
          application: results.application.id
        },
        options: {
          filter: {
            uuid: results.device.uuid
          }
        }
      });
    }).nodeify(callback);
  };


  /**
   * @summary Start application on device
   * @name startApplication
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @fulfil {String} - application container id
   * @returns {Promise}
   *
   * @example
   * resin.models.device.startApplication('7cf02a6').then(function(containerId) {
   * 	console.log(containerId);
   * });
   *
   * @example
   * resin.models.device.startApplication('7cf02a6', function(error, containerId) {
   * 	if (error) throw error;
   * 	console.log(containerId);
   * });
   */

  exports.startApplication = function(uuid, callback) {
    return exports.get(uuid).then(function(device) {
      return ensureSupervisorCompatibility(device.supervisor_version, MIN_SUPERVISOR_APPS_API).then(function() {
        var appId;
        appId = device.application[0].id;
        return request.send({
          method: 'POST',
          url: "/supervisor/v1/apps/" + appId + "/start",
          baseUrl: settings.get('apiUrl'),
          body: {
            deviceId: device.id,
            appId: appId
          },
          timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT
        });
      });
    }).get('body').get('containerId').nodeify(callback);
  };


  /**
   * @summary Stop application on device
   * @name stopApplication
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @fulfil {String} - application container id
   * @returns {Promise}
   *
   * @example
   * resin.models.device.stopApplication('7cf02a6').then(function(containerId) {
   * 	console.log(containerId);
   * });
   *
   * @example
   * resin.models.device.stopApplication('7cf02a6', function(error, containerId) {
   * 	if (error) throw error;
   * 	console.log(containerId);
   * });
   */

  exports.stopApplication = function(uuid, callback) {
    return exports.get(uuid).then(function(device) {
      return ensureSupervisorCompatibility(device.supervisor_version, MIN_SUPERVISOR_APPS_API).then(function() {
        var appId;
        appId = device.application[0].id;
        return request.send({
          method: 'POST',
          url: "/supervisor/v1/apps/" + appId + "/stop",
          baseUrl: settings.get('apiUrl'),
          body: {
            deviceId: device.id,
            appId: appId
          },
          timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT
        });
      });
    }).get('body').get('containerId').nodeify(callback);
  };


  /**
   * @summary Restart application on device
   * @name restartApplication
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @description
   * This function restarts the Docker container running
   * the application on the device, but doesn't reboot
   * the device itself.
   *
   * @param {String} uuid - device uuid
   * @returns {Promise}
   *
   * @example
   * resin.models.device.restartApplication('7cf02a6');
   *
   * @example
   * resin.models.device.restartApplication('7cf02a6', function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.restartApplication = function(uuid, callback) {
    return exports.get(uuid).then(function(device) {
      return request.send({
        method: 'POST',
        url: "/device/" + device.id + "/restart",
        baseUrl: settings.get('apiUrl'),
        timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT
      });
    }).get('body').nodeify(callback);
  };


  /**
   * @summary Restart application on device.
   * @name restart
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @returns {Promise}
   *
   * @deprecated
   * @see {@link resin.models.device.restartApplication}
   */

  exports.restart = exports.restartApplication;


  /**
   * @summary Reboot device
   * @name reboot
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @param {Object} [options] - options
   * @param {Boolean} [options.force=false] - override update lock
   * @returns {Promise}
   *
   * @example
   * resin.models.device.reboot('7cf02a6');
   *
   * @example
   * resin.models.device.reboot('7cf02a6', function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.reboot = function(uuid, options, callback) {
    if (options == null) {
      options = {};
    }
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }
    return exports.get(uuid).then(function(device) {
      return request.send({
        method: 'POST',
        url: '/supervisor/v1/reboot',
        baseUrl: settings.get('apiUrl'),
        body: {
          deviceId: device.id,
          data: {
            force: Boolean(options.force)
          }
        }
      });
    }).get('body').nodeify(callback);
  };


  /**
   * @summary Shutdown device
   * @name shutdown
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @param {Object} [options] - options
   * @param {Boolean} [options.force=false] - override update lock
   * @returns {Promise}
   *
   * @example
   * resin.models.device.shutdown('7cf02a6');
   *
   * @example
   * resin.models.device.shutdown('7cf02a6', function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.shutdown = function(uuid, options, callback) {
    if (options == null) {
      options = {};
    }
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }
    return exports.get(uuid).then(function(device) {
      return request.send({
        method: 'POST',
        url: '/supervisor/v1/shutdown',
        baseUrl: settings.get('apiUrl'),
        body: {
          deviceId: device.id,
          appId: device.application[0].id,
          data: {
            force: Boolean(options.force)
          }
        }
      });
    }).nodeify(callback);
  };


  /**
   * @summary Purge device
   * @name purge
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @description
   * This function clears the user application's `/data` directory.
   *
   * @param {String} uuid - device uuid
   * @returns {Promise}
   *
   * @example
   * resin.models.device.purge('7cf02a6');
   *
   * @example
   * resin.models.device.purge('7cf02a6', function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.purge = function(uuid, callback) {
    return exports.get(uuid).then(function(device) {
      return request.send({
        method: 'POST',
        url: '/supervisor/v1/purge',
        baseUrl: settings.get('apiUrl'),
        body: {
          deviceId: device.id,
          appId: device.application[0].id,
          data: {
            appId: device.application[0].id
          }
        }
      });
    }).nodeify(callback);
  };


  /**
   * @summary Trigger an update check on the supervisor
   * @name update
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @param {Object} options - options
   * @param {Boolean} [options.force=false] - override update lock
   * @returns {Promise}
   *
   * @example
   * resin.models.device.update('7cf02a6', {
   * 	force: true
   * });
   *
   * @example
   * resin.models.device.update('7cf02a6', {
   * 	force: true
   * }, function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.update = function(uuid, options, callback) {
    return exports.get(uuid).then(function(device) {
      return request.send({
        method: 'POST',
        url: '/supervisor/v1/update',
        baseUrl: settings.get('apiUrl'),
        body: {
          deviceId: device.id,
          appId: device.application[0].id,
          data: {
            force: Boolean(options.force)
          }
        }
      });
    }).nodeify(callback);
  };


  /**
   * @summary Get display name for a device
   * @name getDisplayName
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @see {@link module:resin.models.device.getSupportedDeviceTypes} for a list of supported devices
   *
   * @param {String} deviceTypeSlug - device type slug
   * @fulfil {String} - device display name
   * @returns {Promise}
   *
   * @example
   * resin.models.device.getDisplayName('raspberry-pi').then(function(deviceTypeName) {
   * 	console.log(deviceTypeName);
   * 	// Raspberry Pi
   * });
   *
   * @example
   * resin.models.device.getDisplayName('raspberry-pi', function(error, deviceTypeName) {
   * 	if (error) throw error;
   * 	console.log(deviceTypeName);
   * 	// Raspberry Pi
   * });
   */

  exports.getDisplayName = function(deviceTypeSlug, callback) {
    return exports.getManifestBySlug(deviceTypeSlug).get('name')["catch"](function(error) {
      if (error instanceof errors.ResinInvalidDeviceType) {
        return;
      }
      throw error;
    }).nodeify(callback);
  };


  /**
   * @summary Get device slug
   * @name getDeviceSlug
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @see {@link module:resin.models.device.getSupportedDeviceTypes} for a list of supported devices
   *
   * @param {String} deviceTypeName - device type name
   * @fulfil {String} - device slug name
   * @returns {Promise}
   *
   * @example
   * resin.models.device.getDeviceSlug('Raspberry Pi').then(function(deviceTypeSlug) {
   * 	console.log(deviceTypeSlug);
   * 	// raspberry-pi
   * });
   *
   * @example
   * resin.models.device.getDeviceSlug('Raspberry Pi', function(error, deviceTypeSlug) {
   * 	if (error) throw error;
   * 	console.log(deviceTypeSlug);
   * 	// raspberry-pi
   * });
   */

  exports.getDeviceSlug = function(deviceTypeName, callback) {
    return exports.getManifestBySlug(deviceTypeName).get('slug')["catch"](function(error) {
      if (error instanceof errors.ResinInvalidDeviceType) {
        return;
      }
      throw error;
    }).nodeify(callback);
  };


  /**
   * @summary Get supported device types
   * @name getSupportedDeviceTypes
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @fulfil {String[]} - supported device types
   * @returns {Promise}
   *
   * @example
   * resin.models.device.getSupportedDeviceTypes().then(function(supportedDeviceTypes) {
   * 	supportedDeviceTypes.forEach(function(supportedDeviceType) {
   * 		console.log('Resin supports:', supportedDeviceType);
   * 	});
   * });
   *
   * @example
   * resin.models.device.getSupportedDeviceTypes(function(error, supportedDeviceTypes) {
   * 	if (error) throw error;
   *
   * 	supportedDeviceTypes.forEach(function(supportedDeviceType) {
   * 		console.log('Resin supports:', supportedDeviceType);
   * 	});
   * });
   */

  exports.getSupportedDeviceTypes = function(callback) {
    return configModel.getDeviceTypes().then(function(deviceTypes) {
      return _.map(deviceTypes, 'name');
    }).nodeify(callback);
  };


  /**
   * @summary Get a device manifest by slug
   * @name getManifestBySlug
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} slug - device slug
   * @fulfil {Object} - device manifest
   * @returns {Promise}
   *
   * @example
   * resin.models.device.getManifestBySlug('raspberry-pi').then(function(manifest) {
   * 	console.log(manifest);
   * });
   *
   * @example
   * resin.models.device.getManifestBySlug('raspberry-pi', function(error, manifest) {
   * 	if (error) throw error;
   * 	console.log(manifest);
   * });
   */

  exports.getManifestBySlug = function(slug, callback) {
    return configModel.getDeviceTypes().then(function(deviceTypes) {
      return _.find(deviceTypes, function(deviceType) {
        return _.some([deviceType.name === slug, deviceType.slug === slug, _.includes(deviceType.aliases, slug)]);
      });
    }).then(function(deviceManifest) {
      if (deviceManifest == null) {
        throw new errors.ResinInvalidDeviceType(slug);
      }
      return deviceManifest;
    }).nodeify(callback);
  };


  /**
   * @summary Get a device manifest by application name
   * @name getManifestByApplication
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} applicationName - application name
   * @fulfil {Object} - device manifest
   * @returns {Promise}
   *
   * @example
   * resin.models.device.getManifestByApplication('MyApp').then(function(manifest) {
   * 	console.log(manifest);
   * });
   *
   * @example
   * resin.models.device.getManifestByApplication('MyApp', function(error, manifest) {
   * 	if (error) throw error;
   * 	console.log(manifest);
   * });
   */

  exports.getManifestByApplication = function(applicationName, callback) {
    return applicationModel.get(applicationName).get('device_type').then(function(deviceType) {
      return exports.getManifestBySlug(deviceType);
    }).nodeify(callback);
  };


  /**
   * @summary Generate a random device UUID
   * @name generateUUID
   * @function
   * @public
   * @memberof resin.models.device
   *
   * @fulfil {String} - a generated UUID
   * @returns {Promise}
   *
   * @example
   * resin.models.device.generateUUID().then(function(uuid) {
   * 	console.log(uuid);
   * });
   *
   * @example
   * resin.models.device.generateUUID(function(error, uuid) {
   * 	if (error) throw error;
   * 	console.log(uuid);
   * });
   */

  exports.generateUUID = registerDevice.generateUUID;


  /**
   * @summary Register a new device with a Resin.io application
   * @name register
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} applicationName - application name
   * @param {String} uuid - device uuid
   *
   * @fulfil {Object} - device
   * @returns {Promise}
   *
   * @example
   * resin.models.device.generateUUID().then(function(uuid) {
   * 	resin.models.device.register('MyApp', uuid).then(function(device) {
   * 		console.log(device);
   * 	});
   * });
   *
   * @example
   * resin.models.device.generateUUID(function(error, uuid) {
   * 	if (error) throw error;
   *
   * 	resin.models.device.register('MyApp', uuid, function(error, device) {
   * 		if (error) throw error;
   *
   * 		console.log(device);
   * 	});
   * });
   */

  exports.register = function(applicationName, uuid, callback) {
    return Promise.props({
      userId: auth.getUserId(),
      apiKey: applicationModel.getApiKey(applicationName),
      application: applicationModel.get(applicationName)
    }).then(function(results) {
      return registerDevice.register(pine, {
        userId: results.userId,
        applicationId: results.application.id,
        deviceType: results.application.device_type,
        uuid: uuid,
        apiKey: results.apiKey
      });
    }).nodeify(callback);
  };


  /**
   * @summary Check if a device is web accessible with device utls
   * @name hasDeviceUrl
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @fulfil {Boolean} - has device url
   * @returns {Promise}
   *
   * @example
   * resin.models.device.hasDeviceUrl('7cf02a6').then(function(hasDeviceUrl) {
   * 	if (hasDeviceUrl) {
   * 		console.log('The device has device URL enabled');
   * 	}
   * });
   *
   * @example
   * resin.models.device.hasDeviceUrl('7cf02a6', function(error, hasDeviceUrl) {
   * 	if (error) throw error;
   *
   * 	if (hasDeviceUrl) {
   * 		console.log('The device has device URL enabled');
   * 	}
   * });
   */

  exports.hasDeviceUrl = function(uuid, callback) {
    return exports.get(uuid).get('is_web_accessible').nodeify(callback);
  };


  /**
   * @summary Get a device url
   * @name getDeviceUrl
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @fulfil {String} - device url
   * @returns {Promise}
   *
   * @example
   * resin.models.device.getDeviceUrl('7cf02a6').then(function(url) {
   * 	console.log(url);
   * });
   *
   * @example
   * resin.models.device.getDeviceUrl('7cf02a6', function(error, url) {
   * 	if (error) throw error;
   * 	console.log(url);
   * });
   */

  exports.getDeviceUrl = function(uuid, callback) {
    return exports.hasDeviceUrl(uuid).then(function(hasDeviceUrl) {
      if (!hasDeviceUrl) {
        throw new Error("Device is not web accessible: " + uuid);
      }
      return configModel.getAll().get('deviceUrlsBase').then(function(deviceUrlsBase) {
        return exports.get(uuid).get('uuid').then(function(uuid) {
          return "https://" + uuid + "." + deviceUrlsBase;
        });
      });
    }).nodeify(callback);
  };


  /**
   * @summary Enable device url for a device
   * @name enableDeviceUrl
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @returns {Promise}
   *
   * @example
   * resin.models.device.enableDeviceUrl('7cf02a6');
   *
   * @example
   * resin.models.device.enableDeviceUrl('7cf02a6', function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.enableDeviceUrl = function(uuid, callback) {
    return exports.get(uuid).then(function(device) {
      return pine.patch({
        resource: 'device',
        body: {
          is_web_accessible: true
        },
        options: {
          filter: {
            uuid: device.uuid
          }
        }
      });
    }).nodeify(callback);
  };


  /**
   * @summary Disable device url for a device
   * @name disableDeviceUrl
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @returns {Promise}
   *
   * @example
   * resin.models.device.disableDeviceUrl('7cf02a6');
   *
   * @example
   * resin.models.device.disableDeviceUrl('7cf02a6', function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.disableDeviceUrl = function(uuid, callback) {
    return exports.get(uuid).then(function(device) {
      return pine.patch({
        resource: 'device',
        body: {
          is_web_accessible: false
        },
        options: {
          filter: {
            uuid: device.uuid
          }
        }
      });
    }).nodeify(callback);
  };


  /**
   * @summary Enable TCP ping for a device
   * @name enableTcpPing
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @description
   * When the device's connection to the Resin VPN is down, by default
   * the device performs a TCP ping heartbeat to check for connectivity.
   * This is enabled by default.
   *
   * @param {String} uuid - device uuid
   * @returns {Promise}
   *
   * @example
   * resin.models.device.enableTcpPing('7cf02a6');
   *
   * @example
   * resin.models.device.enableTcpPing('7cf02a6', function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.enableTcpPing = function(uuid, callback) {
    return exports.get(uuid).then(function(device) {
      return request.send({
        method: 'POST',
        url: '/supervisor/v1/tcp-ping',
        baseUrl: settings.get('apiUrl'),
        data: {
          deviceId: device.id,
          appId: device.application[0].id
        }
      });
    }).get('body').nodeify(callback);
  };


  /**
   * @summary Disable TCP ping for a device
   * @name disableTcpPing
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @description
   * When the device's connection to the Resin VPN is down, by default
   * the device performs a TCP ping heartbeat to check for connectivity.
   *
   * @param {String} uuid - device uuid
   * @returns {Promise}
   *
   * @example
   * resin.models.device.disableTcpPing('7cf02a6');
   *
   * @example
   * resin.models.device.disableTcpPing('7cf02a6', function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.disableTcpPing = function(uuid, callback) {
    return exports.get(uuid).then(function(device) {
      return request.send({
        method: 'DELETE',
        url: '/supervisor/v1/tcp-ping',
        baseUrl: settings.get('apiUrl'),
        data: {
          deviceId: device.id,
          appId: device.application[0].id
        }
      });
    }).get('body').nodeify(callback);
  };


  /**
   * @summary Ping a device
   * @name ping
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @description
   * This is useful to signal that the supervisor is alive and responding.
   *
   * @param {String} uuid - device uuid
   * @returns {Promise}
   *
   * @example
   * resin.models.device.ping('7cf02a6');
   *
   * @example
   * resin.models.device.ping('7cf02a6', function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.ping = function(uuid, callback) {
    return exports.get(uuid).then(function(device) {
      return request.send({
        method: 'GET',
        url: '/supervisor/ping',
        baseUrl: settings.get('apiUrl'),
        body: {
          deviceId: device.id,
          appId: device.application[0].id
        }
      });
    }).nodeify(callback);
  };


  /**
   * @summary Get the status of a device
   * @name getStatus
   * @public
   * @function
   * @memberof resin.models.device
   *
   * @param {String} uuid - device uuid
   * @fulfil {String} - device statud
   * @returns {Promise}
   *
   * @example
   * resin.models.device.getStatus('7cf02a6').then(function(status) {
   * 	console.log(status);
   * });
   *
   * @example
   * resin.models.device.getStatus('7cf02a6', function(error, status) {
   * 	if (error) throw error;
   * 	console.log(status);
   * });
   */

  exports.getStatus = function(uuid, callback) {
    return Promise["try"](function() {
      return deviceStatus.getStatus(uuid).key;
    }).nodeify(callback);
  };

}).call(this);
