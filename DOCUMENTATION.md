Welcome to the Balena SDK documentation.

This document aims to describe all the functions supported by the SDK, as well as showing examples of their expected usage.

If you feel something is missing, not clear or could be improved, please don't hesitate to open an
[issue in GitHub](https://github.com/balena-io/balena-sdk/issues/new), we'll be happy to help.

## Modules

<dl>
<dt><a href="#module_balena-sdk">balena-sdk</a></dt>
<dd></dd>
</dl>

## Objects

<dl>
<dt><a href="#balena">balena</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="module_balena-sdk"></a>

## balena-sdk

* [balena-sdk](#module_balena-sdk)
    * [~getSdk()](#module_balena-sdk..getSdk)
    * [~setSharedOptions(options)](#module_balena-sdk..setSharedOptions)
    * [~fromSharedOptions()](#module_balena-sdk..fromSharedOptions)

<a name="module_balena-sdk..getSdk"></a>

### balena-sdk~getSdk()
The module exports a single factory function.

**Kind**: inner method of [<code>balena-sdk</code>](#module_balena-sdk)  
**Summary**: Creates a new SDK instance using the default or the provided options.  
**Example**  
```js
// with es6 imports
import { getSdk } from 'balena-sdk';
// or with node require
const { getSdk } = require('balena-sdk');

const balena = getSdk({
	apiUrl: "https://api.balena-cloud.com/",
	dataDirectory: "/opt/local/balena"
});
```
<a name="module_balena-sdk..setSharedOptions"></a>

### balena-sdk~setSharedOptions(options)
Set options that are used by calls to `fromSharedOptions()`.
The options accepted are the same as those used in the main SDK factory function.
If you use this method, it should be called as soon as possible during app
startup and before any calls to `fromSharedOptions()` are made.

**Kind**: inner method of [<code>balena-sdk</code>](#module_balena-sdk)  
**Summary**: Set shared default options  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | The shared default options |
| [options.apiUrl] | <code>String</code> | <code>&#x27;https://api.balena-cloud.com/&#x27;</code> | the balena API url to use. |
| [options.builderUrl] | <code>String</code> | <code>&#x27;https://builder.balena-cloud.com/&#x27;</code> | the balena builder url to use. |
| [options.deviceUrlsBase] | <code>String</code> | <code>&#x27;balena-devices.com&#x27;</code> | the base balena device API url to use. |
| [options.dataDirectory] | <code>String</code> | <code>&#x27;$HOME/.balena&#x27;</code> | *ignored in the browser*, the directory where the user settings are stored, normally retrieved like `require('balena-settings-client').get('dataDirectory')`. |
| [options.isBrowser] | <code>Boolean</code> |  | the flag to tell if the module works in the browser. If not set will be computed based on the presence of the global `window` value. |
| [options.debug] | <code>Boolean</code> |  | when set will print some extra debug information. |

**Example**  
```js
import { setSharedOptions } from 'balena-sdk';
setSharedOptions({
	apiUrl: 'https://api.balena-cloud.com/',
	builderUrl: 'https://builder.balena-cloud.com/',
	isBrowser: true,
});
```
<a name="module_balena-sdk..fromSharedOptions"></a>

### balena-sdk~fromSharedOptions()
Create an SDK instance using shared default options set using the `setSharedOptions()` method.
If options have not been set using this method, then this method will use the
same defaults as the main SDK factory function.

**Kind**: inner method of [<code>balena-sdk</code>](#module_balena-sdk)  
**Summary**: Create an SDK instance using shared default options  
**Access**: public  
**Example**  
```js
import { fromSharedOptions } from 'balena-sdk';
const sdk = fromSharedOptions();
```
<a name="balena"></a>

## balena : <code>object</code>
**Kind**: global namespace  

* [balena](#balena) : <code>object</code>
    * [.interceptors](#balena.interceptors) : <code>Array.&lt;Interceptor&gt;</code>
        * [.Interceptor](#balena.interceptors.Interceptor) : <code>object</code>
    * [.request](#balena.request) : <code>Object</code>
    * [.pine](#balena.pine) : <code>Object</code>
    * [.errors](#balena.errors) : <code>Object</code>
    * [.models](#balena.models) : <code>object</code>
        * [.application](#balena.models.application) : <code>object</code>
            * [.tags](#balena.models.application.tags) : <code>object</code>
                * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.tags.getAllByApplication) ⇒ <code>Promise</code>
                * [.getAll([options])](#balena.models.application.tags.getAll) ⇒ <code>Promise</code>
                * [.set(nameOrSlugOrId, tagKey, value)](#balena.models.application.tags.set) ⇒ <code>Promise</code>
                * [.remove(nameOrSlugOrId, tagKey)](#balena.models.application.tags.remove) ⇒ <code>Promise</code>
            * [.configVar](#balena.models.application.configVar) : <code>object</code>
                * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.configVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(nameOrSlugOrId, key)](#balena.models.application.configVar.get) ⇒ <code>Promise</code>
                * [.set(nameOrSlugOrId, key, value)](#balena.models.application.configVar.set) ⇒ <code>Promise</code>
                * [.remove(nameOrSlugOrId, key)](#balena.models.application.configVar.remove) ⇒ <code>Promise</code>
            * [.envVar](#balena.models.application.envVar) : <code>object</code>
                * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.envVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(nameOrSlugOrId, key)](#balena.models.application.envVar.get) ⇒ <code>Promise</code>
                * [.set(nameOrSlugOrId, key, value)](#balena.models.application.envVar.set) ⇒ <code>Promise</code>
                * [.remove(nameOrSlugOrId, key)](#balena.models.application.envVar.remove) ⇒ <code>Promise</code>
            * [.buildVar](#balena.models.application.buildVar) : <code>object</code>
                * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.buildVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(nameOrSlugOrId, key)](#balena.models.application.buildVar.get) ⇒ <code>Promise</code>
                * [.set(nameOrSlugOrId, key, value)](#balena.models.application.buildVar.set) ⇒ <code>Promise</code>
                * [.remove(nameOrSlugOrId, key)](#balena.models.application.buildVar.remove) ⇒ <code>Promise</code>
            * [.membership](#balena.models.application.membership) : <code>object</code>
                * [.get(membershipId, [options])](#balena.models.application.membership.get) ⇒ <code>Promise</code>
                * [.getAll([options])](#balena.models.application.membership.getAll) ⇒ <code>Promise</code>
                * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.membership.getAllByApplication) ⇒ <code>Promise</code>
                * [.create(options)](#balena.models.application.membership.create) ⇒ <code>Promise</code>
                * [.changeRole(idOrUniqueKey, roleName)](#balena.models.application.membership.changeRole) ⇒ <code>Promise</code>
                * [.remove(idOrUniqueKey)](#balena.models.application.membership.remove) ⇒ <code>Promise</code>
            * [.invite](#balena.models.application.invite) : <code>object</code>
                * [.getAll([options])](#balena.models.application.invite.getAll) ⇒ <code>Promise</code>
                * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.invite.getAllByApplication) ⇒ <code>Promise</code>
                * [.create(nameOrSlugOrId, options, [message])](#balena.models.application.invite.create) ⇒ <code>Promise</code>
                * [.revoke(id)](#balena.models.application.invite.revoke) ⇒ <code>Promise</code>
                * [.accept(invitationToken)](#balena.models.application.invite.accept) ⇒ <code>Promise</code>
            * [.getDashboardUrl(id)](#balena.models.application.getDashboardUrl) ⇒ <code>String</code>
            * [.getAll([options])](#balena.models.application.getAll) ⇒ <code>Promise</code>
            * ~~[.getAllWithDeviceServiceDetails([options])](#balena.models.application.getAllWithDeviceServiceDetails) ⇒ <code>Promise</code>~~
            * [.get(nameOrSlugOrId, [options])](#balena.models.application.get) ⇒ <code>Promise</code>
            * [.getWithDeviceServiceDetails(nameOrSlugOrId, [options])](#balena.models.application.getWithDeviceServiceDetails) ⇒ <code>Promise</code>
            * [.getAppByName(appName, [options])](#balena.models.application.getAppByName) ⇒ <code>Promise</code>
            * [.getAppByOwner(appName, owner, [options])](#balena.models.application.getAppByOwner) ⇒ <code>Promise</code>
            * [.has(nameOrSlugOrId)](#balena.models.application.has) ⇒ <code>Promise</code>
            * [.hasAny()](#balena.models.application.hasAny) ⇒ <code>Promise</code>
            * [.create(options)](#balena.models.application.create) ⇒ <code>Promise</code>
            * [.remove(nameOrSlugOrId)](#balena.models.application.remove) ⇒ <code>Promise</code>
            * [.rename(nameOrSlugOrId, newName)](#balena.models.application.rename) ⇒ <code>Promise</code>
            * [.restart(nameOrSlugOrId)](#balena.models.application.restart) ⇒ <code>Promise</code>
            * ~~[.generateApiKey(nameOrSlugOrId)](#balena.models.application.generateApiKey) ⇒ <code>Promise</code>~~
            * [.generateProvisioningKey(nameOrSlugOrId)](#balena.models.application.generateProvisioningKey) ⇒ <code>Promise</code>
            * [.purge(appId)](#balena.models.application.purge) ⇒ <code>Promise</code>
            * [.shutdown(appId, [options])](#balena.models.application.shutdown) ⇒ <code>Promise</code>
            * [.reboot(appId, [options])](#balena.models.application.reboot) ⇒ <code>Promise</code>
            * [.willTrackNewReleases(nameOrSlugOrId)](#balena.models.application.willTrackNewReleases) ⇒ <code>Promise</code>
            * [.isTrackingLatestRelease(nameOrSlugOrId)](#balena.models.application.isTrackingLatestRelease) ⇒ <code>Promise</code>
            * [.pinToRelease(nameOrSlugOrId, fullReleaseHash)](#balena.models.application.pinToRelease) ⇒ <code>Promise</code>
            * [.getTargetReleaseHash(nameOrSlugOrId)](#balena.models.application.getTargetReleaseHash) ⇒ <code>Promise</code>
            * [.trackLatestRelease(nameOrSlugOrId)](#balena.models.application.trackLatestRelease) ⇒ <code>Promise</code>
            * [.enableDeviceUrls(nameOrSlugOrId)](#balena.models.application.enableDeviceUrls) ⇒ <code>Promise</code>
            * [.disableDeviceUrls(nameOrSlugOrId)](#balena.models.application.disableDeviceUrls) ⇒ <code>Promise</code>
            * [.grantSupportAccess(nameOrSlugOrId, expiryTimestamp)](#balena.models.application.grantSupportAccess) ⇒ <code>Promise</code>
            * [.revokeSupportAccess(nameOrSlugOrId)](#balena.models.application.revokeSupportAccess) ⇒ <code>Promise</code>
        * [.device](#balena.models.device) : <code>object</code>
            * [.tags](#balena.models.device.tags) : <code>object</code>
                * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.tags.getAllByApplication) ⇒ <code>Promise</code>
                * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.tags.getAllByDevice) ⇒ <code>Promise</code>
                * [.getAll([options])](#balena.models.device.tags.getAll) ⇒ <code>Promise</code>
                * [.set(uuidOrId, tagKey, value)](#balena.models.device.tags.set) ⇒ <code>Promise</code>
                * [.remove(uuidOrId, tagKey)](#balena.models.device.tags.remove) ⇒ <code>Promise</code>
            * [.configVar](#balena.models.device.configVar) : <code>object</code>
                * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.configVar.getAllByDevice) ⇒ <code>Promise</code>
                * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.configVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(uuidOrId, key)](#balena.models.device.configVar.get) ⇒ <code>Promise</code>
                * [.set(uuidOrId, key, value)](#balena.models.device.configVar.set) ⇒ <code>Promise</code>
                * [.remove(uuidOrId, key)](#balena.models.device.configVar.remove) ⇒ <code>Promise</code>
            * [.envVar](#balena.models.device.envVar) : <code>object</code>
                * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.envVar.getAllByDevice) ⇒ <code>Promise</code>
                * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.envVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(uuidOrId, key)](#balena.models.device.envVar.get) ⇒ <code>Promise</code>
                * [.set(uuidOrId, key, value)](#balena.models.device.envVar.set) ⇒ <code>Promise</code>
                * [.remove(uuidOrId, key)](#balena.models.device.envVar.remove) ⇒ <code>Promise</code>
            * [.serviceVar](#balena.models.device.serviceVar) : <code>object</code>
                * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.serviceVar.getAllByDevice) ⇒ <code>Promise</code>
                * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.serviceVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(uuidOrId, id, key)](#balena.models.device.serviceVar.get) ⇒ <code>Promise</code>
                * [.set(uuidOrId, id, key, value)](#balena.models.device.serviceVar.set) ⇒ <code>Promise</code>
                * [.remove(uuidOrId, id, key)](#balena.models.device.serviceVar.remove) ⇒ <code>Promise</code>
            * [.getDashboardUrl(uuid)](#balena.models.device.getDashboardUrl) ⇒ <code>String</code>
            * [.getAll([options])](#balena.models.device.getAll) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.getAllByApplication) ⇒ <code>Promise</code>
            * [.getAllByParentDevice(parentUuidOrId, [options])](#balena.models.device.getAllByParentDevice) ⇒ <code>Promise</code>
            * [.get(uuidOrId, [options])](#balena.models.device.get) ⇒ <code>Promise</code>
            * [.getWithServiceDetails(uuidOrId, [options])](#balena.models.device.getWithServiceDetails) ⇒ <code>Promise</code>
            * [.getByName(name)](#balena.models.device.getByName) ⇒ <code>Promise</code>
            * [.getName(uuidOrId)](#balena.models.device.getName) ⇒ <code>Promise</code>
            * [.getApplicationName(uuidOrId)](#balena.models.device.getApplicationName) ⇒ <code>Promise</code>
            * [.has(uuidOrId)](#balena.models.device.has) ⇒ <code>Promise</code>
            * [.isOnline(uuidOrId)](#balena.models.device.isOnline) ⇒ <code>Promise</code>
            * [.getLocalIPAddresses(uuidOrId)](#balena.models.device.getLocalIPAddresses) ⇒ <code>Promise</code>
            * [.getMACAddresses(uuidOrId)](#balena.models.device.getMACAddresses) ⇒ <code>Promise</code>
            * [.getMetrics(uuidOrId)](#balena.models.device.getMetrics) ⇒ <code>Promise</code>
            * [.remove(uuidOrId)](#balena.models.device.remove) ⇒ <code>Promise</code>
            * [.deactivate(uuidOrId)](#balena.models.device.deactivate) ⇒ <code>Promise</code>
            * [.rename(uuidOrId, newName)](#balena.models.device.rename) ⇒ <code>Promise</code>
            * [.note(uuidOrId, note)](#balena.models.device.note) ⇒ <code>Promise</code>
            * [.setCustomLocation(uuidOrId, location)](#balena.models.device.setCustomLocation) ⇒ <code>Promise</code>
            * [.unsetCustomLocation(uuidOrId)](#balena.models.device.unsetCustomLocation) ⇒ <code>Promise</code>
            * [.move(uuidOrId, applicationNameOrSlugOrId)](#balena.models.device.move) ⇒ <code>Promise</code>
            * [.restartApplication(uuidOrId)](#balena.models.device.restartApplication) ⇒ <code>Promise</code>
            * [.getSupervisorTargetState(uuidOrId)](#balena.models.device.getSupervisorTargetState) ⇒ <code>Promise</code>
            * ~~[.getDisplayName(deviceTypeSlug)](#balena.models.device.getDisplayName) ⇒ <code>Promise</code>~~
            * ~~[.getDeviceSlug(deviceTypeName)](#balena.models.device.getDeviceSlug) ⇒ <code>Promise</code>~~
            * ~~[.getSupportedDeviceTypes()](#balena.models.device.getSupportedDeviceTypes) ⇒ <code>Promise</code>~~
            * ~~[.getManifestBySlug(slugOrName)](#balena.models.device.getManifestBySlug) ⇒ <code>Promise</code>~~
            * [.getManifestByApplication(nameOrSlugOrId)](#balena.models.device.getManifestByApplication) ⇒ <code>Promise</code>
            * [.generateUniqueKey()](#balena.models.device.generateUniqueKey) ⇒ <code>String</code>
            * [.register(applicationNameOrSlugOrId, uuid)](#balena.models.device.register) ⇒ <code>Promise</code>
            * [.generateDeviceKey(uuidOrId)](#balena.models.device.generateDeviceKey) ⇒ <code>Promise</code>
            * [.hasDeviceUrl(uuidOrId)](#balena.models.device.hasDeviceUrl) ⇒ <code>Promise</code>
            * [.getDeviceUrl(uuidOrId)](#balena.models.device.getDeviceUrl) ⇒ <code>Promise</code>
            * [.enableDeviceUrl(uuidOrId)](#balena.models.device.enableDeviceUrl) ⇒ <code>Promise</code>
            * [.disableDeviceUrl(uuidOrId)](#balena.models.device.disableDeviceUrl) ⇒ <code>Promise</code>
            * [.enableLocalMode(uuidOrId)](#balena.models.device.enableLocalMode) ⇒ <code>Promise</code>
            * [.disableLocalMode(uuidOrId)](#balena.models.device.disableLocalMode) ⇒ <code>Promise</code>
            * [.isInLocalMode(uuidOrId)](#balena.models.device.isInLocalMode) ⇒ <code>Promise</code>
            * [.getLocalModeSupport(device)](#balena.models.device.getLocalModeSupport) ⇒ <code>Object</code>
            * [.enableLockOverride(uuidOrId)](#balena.models.device.enableLockOverride) ⇒ <code>Promise</code>
            * [.disableLockOverride(uuidOrId)](#balena.models.device.disableLockOverride) ⇒ <code>Promise</code>
            * [.hasLockOverride(uuidOrId)](#balena.models.device.hasLockOverride) ⇒ <code>Promise</code>
            * [.getStatus(uuidOrId)](#balena.models.device.getStatus) ⇒ <code>Promise</code>
            * [.getProgress(uuidOrId)](#balena.models.device.getProgress) ⇒ <code>Promise</code>
            * [.grantSupportAccess(uuidOrId, expiryTimestamp)](#balena.models.device.grantSupportAccess) ⇒ <code>Promise</code>
            * [.revokeSupportAccess(uuidOrId)](#balena.models.device.revokeSupportAccess) ⇒ <code>Promise</code>
            * [.lastOnline(device)](#balena.models.device.lastOnline) ⇒ <code>String</code>
            * [.getOsVersion(device)](#balena.models.device.getOsVersion) ⇒ <code>String</code>
            * [.isTrackingApplicationRelease(uuidOrId)](#balena.models.device.isTrackingApplicationRelease) ⇒ <code>Promise</code>
            * [.getTargetReleaseHash(uuidOrId)](#balena.models.device.getTargetReleaseHash) ⇒ <code>Promise</code>
            * [.pinToRelease(uuidOrId, fullReleaseHashOrId)](#balena.models.device.pinToRelease) ⇒ <code>Promise</code>
            * [.setSupervisorRelease(uuidOrId, supervisorVersionOrId)](#balena.models.device.setSupervisorRelease) ⇒ <code>Promise</code>
            * [.trackApplicationRelease(uuidOrId)](#balena.models.device.trackApplicationRelease) ⇒ <code>Promise</code>
            * [.startOsUpdate(uuid, targetOsVersion)](#balena.models.device.startOsUpdate) ⇒ <code>Promise</code>
            * [.getOsUpdateStatus(uuid)](#balena.models.device.getOsUpdateStatus) ⇒ <code>Promise</code>
            * [.ping(uuidOrId)](#balena.models.device.ping) ⇒ <code>Promise</code>
            * ~~[.getApplicationInfo(uuidOrId)](#balena.models.device.getApplicationInfo) ⇒ <code>Promise</code>~~
            * [.identify(uuidOrId)](#balena.models.device.identify) ⇒ <code>Promise</code>
            * ~~[.startApplication(uuidOrId)](#balena.models.device.startApplication) ⇒ <code>Promise</code>~~
            * ~~[.stopApplication(uuidOrId)](#balena.models.device.stopApplication) ⇒ <code>Promise</code>~~
            * [.reboot(uuidOrId, [options])](#balena.models.device.reboot) ⇒ <code>Promise</code>
            * [.shutdown(uuidOrId, [options])](#balena.models.device.shutdown) ⇒ <code>Promise</code>
            * [.purge(uuidOrId)](#balena.models.device.purge) ⇒ <code>Promise</code>
            * [.update(uuidOrId, [options])](#balena.models.device.update) ⇒ <code>Promise</code>
            * [.getSupervisorState(uuidOrId)](#balena.models.device.getSupervisorState) ⇒ <code>Promise</code>
            * [.startService(uuidOrId, imageId)](#balena.models.device.startService) ⇒ <code>Promise</code>
            * [.stopService(uuidOrId, imageId)](#balena.models.device.stopService) ⇒ <code>Promise</code>
            * [.restartService(uuidOrId, imageId)](#balena.models.device.restartService) ⇒ <code>Promise</code>
        * [.deviceType](#balena.models.deviceType) : <code>object</code>
            * [.get(idOrSlug, [options])](#balena.models.deviceType.get) ⇒ <code>Promise</code>
            * [.getAll([options])](#balena.models.deviceType.getAll) ⇒ <code>Promise</code>
            * [.getAllSupported([options])](#balena.models.deviceType.getAllSupported) ⇒ <code>Promise</code>
            * [.getBySlugOrName(slugOrName)](#balena.models.deviceType.getBySlugOrName) ⇒ <code>Promise</code>
            * [.getName(deviceTypeSlug)](#balena.models.deviceType.getName) ⇒ <code>Promise</code>
            * [.getInterpolatedPartials(deviceTypeSlug, initial)](#balena.models.deviceType.getInterpolatedPartials) ⇒ <code>Promise</code>
            * [.getInstructions(deviceTypeSlug)](#balena.models.deviceType.getInstructions) ⇒ <code>Promise</code>
            * [.getSlugByName(deviceTypeName)](#balena.models.deviceType.getSlugByName) ⇒ <code>Promise</code>
        * [.apiKey](#balena.models.apiKey) : <code>object</code>
            * [.create(name, [description])](#balena.models.apiKey.create) ⇒ <code>Promise</code>
            * [.getAll([options])](#balena.models.apiKey.getAll) ⇒ <code>Promise</code>
            * [.getAllNamedUserApiKeys([options])](#balena.models.apiKey.getAllNamedUserApiKeys) ⇒ <code>Promise</code>
            * [.getProvisioningApiKeysByApplication(nameOrSlugOrId, [options])](#balena.models.apiKey.getProvisioningApiKeysByApplication) ⇒ <code>Promise</code>
            * [.update(id, apiKeyInfo)](#balena.models.apiKey.update) ⇒ <code>Promise</code>
            * [.revoke(id)](#balena.models.apiKey.revoke) ⇒ <code>Promise</code>
        * [.key](#balena.models.key) : <code>object</code>
            * [.getAll([options])](#balena.models.key.getAll) ⇒ <code>Promise</code>
            * [.get(id)](#balena.models.key.get) ⇒ <code>Promise</code>
            * [.remove(id)](#balena.models.key.remove) ⇒ <code>Promise</code>
            * [.create(title, key)](#balena.models.key.create) ⇒ <code>Promise</code>
        * [.organization](#balena.models.organization) : <code>object</code>
            * [.membership](#balena.models.organization.membership) : <code>object</code>
                * [.get(membershipId, [options])](#balena.models.organization.membership.get) ⇒ <code>Promise</code>
                * [.getAll([options])](#balena.models.organization.membership.getAll) ⇒ <code>Promise</code>
                * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.membership.getAllByOrganization) ⇒ <code>Promise</code>
                * [.create(options)](#balena.models.organization.membership.create) ⇒ <code>Promise</code>
                * [.changeRole(idOrUniqueKey, roleName)](#balena.models.organization.membership.changeRole) ⇒ <code>Promise</code>
                * [.remove(id)](#balena.models.organization.membership.remove) ⇒ <code>Promise</code>
            * [.invite](#balena.models.organization.invite) : <code>object</code>
                * [.getAll([options])](#balena.models.organization.invite.getAll) ⇒ <code>Promise</code>
                * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.invite.getAllByOrganization) ⇒ <code>Promise</code>
                * [.create(handleOrId, options, [message])](#balena.models.organization.invite.create) ⇒ <code>Promise</code>
                * [.revoke(id)](#balena.models.organization.invite.revoke) ⇒ <code>Promise</code>
                * [.accept(invitationToken)](#balena.models.organization.invite.accept) ⇒ <code>Promise</code>
            * [.create(options)](#balena.models.organization.create) ⇒ <code>Promise</code>
            * [.getAll([options])](#balena.models.organization.getAll) ⇒ <code>Promise</code>
            * [.get(handleOrId, [options])](#balena.models.organization.get) ⇒ <code>Promise</code>
            * [.remove(handleOrId)](#balena.models.organization.remove) ⇒ <code>Promise</code>
        * [.os](#balena.models.os) : <code>object</code>
            * [.getDownloadSize(deviceType, [version])](#balena.models.os.getDownloadSize) ⇒ <code>Promise</code>
            * [.getSupportedVersions(deviceType)](#balena.models.os.getSupportedVersions) ⇒ <code>Promise</code>
            * [.getMaxSatisfyingVersion(deviceType, versionOrRange)](#balena.models.os.getMaxSatisfyingVersion) ⇒ <code>Promise</code>
            * [.getLastModified(deviceType, [version])](#balena.models.os.getLastModified) ⇒ <code>Promise</code>
            * [.download(deviceType, [version])](#balena.models.os.download) ⇒ <code>Promise</code>
            * [.getConfig(nameOrSlugOrId, options)](#balena.models.os.getConfig) ⇒ <code>Promise</code>
            * [.isSupportedOsUpdate(deviceType, currentVersion, targetVersion)](#balena.models.os.isSupportedOsUpdate) ⇒ <code>Promise</code>
            * [.getSupportedOsUpdateVersions(deviceType, currentVersion)](#balena.models.os.getSupportedOsUpdateVersions) ⇒ <code>Promise</code>
            * [.isArchitectureCompatibleWith(osArchitecture, applicationArchitecture)](#balena.models.os.isArchitectureCompatibleWith) ⇒ <code>Boolean</code>
        * [.hostapp](#balena.models.hostapp) : <code>object</code>
            * [.getAllOsVersions(deviceTypes)](#balena.models.hostapp.getAllOsVersions) ⇒ <code>Promise</code>
        * [.config](#balena.models.config) : <code>object</code>
            * [.getAll()](#balena.models.config.getAll) ⇒ <code>Promise</code>
            * ~~[.getDeviceTypes()](#balena.models.config.getDeviceTypes) ⇒ <code>Promise</code>~~
            * [.getDeviceOptions(deviceType)](#balena.models.config.getDeviceOptions) ⇒ <code>Promise</code>
        * [.release](#balena.models.release) : <code>object</code>
            * [.tags](#balena.models.release.tags) : <code>object</code>
                * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.release.tags.getAllByApplication) ⇒ <code>Promise</code>
                * [.getAllByRelease(commitOrId, [options])](#balena.models.release.tags.getAllByRelease) ⇒ <code>Promise</code>
                * [.getAll([options])](#balena.models.release.tags.getAll) ⇒ <code>Promise</code>
                * [.set(commitOrId, tagKey, value)](#balena.models.release.tags.set) ⇒ <code>Promise</code>
                * [.remove(commitOrId, tagKey)](#balena.models.release.tags.remove) ⇒ <code>Promise</code>
            * [.get(commitOrId, [options])](#balena.models.release.get) ⇒ <code>Promise</code>
            * [.getWithImageDetails(commitOrId, [options])](#balena.models.release.getWithImageDetails) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.release.getAllByApplication) ⇒ <code>Promise</code>
            * [.getLatestByApplication(nameOrSlugOrId, [options])](#balena.models.release.getLatestByApplication) ⇒ <code>Promise</code>
            * [.createFromUrl(nameOrSlugOrId, urlDeployOptions)](#balena.models.release.createFromUrl) ⇒ <code>Promise</code>
        * [.service](#balena.models.service) : <code>object</code>
            * [.var](#balena.models.service.var) : <code>object</code>
                * [.getAllByService(id, [options])](#balena.models.service.var.getAllByService) ⇒ <code>Promise</code>
                * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.service.var.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(id, key)](#balena.models.service.var.get) ⇒ <code>Promise</code>
                * [.set(id, key, value)](#balena.models.service.var.set) ⇒ <code>Promise</code>
                * [.remove(id, key)](#balena.models.service.var.remove) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.service.getAllByApplication) ⇒ <code>Promise</code>
        * [.image](#balena.models.image) : <code>object</code>
            * [.get(id, [options])](#balena.models.image.get) ⇒ <code>Promise</code>
            * [.getLogs(id)](#balena.models.image.getLogs) ⇒ <code>Promise</code>
        * [.billing](#balena.models.billing) : <code>object</code>
            * [.getAccount(organization)](#balena.models.billing.getAccount) ⇒ <code>Promise</code>
            * [.getPlan(organization)](#balena.models.billing.getPlan) ⇒ <code>Promise</code>
            * [.getBillingInfo(organization)](#balena.models.billing.getBillingInfo) ⇒ <code>Promise</code>
            * [.updateBillingInfo(organization, billingInfo)](#balena.models.billing.updateBillingInfo) ⇒ <code>Promise</code>
            * [.changePlan(organization, planChangeOptions)](#balena.models.billing.changePlan) ⇒ <code>Promise</code>
            * [.getInvoices(organization)](#balena.models.billing.getInvoices) ⇒ <code>Promise</code>
            * [.downloadInvoice(organization)](#balena.models.billing.downloadInvoice) ⇒ <code>Promise</code>
    * [.auth](#balena.auth) : <code>object</code>
        * [.twoFactor](#balena.auth.twoFactor) : <code>object</code>
            * [.isEnabled()](#balena.auth.twoFactor.isEnabled) ⇒ <code>Promise</code>
            * [.isPassed()](#balena.auth.twoFactor.isPassed) ⇒ <code>Promise</code>
            * [.verify(code)](#balena.auth.twoFactor.verify) ⇒ <code>Promise</code>
            * [.getSetupKey()](#balena.auth.twoFactor.getSetupKey) ⇒ <code>Promise</code>
            * [.enable(code)](#balena.auth.twoFactor.enable) ⇒ <code>Promise</code>
            * [.challenge(code)](#balena.auth.twoFactor.challenge) ⇒ <code>Promise</code>
            * [.disable(password)](#balena.auth.twoFactor.disable) ⇒ <code>Promise</code>
        * [.whoami()](#balena.auth.whoami) ⇒ <code>Promise</code>
        * [.authenticate(credentials)](#balena.auth.authenticate) ⇒ <code>Promise</code>
        * [.login(credentials)](#balena.auth.login) ⇒ <code>Promise</code>
        * [.loginWithToken(authToken)](#balena.auth.loginWithToken) ⇒ <code>Promise</code>
        * [.isLoggedIn()](#balena.auth.isLoggedIn) ⇒ <code>Promise</code>
        * [.getToken()](#balena.auth.getToken) ⇒ <code>Promise</code>
        * [.getUserId()](#balena.auth.getUserId) ⇒ <code>Promise</code>
        * [.getUserActorId()](#balena.auth.getUserActorId) ⇒ <code>Promise</code>
        * [.getEmail()](#balena.auth.getEmail) ⇒ <code>Promise</code>
        * [.logout()](#balena.auth.logout) ⇒ <code>Promise</code>
        * [.register(credentials)](#balena.auth.register) ⇒ <code>Promise</code>
    * [.logs](#balena.logs) : <code>object</code>
        * [.subscribe(uuidOrId, [options])](#balena.logs.subscribe) ⇒ <code>Promise.&lt;LogSubscription&gt;</code>
        * [.history(uuidOrId, [options])](#balena.logs.history) ⇒ <code>Promise</code>
        * [.LogSubscription](#balena.logs.LogSubscription) : <code>EventEmitter</code>
            * [.unsubscribe()](#balena.logs.LogSubscription.unsubscribe)
            * ["line"](#balena.logs.LogSubscription.event_line)
            * ["error"](#balena.logs.LogSubscription.event_error)
    * [.settings](#balena.settings) : <code>object</code>
        * [.get([key])](#balena.settings.get) ⇒ <code>Promise</code>
        * [.getAll()](#balena.settings.getAll) ⇒ <code>Promise</code>

<a name="balena.interceptors"></a>

### balena.interceptors : <code>Array.&lt;Interceptor&gt;</code>
The current array of interceptors to use. Interceptors intercept requests made
internally and are executed in the order they appear in this array for requests,
and in the reverse order for responses.

**Kind**: static property of [<code>balena</code>](#balena)  
**Summary**: Array of interceptors  
**Access**: public  
**Example**  
```js
balena.interceptors.push({
	responseError: function (error) {
		console.log(error);
		throw error;
	})
});
```
<a name="balena.interceptors.Interceptor"></a>

#### interceptors.Interceptor : <code>object</code>
An interceptor implements some set of the four interception hook callbacks.
To continue processing, each function should return a value or a promise that
successfully resolves to a value.

To halt processing, each function should throw an error or return a promise that
rejects with an error.

**Kind**: static typedef of [<code>interceptors</code>](#balena.interceptors)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [request] | <code>function</code> | Callback invoked before requests are made. Called with the request options, should return (or resolve to) new request options, or throw/reject. |
| [response] | <code>function</code> | Callback invoked before responses are returned. Called with the response, should return (or resolve to) a new response, or throw/reject. |
| [requestError] | <code>function</code> | Callback invoked if an error happens before a request. Called with the error itself, caused by a preceeding request interceptor rejecting/throwing an error for the request, or a failing in preflight token validation. Should return (or resolve to) new request options, or throw/reject. |
| [responseError] | <code>function</code> | Callback invoked if an error happens in the response. Called with the error itself, caused by a preceeding response interceptor rejecting/throwing an error for the request, a network error, or an error response from the server. Should return (or resolve to) a new response, or throw/reject. |

<a name="balena.request"></a>

### balena.request : <code>Object</code>
The balena-request instance used internally. This should not be necessary
in normal usage, but can be useful if you want to make an API request directly,
using the same token and hooks as the SDK.

**Kind**: static property of [<code>balena</code>](#balena)  
**Summary**: Balena request instance  
**Access**: public  
**Example**  
```js
balena.request.send({ url: 'http://api.balena-cloud.com/ping' });
```
<a name="balena.pine"></a>

### balena.pine : <code>Object</code>
The balena-pine instance used internally. This should not be necessary
in normal usage, but can be useful if you want to directly make pine
queries to the api for some resource that isn't directly supported
in the SDK.

**Kind**: static property of [<code>balena</code>](#balena)  
**Summary**: Balena pine instance  
**Access**: public  
**Example**  
```js
balena.pine.get({
	resource: 'release',
	options: {
		$count: {
			$filter: { belongs_to__application: applicationId }
		}
	}
});
```
<a name="balena.errors"></a>

### balena.errors : <code>Object</code>
The balena-errors module used internally. This is provided primarily for
convenience, and to avoid the necessity for separate balena-errors
dependencies. You'll want to use this if you need to match on the specific
type of error thrown by the SDK.

**Kind**: static property of [<code>balena</code>](#balena)  
**Summary**: Balena errors module  
**Access**: public  
**Example**  
```js
balena.models.device.get(123).catch(function (error) {
  if (error.code === balena.errors.BalenaDeviceNotFound.code) {
    ...
  } else if (error.code === balena.errors.BalenaRequestError.code) {
    ...
  }
});
```
<a name="balena.models"></a>

### balena.models : <code>object</code>
**Kind**: static namespace of [<code>balena</code>](#balena)  

* [.models](#balena.models) : <code>object</code>
    * [.application](#balena.models.application) : <code>object</code>
        * [.tags](#balena.models.application.tags) : <code>object</code>
            * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.tags.getAllByApplication) ⇒ <code>Promise</code>
            * [.getAll([options])](#balena.models.application.tags.getAll) ⇒ <code>Promise</code>
            * [.set(nameOrSlugOrId, tagKey, value)](#balena.models.application.tags.set) ⇒ <code>Promise</code>
            * [.remove(nameOrSlugOrId, tagKey)](#balena.models.application.tags.remove) ⇒ <code>Promise</code>
        * [.configVar](#balena.models.application.configVar) : <code>object</code>
            * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.configVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(nameOrSlugOrId, key)](#balena.models.application.configVar.get) ⇒ <code>Promise</code>
            * [.set(nameOrSlugOrId, key, value)](#balena.models.application.configVar.set) ⇒ <code>Promise</code>
            * [.remove(nameOrSlugOrId, key)](#balena.models.application.configVar.remove) ⇒ <code>Promise</code>
        * [.envVar](#balena.models.application.envVar) : <code>object</code>
            * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.envVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(nameOrSlugOrId, key)](#balena.models.application.envVar.get) ⇒ <code>Promise</code>
            * [.set(nameOrSlugOrId, key, value)](#balena.models.application.envVar.set) ⇒ <code>Promise</code>
            * [.remove(nameOrSlugOrId, key)](#balena.models.application.envVar.remove) ⇒ <code>Promise</code>
        * [.buildVar](#balena.models.application.buildVar) : <code>object</code>
            * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.buildVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(nameOrSlugOrId, key)](#balena.models.application.buildVar.get) ⇒ <code>Promise</code>
            * [.set(nameOrSlugOrId, key, value)](#balena.models.application.buildVar.set) ⇒ <code>Promise</code>
            * [.remove(nameOrSlugOrId, key)](#balena.models.application.buildVar.remove) ⇒ <code>Promise</code>
        * [.membership](#balena.models.application.membership) : <code>object</code>
            * [.get(membershipId, [options])](#balena.models.application.membership.get) ⇒ <code>Promise</code>
            * [.getAll([options])](#balena.models.application.membership.getAll) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.membership.getAllByApplication) ⇒ <code>Promise</code>
            * [.create(options)](#balena.models.application.membership.create) ⇒ <code>Promise</code>
            * [.changeRole(idOrUniqueKey, roleName)](#balena.models.application.membership.changeRole) ⇒ <code>Promise</code>
            * [.remove(idOrUniqueKey)](#balena.models.application.membership.remove) ⇒ <code>Promise</code>
        * [.invite](#balena.models.application.invite) : <code>object</code>
            * [.getAll([options])](#balena.models.application.invite.getAll) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.invite.getAllByApplication) ⇒ <code>Promise</code>
            * [.create(nameOrSlugOrId, options, [message])](#balena.models.application.invite.create) ⇒ <code>Promise</code>
            * [.revoke(id)](#balena.models.application.invite.revoke) ⇒ <code>Promise</code>
            * [.accept(invitationToken)](#balena.models.application.invite.accept) ⇒ <code>Promise</code>
        * [.getDashboardUrl(id)](#balena.models.application.getDashboardUrl) ⇒ <code>String</code>
        * [.getAll([options])](#balena.models.application.getAll) ⇒ <code>Promise</code>
        * ~~[.getAllWithDeviceServiceDetails([options])](#balena.models.application.getAllWithDeviceServiceDetails) ⇒ <code>Promise</code>~~
        * [.get(nameOrSlugOrId, [options])](#balena.models.application.get) ⇒ <code>Promise</code>
        * [.getWithDeviceServiceDetails(nameOrSlugOrId, [options])](#balena.models.application.getWithDeviceServiceDetails) ⇒ <code>Promise</code>
        * [.getAppByName(appName, [options])](#balena.models.application.getAppByName) ⇒ <code>Promise</code>
        * [.getAppByOwner(appName, owner, [options])](#balena.models.application.getAppByOwner) ⇒ <code>Promise</code>
        * [.has(nameOrSlugOrId)](#balena.models.application.has) ⇒ <code>Promise</code>
        * [.hasAny()](#balena.models.application.hasAny) ⇒ <code>Promise</code>
        * [.create(options)](#balena.models.application.create) ⇒ <code>Promise</code>
        * [.remove(nameOrSlugOrId)](#balena.models.application.remove) ⇒ <code>Promise</code>
        * [.rename(nameOrSlugOrId, newName)](#balena.models.application.rename) ⇒ <code>Promise</code>
        * [.restart(nameOrSlugOrId)](#balena.models.application.restart) ⇒ <code>Promise</code>
        * ~~[.generateApiKey(nameOrSlugOrId)](#balena.models.application.generateApiKey) ⇒ <code>Promise</code>~~
        * [.generateProvisioningKey(nameOrSlugOrId)](#balena.models.application.generateProvisioningKey) ⇒ <code>Promise</code>
        * [.purge(appId)](#balena.models.application.purge) ⇒ <code>Promise</code>
        * [.shutdown(appId, [options])](#balena.models.application.shutdown) ⇒ <code>Promise</code>
        * [.reboot(appId, [options])](#balena.models.application.reboot) ⇒ <code>Promise</code>
        * [.willTrackNewReleases(nameOrSlugOrId)](#balena.models.application.willTrackNewReleases) ⇒ <code>Promise</code>
        * [.isTrackingLatestRelease(nameOrSlugOrId)](#balena.models.application.isTrackingLatestRelease) ⇒ <code>Promise</code>
        * [.pinToRelease(nameOrSlugOrId, fullReleaseHash)](#balena.models.application.pinToRelease) ⇒ <code>Promise</code>
        * [.getTargetReleaseHash(nameOrSlugOrId)](#balena.models.application.getTargetReleaseHash) ⇒ <code>Promise</code>
        * [.trackLatestRelease(nameOrSlugOrId)](#balena.models.application.trackLatestRelease) ⇒ <code>Promise</code>
        * [.enableDeviceUrls(nameOrSlugOrId)](#balena.models.application.enableDeviceUrls) ⇒ <code>Promise</code>
        * [.disableDeviceUrls(nameOrSlugOrId)](#balena.models.application.disableDeviceUrls) ⇒ <code>Promise</code>
        * [.grantSupportAccess(nameOrSlugOrId, expiryTimestamp)](#balena.models.application.grantSupportAccess) ⇒ <code>Promise</code>
        * [.revokeSupportAccess(nameOrSlugOrId)](#balena.models.application.revokeSupportAccess) ⇒ <code>Promise</code>
    * [.device](#balena.models.device) : <code>object</code>
        * [.tags](#balena.models.device.tags) : <code>object</code>
            * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.tags.getAllByApplication) ⇒ <code>Promise</code>
            * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.tags.getAllByDevice) ⇒ <code>Promise</code>
            * [.getAll([options])](#balena.models.device.tags.getAll) ⇒ <code>Promise</code>
            * [.set(uuidOrId, tagKey, value)](#balena.models.device.tags.set) ⇒ <code>Promise</code>
            * [.remove(uuidOrId, tagKey)](#balena.models.device.tags.remove) ⇒ <code>Promise</code>
        * [.configVar](#balena.models.device.configVar) : <code>object</code>
            * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.configVar.getAllByDevice) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.configVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(uuidOrId, key)](#balena.models.device.configVar.get) ⇒ <code>Promise</code>
            * [.set(uuidOrId, key, value)](#balena.models.device.configVar.set) ⇒ <code>Promise</code>
            * [.remove(uuidOrId, key)](#balena.models.device.configVar.remove) ⇒ <code>Promise</code>
        * [.envVar](#balena.models.device.envVar) : <code>object</code>
            * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.envVar.getAllByDevice) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.envVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(uuidOrId, key)](#balena.models.device.envVar.get) ⇒ <code>Promise</code>
            * [.set(uuidOrId, key, value)](#balena.models.device.envVar.set) ⇒ <code>Promise</code>
            * [.remove(uuidOrId, key)](#balena.models.device.envVar.remove) ⇒ <code>Promise</code>
        * [.serviceVar](#balena.models.device.serviceVar) : <code>object</code>
            * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.serviceVar.getAllByDevice) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.serviceVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(uuidOrId, id, key)](#balena.models.device.serviceVar.get) ⇒ <code>Promise</code>
            * [.set(uuidOrId, id, key, value)](#balena.models.device.serviceVar.set) ⇒ <code>Promise</code>
            * [.remove(uuidOrId, id, key)](#balena.models.device.serviceVar.remove) ⇒ <code>Promise</code>
        * [.getDashboardUrl(uuid)](#balena.models.device.getDashboardUrl) ⇒ <code>String</code>
        * [.getAll([options])](#balena.models.device.getAll) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByParentDevice(parentUuidOrId, [options])](#balena.models.device.getAllByParentDevice) ⇒ <code>Promise</code>
        * [.get(uuidOrId, [options])](#balena.models.device.get) ⇒ <code>Promise</code>
        * [.getWithServiceDetails(uuidOrId, [options])](#balena.models.device.getWithServiceDetails) ⇒ <code>Promise</code>
        * [.getByName(name)](#balena.models.device.getByName) ⇒ <code>Promise</code>
        * [.getName(uuidOrId)](#balena.models.device.getName) ⇒ <code>Promise</code>
        * [.getApplicationName(uuidOrId)](#balena.models.device.getApplicationName) ⇒ <code>Promise</code>
        * [.has(uuidOrId)](#balena.models.device.has) ⇒ <code>Promise</code>
        * [.isOnline(uuidOrId)](#balena.models.device.isOnline) ⇒ <code>Promise</code>
        * [.getLocalIPAddresses(uuidOrId)](#balena.models.device.getLocalIPAddresses) ⇒ <code>Promise</code>
        * [.getMACAddresses(uuidOrId)](#balena.models.device.getMACAddresses) ⇒ <code>Promise</code>
        * [.getMetrics(uuidOrId)](#balena.models.device.getMetrics) ⇒ <code>Promise</code>
        * [.remove(uuidOrId)](#balena.models.device.remove) ⇒ <code>Promise</code>
        * [.deactivate(uuidOrId)](#balena.models.device.deactivate) ⇒ <code>Promise</code>
        * [.rename(uuidOrId, newName)](#balena.models.device.rename) ⇒ <code>Promise</code>
        * [.note(uuidOrId, note)](#balena.models.device.note) ⇒ <code>Promise</code>
        * [.setCustomLocation(uuidOrId, location)](#balena.models.device.setCustomLocation) ⇒ <code>Promise</code>
        * [.unsetCustomLocation(uuidOrId)](#balena.models.device.unsetCustomLocation) ⇒ <code>Promise</code>
        * [.move(uuidOrId, applicationNameOrSlugOrId)](#balena.models.device.move) ⇒ <code>Promise</code>
        * [.restartApplication(uuidOrId)](#balena.models.device.restartApplication) ⇒ <code>Promise</code>
        * [.getSupervisorTargetState(uuidOrId)](#balena.models.device.getSupervisorTargetState) ⇒ <code>Promise</code>
        * ~~[.getDisplayName(deviceTypeSlug)](#balena.models.device.getDisplayName) ⇒ <code>Promise</code>~~
        * ~~[.getDeviceSlug(deviceTypeName)](#balena.models.device.getDeviceSlug) ⇒ <code>Promise</code>~~
        * ~~[.getSupportedDeviceTypes()](#balena.models.device.getSupportedDeviceTypes) ⇒ <code>Promise</code>~~
        * ~~[.getManifestBySlug(slugOrName)](#balena.models.device.getManifestBySlug) ⇒ <code>Promise</code>~~
        * [.getManifestByApplication(nameOrSlugOrId)](#balena.models.device.getManifestByApplication) ⇒ <code>Promise</code>
        * [.generateUniqueKey()](#balena.models.device.generateUniqueKey) ⇒ <code>String</code>
        * [.register(applicationNameOrSlugOrId, uuid)](#balena.models.device.register) ⇒ <code>Promise</code>
        * [.generateDeviceKey(uuidOrId)](#balena.models.device.generateDeviceKey) ⇒ <code>Promise</code>
        * [.hasDeviceUrl(uuidOrId)](#balena.models.device.hasDeviceUrl) ⇒ <code>Promise</code>
        * [.getDeviceUrl(uuidOrId)](#balena.models.device.getDeviceUrl) ⇒ <code>Promise</code>
        * [.enableDeviceUrl(uuidOrId)](#balena.models.device.enableDeviceUrl) ⇒ <code>Promise</code>
        * [.disableDeviceUrl(uuidOrId)](#balena.models.device.disableDeviceUrl) ⇒ <code>Promise</code>
        * [.enableLocalMode(uuidOrId)](#balena.models.device.enableLocalMode) ⇒ <code>Promise</code>
        * [.disableLocalMode(uuidOrId)](#balena.models.device.disableLocalMode) ⇒ <code>Promise</code>
        * [.isInLocalMode(uuidOrId)](#balena.models.device.isInLocalMode) ⇒ <code>Promise</code>
        * [.getLocalModeSupport(device)](#balena.models.device.getLocalModeSupport) ⇒ <code>Object</code>
        * [.enableLockOverride(uuidOrId)](#balena.models.device.enableLockOverride) ⇒ <code>Promise</code>
        * [.disableLockOverride(uuidOrId)](#balena.models.device.disableLockOverride) ⇒ <code>Promise</code>
        * [.hasLockOverride(uuidOrId)](#balena.models.device.hasLockOverride) ⇒ <code>Promise</code>
        * [.getStatus(uuidOrId)](#balena.models.device.getStatus) ⇒ <code>Promise</code>
        * [.getProgress(uuidOrId)](#balena.models.device.getProgress) ⇒ <code>Promise</code>
        * [.grantSupportAccess(uuidOrId, expiryTimestamp)](#balena.models.device.grantSupportAccess) ⇒ <code>Promise</code>
        * [.revokeSupportAccess(uuidOrId)](#balena.models.device.revokeSupportAccess) ⇒ <code>Promise</code>
        * [.lastOnline(device)](#balena.models.device.lastOnline) ⇒ <code>String</code>
        * [.getOsVersion(device)](#balena.models.device.getOsVersion) ⇒ <code>String</code>
        * [.isTrackingApplicationRelease(uuidOrId)](#balena.models.device.isTrackingApplicationRelease) ⇒ <code>Promise</code>
        * [.getTargetReleaseHash(uuidOrId)](#balena.models.device.getTargetReleaseHash) ⇒ <code>Promise</code>
        * [.pinToRelease(uuidOrId, fullReleaseHashOrId)](#balena.models.device.pinToRelease) ⇒ <code>Promise</code>
        * [.setSupervisorRelease(uuidOrId, supervisorVersionOrId)](#balena.models.device.setSupervisorRelease) ⇒ <code>Promise</code>
        * [.trackApplicationRelease(uuidOrId)](#balena.models.device.trackApplicationRelease) ⇒ <code>Promise</code>
        * [.startOsUpdate(uuid, targetOsVersion)](#balena.models.device.startOsUpdate) ⇒ <code>Promise</code>
        * [.getOsUpdateStatus(uuid)](#balena.models.device.getOsUpdateStatus) ⇒ <code>Promise</code>
        * [.ping(uuidOrId)](#balena.models.device.ping) ⇒ <code>Promise</code>
        * ~~[.getApplicationInfo(uuidOrId)](#balena.models.device.getApplicationInfo) ⇒ <code>Promise</code>~~
        * [.identify(uuidOrId)](#balena.models.device.identify) ⇒ <code>Promise</code>
        * ~~[.startApplication(uuidOrId)](#balena.models.device.startApplication) ⇒ <code>Promise</code>~~
        * ~~[.stopApplication(uuidOrId)](#balena.models.device.stopApplication) ⇒ <code>Promise</code>~~
        * [.reboot(uuidOrId, [options])](#balena.models.device.reboot) ⇒ <code>Promise</code>
        * [.shutdown(uuidOrId, [options])](#balena.models.device.shutdown) ⇒ <code>Promise</code>
        * [.purge(uuidOrId)](#balena.models.device.purge) ⇒ <code>Promise</code>
        * [.update(uuidOrId, [options])](#balena.models.device.update) ⇒ <code>Promise</code>
        * [.getSupervisorState(uuidOrId)](#balena.models.device.getSupervisorState) ⇒ <code>Promise</code>
        * [.startService(uuidOrId, imageId)](#balena.models.device.startService) ⇒ <code>Promise</code>
        * [.stopService(uuidOrId, imageId)](#balena.models.device.stopService) ⇒ <code>Promise</code>
        * [.restartService(uuidOrId, imageId)](#balena.models.device.restartService) ⇒ <code>Promise</code>
    * [.deviceType](#balena.models.deviceType) : <code>object</code>
        * [.get(idOrSlug, [options])](#balena.models.deviceType.get) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.deviceType.getAll) ⇒ <code>Promise</code>
        * [.getAllSupported([options])](#balena.models.deviceType.getAllSupported) ⇒ <code>Promise</code>
        * [.getBySlugOrName(slugOrName)](#balena.models.deviceType.getBySlugOrName) ⇒ <code>Promise</code>
        * [.getName(deviceTypeSlug)](#balena.models.deviceType.getName) ⇒ <code>Promise</code>
        * [.getInterpolatedPartials(deviceTypeSlug, initial)](#balena.models.deviceType.getInterpolatedPartials) ⇒ <code>Promise</code>
        * [.getInstructions(deviceTypeSlug)](#balena.models.deviceType.getInstructions) ⇒ <code>Promise</code>
        * [.getSlugByName(deviceTypeName)](#balena.models.deviceType.getSlugByName) ⇒ <code>Promise</code>
    * [.apiKey](#balena.models.apiKey) : <code>object</code>
        * [.create(name, [description])](#balena.models.apiKey.create) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.apiKey.getAll) ⇒ <code>Promise</code>
        * [.getAllNamedUserApiKeys([options])](#balena.models.apiKey.getAllNamedUserApiKeys) ⇒ <code>Promise</code>
        * [.getProvisioningApiKeysByApplication(nameOrSlugOrId, [options])](#balena.models.apiKey.getProvisioningApiKeysByApplication) ⇒ <code>Promise</code>
        * [.update(id, apiKeyInfo)](#balena.models.apiKey.update) ⇒ <code>Promise</code>
        * [.revoke(id)](#balena.models.apiKey.revoke) ⇒ <code>Promise</code>
    * [.key](#balena.models.key) : <code>object</code>
        * [.getAll([options])](#balena.models.key.getAll) ⇒ <code>Promise</code>
        * [.get(id)](#balena.models.key.get) ⇒ <code>Promise</code>
        * [.remove(id)](#balena.models.key.remove) ⇒ <code>Promise</code>
        * [.create(title, key)](#balena.models.key.create) ⇒ <code>Promise</code>
    * [.organization](#balena.models.organization) : <code>object</code>
        * [.membership](#balena.models.organization.membership) : <code>object</code>
            * [.get(membershipId, [options])](#balena.models.organization.membership.get) ⇒ <code>Promise</code>
            * [.getAll([options])](#balena.models.organization.membership.getAll) ⇒ <code>Promise</code>
            * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.membership.getAllByOrganization) ⇒ <code>Promise</code>
            * [.create(options)](#balena.models.organization.membership.create) ⇒ <code>Promise</code>
            * [.changeRole(idOrUniqueKey, roleName)](#balena.models.organization.membership.changeRole) ⇒ <code>Promise</code>
            * [.remove(id)](#balena.models.organization.membership.remove) ⇒ <code>Promise</code>
        * [.invite](#balena.models.organization.invite) : <code>object</code>
            * [.getAll([options])](#balena.models.organization.invite.getAll) ⇒ <code>Promise</code>
            * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.invite.getAllByOrganization) ⇒ <code>Promise</code>
            * [.create(handleOrId, options, [message])](#balena.models.organization.invite.create) ⇒ <code>Promise</code>
            * [.revoke(id)](#balena.models.organization.invite.revoke) ⇒ <code>Promise</code>
            * [.accept(invitationToken)](#balena.models.organization.invite.accept) ⇒ <code>Promise</code>
        * [.create(options)](#balena.models.organization.create) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.organization.getAll) ⇒ <code>Promise</code>
        * [.get(handleOrId, [options])](#balena.models.organization.get) ⇒ <code>Promise</code>
        * [.remove(handleOrId)](#balena.models.organization.remove) ⇒ <code>Promise</code>
    * [.os](#balena.models.os) : <code>object</code>
        * [.getDownloadSize(deviceType, [version])](#balena.models.os.getDownloadSize) ⇒ <code>Promise</code>
        * [.getSupportedVersions(deviceType)](#balena.models.os.getSupportedVersions) ⇒ <code>Promise</code>
        * [.getMaxSatisfyingVersion(deviceType, versionOrRange)](#balena.models.os.getMaxSatisfyingVersion) ⇒ <code>Promise</code>
        * [.getLastModified(deviceType, [version])](#balena.models.os.getLastModified) ⇒ <code>Promise</code>
        * [.download(deviceType, [version])](#balena.models.os.download) ⇒ <code>Promise</code>
        * [.getConfig(nameOrSlugOrId, options)](#balena.models.os.getConfig) ⇒ <code>Promise</code>
        * [.isSupportedOsUpdate(deviceType, currentVersion, targetVersion)](#balena.models.os.isSupportedOsUpdate) ⇒ <code>Promise</code>
        * [.getSupportedOsUpdateVersions(deviceType, currentVersion)](#balena.models.os.getSupportedOsUpdateVersions) ⇒ <code>Promise</code>
        * [.isArchitectureCompatibleWith(osArchitecture, applicationArchitecture)](#balena.models.os.isArchitectureCompatibleWith) ⇒ <code>Boolean</code>
    * [.hostapp](#balena.models.hostapp) : <code>object</code>
        * [.getAllOsVersions(deviceTypes)](#balena.models.hostapp.getAllOsVersions) ⇒ <code>Promise</code>
    * [.config](#balena.models.config) : <code>object</code>
        * [.getAll()](#balena.models.config.getAll) ⇒ <code>Promise</code>
        * ~~[.getDeviceTypes()](#balena.models.config.getDeviceTypes) ⇒ <code>Promise</code>~~
        * [.getDeviceOptions(deviceType)](#balena.models.config.getDeviceOptions) ⇒ <code>Promise</code>
    * [.release](#balena.models.release) : <code>object</code>
        * [.tags](#balena.models.release.tags) : <code>object</code>
            * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.release.tags.getAllByApplication) ⇒ <code>Promise</code>
            * [.getAllByRelease(commitOrId, [options])](#balena.models.release.tags.getAllByRelease) ⇒ <code>Promise</code>
            * [.getAll([options])](#balena.models.release.tags.getAll) ⇒ <code>Promise</code>
            * [.set(commitOrId, tagKey, value)](#balena.models.release.tags.set) ⇒ <code>Promise</code>
            * [.remove(commitOrId, tagKey)](#balena.models.release.tags.remove) ⇒ <code>Promise</code>
        * [.get(commitOrId, [options])](#balena.models.release.get) ⇒ <code>Promise</code>
        * [.getWithImageDetails(commitOrId, [options])](#balena.models.release.getWithImageDetails) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.release.getAllByApplication) ⇒ <code>Promise</code>
        * [.getLatestByApplication(nameOrSlugOrId, [options])](#balena.models.release.getLatestByApplication) ⇒ <code>Promise</code>
        * [.createFromUrl(nameOrSlugOrId, urlDeployOptions)](#balena.models.release.createFromUrl) ⇒ <code>Promise</code>
    * [.service](#balena.models.service) : <code>object</code>
        * [.var](#balena.models.service.var) : <code>object</code>
            * [.getAllByService(id, [options])](#balena.models.service.var.getAllByService) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.service.var.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(id, key)](#balena.models.service.var.get) ⇒ <code>Promise</code>
            * [.set(id, key, value)](#balena.models.service.var.set) ⇒ <code>Promise</code>
            * [.remove(id, key)](#balena.models.service.var.remove) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.service.getAllByApplication) ⇒ <code>Promise</code>
    * [.image](#balena.models.image) : <code>object</code>
        * [.get(id, [options])](#balena.models.image.get) ⇒ <code>Promise</code>
        * [.getLogs(id)](#balena.models.image.getLogs) ⇒ <code>Promise</code>
    * [.billing](#balena.models.billing) : <code>object</code>
        * [.getAccount(organization)](#balena.models.billing.getAccount) ⇒ <code>Promise</code>
        * [.getPlan(organization)](#balena.models.billing.getPlan) ⇒ <code>Promise</code>
        * [.getBillingInfo(organization)](#balena.models.billing.getBillingInfo) ⇒ <code>Promise</code>
        * [.updateBillingInfo(organization, billingInfo)](#balena.models.billing.updateBillingInfo) ⇒ <code>Promise</code>
        * [.changePlan(organization, planChangeOptions)](#balena.models.billing.changePlan) ⇒ <code>Promise</code>
        * [.getInvoices(organization)](#balena.models.billing.getInvoices) ⇒ <code>Promise</code>
        * [.downloadInvoice(organization)](#balena.models.billing.downloadInvoice) ⇒ <code>Promise</code>

<a name="balena.models.application"></a>

#### models.application : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.application](#balena.models.application) : <code>object</code>
    * [.tags](#balena.models.application.tags) : <code>object</code>
        * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.tags.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.application.tags.getAll) ⇒ <code>Promise</code>
        * [.set(nameOrSlugOrId, tagKey, value)](#balena.models.application.tags.set) ⇒ <code>Promise</code>
        * [.remove(nameOrSlugOrId, tagKey)](#balena.models.application.tags.remove) ⇒ <code>Promise</code>
    * [.configVar](#balena.models.application.configVar) : <code>object</code>
        * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.configVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(nameOrSlugOrId, key)](#balena.models.application.configVar.get) ⇒ <code>Promise</code>
        * [.set(nameOrSlugOrId, key, value)](#balena.models.application.configVar.set) ⇒ <code>Promise</code>
        * [.remove(nameOrSlugOrId, key)](#balena.models.application.configVar.remove) ⇒ <code>Promise</code>
    * [.envVar](#balena.models.application.envVar) : <code>object</code>
        * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.envVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(nameOrSlugOrId, key)](#balena.models.application.envVar.get) ⇒ <code>Promise</code>
        * [.set(nameOrSlugOrId, key, value)](#balena.models.application.envVar.set) ⇒ <code>Promise</code>
        * [.remove(nameOrSlugOrId, key)](#balena.models.application.envVar.remove) ⇒ <code>Promise</code>
    * [.buildVar](#balena.models.application.buildVar) : <code>object</code>
        * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.buildVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(nameOrSlugOrId, key)](#balena.models.application.buildVar.get) ⇒ <code>Promise</code>
        * [.set(nameOrSlugOrId, key, value)](#balena.models.application.buildVar.set) ⇒ <code>Promise</code>
        * [.remove(nameOrSlugOrId, key)](#balena.models.application.buildVar.remove) ⇒ <code>Promise</code>
    * [.membership](#balena.models.application.membership) : <code>object</code>
        * [.get(membershipId, [options])](#balena.models.application.membership.get) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.application.membership.getAll) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.membership.getAllByApplication) ⇒ <code>Promise</code>
        * [.create(options)](#balena.models.application.membership.create) ⇒ <code>Promise</code>
        * [.changeRole(idOrUniqueKey, roleName)](#balena.models.application.membership.changeRole) ⇒ <code>Promise</code>
        * [.remove(idOrUniqueKey)](#balena.models.application.membership.remove) ⇒ <code>Promise</code>
    * [.invite](#balena.models.application.invite) : <code>object</code>
        * [.getAll([options])](#balena.models.application.invite.getAll) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.invite.getAllByApplication) ⇒ <code>Promise</code>
        * [.create(nameOrSlugOrId, options, [message])](#balena.models.application.invite.create) ⇒ <code>Promise</code>
        * [.revoke(id)](#balena.models.application.invite.revoke) ⇒ <code>Promise</code>
        * [.accept(invitationToken)](#balena.models.application.invite.accept) ⇒ <code>Promise</code>
    * [.getDashboardUrl(id)](#balena.models.application.getDashboardUrl) ⇒ <code>String</code>
    * [.getAll([options])](#balena.models.application.getAll) ⇒ <code>Promise</code>
    * ~~[.getAllWithDeviceServiceDetails([options])](#balena.models.application.getAllWithDeviceServiceDetails) ⇒ <code>Promise</code>~~
    * [.get(nameOrSlugOrId, [options])](#balena.models.application.get) ⇒ <code>Promise</code>
    * [.getWithDeviceServiceDetails(nameOrSlugOrId, [options])](#balena.models.application.getWithDeviceServiceDetails) ⇒ <code>Promise</code>
    * [.getAppByName(appName, [options])](#balena.models.application.getAppByName) ⇒ <code>Promise</code>
    * [.getAppByOwner(appName, owner, [options])](#balena.models.application.getAppByOwner) ⇒ <code>Promise</code>
    * [.has(nameOrSlugOrId)](#balena.models.application.has) ⇒ <code>Promise</code>
    * [.hasAny()](#balena.models.application.hasAny) ⇒ <code>Promise</code>
    * [.create(options)](#balena.models.application.create) ⇒ <code>Promise</code>
    * [.remove(nameOrSlugOrId)](#balena.models.application.remove) ⇒ <code>Promise</code>
    * [.rename(nameOrSlugOrId, newName)](#balena.models.application.rename) ⇒ <code>Promise</code>
    * [.restart(nameOrSlugOrId)](#balena.models.application.restart) ⇒ <code>Promise</code>
    * ~~[.generateApiKey(nameOrSlugOrId)](#balena.models.application.generateApiKey) ⇒ <code>Promise</code>~~
    * [.generateProvisioningKey(nameOrSlugOrId)](#balena.models.application.generateProvisioningKey) ⇒ <code>Promise</code>
    * [.purge(appId)](#balena.models.application.purge) ⇒ <code>Promise</code>
    * [.shutdown(appId, [options])](#balena.models.application.shutdown) ⇒ <code>Promise</code>
    * [.reboot(appId, [options])](#balena.models.application.reboot) ⇒ <code>Promise</code>
    * [.willTrackNewReleases(nameOrSlugOrId)](#balena.models.application.willTrackNewReleases) ⇒ <code>Promise</code>
    * [.isTrackingLatestRelease(nameOrSlugOrId)](#balena.models.application.isTrackingLatestRelease) ⇒ <code>Promise</code>
    * [.pinToRelease(nameOrSlugOrId, fullReleaseHash)](#balena.models.application.pinToRelease) ⇒ <code>Promise</code>
    * [.getTargetReleaseHash(nameOrSlugOrId)](#balena.models.application.getTargetReleaseHash) ⇒ <code>Promise</code>
    * [.trackLatestRelease(nameOrSlugOrId)](#balena.models.application.trackLatestRelease) ⇒ <code>Promise</code>
    * [.enableDeviceUrls(nameOrSlugOrId)](#balena.models.application.enableDeviceUrls) ⇒ <code>Promise</code>
    * [.disableDeviceUrls(nameOrSlugOrId)](#balena.models.application.disableDeviceUrls) ⇒ <code>Promise</code>
    * [.grantSupportAccess(nameOrSlugOrId, expiryTimestamp)](#balena.models.application.grantSupportAccess) ⇒ <code>Promise</code>
    * [.revokeSupportAccess(nameOrSlugOrId)](#balena.models.application.revokeSupportAccess) ⇒ <code>Promise</code>

<a name="balena.models.application.tags"></a>

##### application.tags : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.tags](#balena.models.application.tags) : <code>object</code>
    * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.tags.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.application.tags.getAll) ⇒ <code>Promise</code>
    * [.set(nameOrSlugOrId, tagKey, value)](#balena.models.application.tags.set) ⇒ <code>Promise</code>
    * [.remove(nameOrSlugOrId, tagKey)](#balena.models.application.tags.remove) ⇒ <code>Promise</code>

<a name="balena.models.application.tags.getAllByApplication"></a>

###### tags.getAllByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.application.tags)  
**Summary**: Get all application tags for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.tags.getAllByApplication('MyApp').then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.application.tags.getAllByApplication(999999).then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.application.tags.getAllByApplication('MyApp', function(error, tags) {
	if (error) throw error;
	console.log(tags)
});
```
<a name="balena.models.application.tags.getAll"></a>

###### tags.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.application.tags)  
**Summary**: Get all application tags  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.tags.getAll().then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.application.tags.getAll(function(error, tags) {
	if (error) throw error;
	console.log(tags)
});
```
<a name="balena.models.application.tags.set"></a>

###### tags.set(nameOrSlugOrId, tagKey, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.application.tags)  
**Summary**: Set an application tag  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |
| tagKey | <code>String</code> | tag key |
| value | <code>String</code> \| <code>undefined</code> | tag value |

**Example**  
```js
balena.models.application.tags.set('myorganization/myapp', 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.application.tags.set(123, 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.application.tags.set('myorganization/myapp', 'EDITOR', 'vim', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.tags.remove"></a>

###### tags.remove(nameOrSlugOrId, tagKey) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.application.tags)  
**Summary**: Remove an application tag  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |
| tagKey | <code>String</code> | tag key |

**Example**  
```js
balena.models.application.tags.remove('myorganization/myapp', 'EDITOR');
```
**Example**  
```js
balena.models.application.tags.remove('myorganization/myapp', 'EDITOR', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.configVar"></a>

##### application.configVar : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.configVar](#balena.models.application.configVar) : <code>object</code>
    * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.configVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(nameOrSlugOrId, key)](#balena.models.application.configVar.get) ⇒ <code>Promise</code>
    * [.set(nameOrSlugOrId, key, value)](#balena.models.application.configVar.set) ⇒ <code>Promise</code>
    * [.remove(nameOrSlugOrId, key)](#balena.models.application.configVar.remove) ⇒ <code>Promise</code>

<a name="balena.models.application.configVar.getAllByApplication"></a>

###### configVar.getAllByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.application.configVar)  
**Summary**: Get all config variables for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application config variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.configVar.getAllByApplication('MyApp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.application.configVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.application.configVar.getAllByApplication('MyApp', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.application.configVar.get"></a>

###### configVar.get(nameOrSlugOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.application.configVar)  
**Summary**: Get the value of a specific config variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the config variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |
| key | <code>String</code> | config variable name |

**Example**  
```js
balena.models.application.configVar.get('MyApp', 'BALENA_VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.application.configVar.get(999999, 'BALENA_VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.application.configVar.get('MyApp', 'BALENA_VAR', function(error, value) {
	if (error) throw error;
	console.log(value)
});
```
<a name="balena.models.application.configVar.set"></a>

###### configVar.set(nameOrSlugOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.application.configVar)  
**Summary**: Set the value of a specific config variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |
| key | <code>String</code> | config variable name |
| value | <code>String</code> | config variable value |

**Example**  
```js
balena.models.application.configVar.set('MyApp', 'BALENA_VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.configVar.set(999999, 'BALENA_VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.configVar.set('MyApp', 'BALENA_VAR', 'newvalue', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.application.configVar.remove"></a>

###### configVar.remove(nameOrSlugOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.application.configVar)  
**Summary**: Clear the value of a specific config variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |
| key | <code>String</code> | config variable name |

**Example**  
```js
balena.models.application.configVar.remove('MyApp', 'BALENA_VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.configVar.remove(999999, 'BALENA_VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.configVar.remove('MyApp', 'BALENA_VAR', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.application.envVar"></a>

##### application.envVar : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.envVar](#balena.models.application.envVar) : <code>object</code>
    * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.envVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(nameOrSlugOrId, key)](#balena.models.application.envVar.get) ⇒ <code>Promise</code>
    * [.set(nameOrSlugOrId, key, value)](#balena.models.application.envVar.set) ⇒ <code>Promise</code>
    * [.remove(nameOrSlugOrId, key)](#balena.models.application.envVar.remove) ⇒ <code>Promise</code>

<a name="balena.models.application.envVar.getAllByApplication"></a>

###### envVar.getAllByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.application.envVar)  
**Summary**: Get all environment variables for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application environment variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.envVar.getAllByApplication('MyApp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.application.envVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.application.envVar.getAllByApplication('MyApp', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.application.envVar.get"></a>

###### envVar.get(nameOrSlugOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.application.envVar)  
**Summary**: Get the value of a specific environment variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the environment variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |
| key | <code>String</code> | environment variable name |

**Example**  
```js
balena.models.application.envVar.get('MyApp', 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.application.envVar.get(999999, 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.application.envVar.get('MyApp', 'VAR', function(error, value) {
	if (error) throw error;
	console.log(value)
});
```
<a name="balena.models.application.envVar.set"></a>

###### envVar.set(nameOrSlugOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.application.envVar)  
**Summary**: Set the value of a specific environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |
| key | <code>String</code> | environment variable name |
| value | <code>String</code> | environment variable value |

**Example**  
```js
balena.models.application.envVar.set('MyApp', 'VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.envVar.set(999999, 'VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.envVar.set('MyApp', 'VAR', 'newvalue', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.application.envVar.remove"></a>

###### envVar.remove(nameOrSlugOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.application.envVar)  
**Summary**: Clear the value of a specific environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |
| key | <code>String</code> | environment variable name |

**Example**  
```js
balena.models.application.envVar.remove('MyApp', 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.envVar.remove(999999, 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.envVar.remove('MyApp', 'VAR', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.application.buildVar"></a>

##### application.buildVar : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.buildVar](#balena.models.application.buildVar) : <code>object</code>
    * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.buildVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(nameOrSlugOrId, key)](#balena.models.application.buildVar.get) ⇒ <code>Promise</code>
    * [.set(nameOrSlugOrId, key, value)](#balena.models.application.buildVar.set) ⇒ <code>Promise</code>
    * [.remove(nameOrSlugOrId, key)](#balena.models.application.buildVar.remove) ⇒ <code>Promise</code>

<a name="balena.models.application.buildVar.getAllByApplication"></a>

###### buildVar.getAllByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>buildVar</code>](#balena.models.application.buildVar)  
**Summary**: Get all build environment variables for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application build environment variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.buildVar.getAllByApplication('MyApp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.application.buildVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.application.buildVar.getAllByApplication('MyApp', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.application.buildVar.get"></a>

###### buildVar.get(nameOrSlugOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>buildVar</code>](#balena.models.application.buildVar)  
**Summary**: Get the value of a specific build environment variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the build environment variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |
| key | <code>String</code> | build environment variable name |

**Example**  
```js
balena.models.application.buildVar.get('MyApp', 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.application.buildVar.get(999999, 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.application.buildVar.get('MyApp', 'VAR', function(error, value) {
	if (error) throw error;
	console.log(value)
});
```
<a name="balena.models.application.buildVar.set"></a>

###### buildVar.set(nameOrSlugOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>buildVar</code>](#balena.models.application.buildVar)  
**Summary**: Set the value of a specific build environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |
| key | <code>String</code> | build environment variable name |
| value | <code>String</code> | build environment variable value |

**Example**  
```js
balena.models.application.buildVar.set('MyApp', 'VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.buildVar.set(999999, 'VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.buildVar.set('MyApp', 'VAR', 'newvalue', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.application.buildVar.remove"></a>

###### buildVar.remove(nameOrSlugOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>buildVar</code>](#balena.models.application.buildVar)  
**Summary**: Clear the value of a specific build environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |
| key | <code>String</code> | build environment variable name |

**Example**  
```js
balena.models.application.buildVar.remove('MyApp', 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.buildVar.remove(999999, 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.buildVar.remove('MyApp', 'VAR', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.application.membership"></a>

##### application.membership : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.membership](#balena.models.application.membership) : <code>object</code>
    * [.get(membershipId, [options])](#balena.models.application.membership.get) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.application.membership.getAll) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.membership.getAllByApplication) ⇒ <code>Promise</code>
    * [.create(options)](#balena.models.application.membership.create) ⇒ <code>Promise</code>
    * [.changeRole(idOrUniqueKey, roleName)](#balena.models.application.membership.changeRole) ⇒ <code>Promise</code>
    * [.remove(idOrUniqueKey)](#balena.models.application.membership.remove) ⇒ <code>Promise</code>

<a name="balena.models.application.membership.get"></a>

###### membership.get(membershipId, [options]) ⇒ <code>Promise</code>
This method returns a single application membership.

**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Get a single application membership  
**Access**: public  
**Fulfil**: <code>Object</code> - application membership  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| membershipId | <code>number</code> \| <code>Object</code> |  | the id or an object with the unique `user` & `is_member_of__application` numeric pair of the membership |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.membership.get(5).then(function(memberships) {
	console.log(memberships);
});
```
**Example**  
```js
balena.models.application.membership.get(5, function(error, memberships) {
	console.log(memberships);
});
```
<a name="balena.models.application.membership.getAll"></a>

###### membership.getAll([options]) ⇒ <code>Promise</code>
This method returns all application memberships.

**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Get all application memberships  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application memberships  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.membership.getAll().then(function(memberships) {
	console.log(memberships);
});
```
**Example**  
```js
balena.models.application.membership.getAll(function(error, memberships) {
	console.log(memberships);
});
```
<a name="balena.models.application.membership.getAllByApplication"></a>

###### membership.getAllByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
This method returns all application memberships for a specific application.

**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Get all memberships by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application memberships  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.membership.getAllByApplication('MyApp').then(function(memberships) {
	console.log(memberships);
});
```
**Example**  
```js
balena.models.application.membership.getAllByApplication(123).then(function(memberships) {
	console.log(memberships);
});
```
**Example**  
```js
balena.models.application.membership.getAllByApplication(123, function(error, memberships) {
	console.log(memberships);
});
```
<a name="balena.models.application.membership.create"></a>

###### membership.create(options) ⇒ <code>Promise</code>
This method adds a user to an application by their usename.

**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Creates a new membership for an application  
**Access**: public  
**Fulfil**: <code>Object</code> - application membership  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | membership creation parameters |
| options.application | <code>String</code> \| <code>Number</code> |  | application handle (string), or id (number) |
| options.username | <code>String</code> |  | the username of the balena user that will become a member |
| [options.roleName] | <code>String</code> | <code>&quot;member&quot;</code> | the role name to be granted to the membership |

**Example**  
```js
balena.models.application.membership.create({ application: "myApp", username: "user123", roleName: "member" }).then(function(membership) {
	console.log(membership);
});
```
**Example**  
```js
balena.models.application.membership.create({ application: 53, username: "user123" }, function(error, membership) {
	console.log(membership);
});
```
<a name="balena.models.application.membership.changeRole"></a>

###### membership.changeRole(idOrUniqueKey, roleName) ⇒ <code>Promise</code>
This method changes the role of an application member.

**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Changes the role of an application member  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| idOrUniqueKey | <code>Number</code> \| <code>Object</code> | the id or an object with the unique `user` & `is_member_of__application` numeric pair of the membership that will be changed |
| roleName | <code>String</code> | the role name to be granted to the membership |

**Example**  
```js
balena.models.application.membership.changeRole(123, "member").then(function() {
	console.log('OK');
});
```
**Example**  
```js
balena.models.application.membership.changeRole({
	user: 123,
	is_member_of__application: 125,
}, "member").then(function() {
	console.log('OK');
});
```
**Example**  
```js
balena.models.application.membership.changeRole(123, "administrator", function(error) {
	console.log('OK');
});
```
<a name="balena.models.application.membership.remove"></a>

###### membership.remove(idOrUniqueKey) ⇒ <code>Promise</code>
**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Remove a membership  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| idOrUniqueKey | <code>Number</code> \| <code>Object</code> | the id or an object with the unique `user` & `is_member_of__application` numeric pair of the membership that will be removed |

**Example**  
```js
balena.models.application.membership.remove(123);
```
**Example**  
```js
balena.models.application.membership.remove({
	user: 123,
	is_member_of__application: 125,
});
```
**Example**  
```js
balena.models.application.membership.remove(123,function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.application.invite"></a>

##### application.invite : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.invite](#balena.models.application.invite) : <code>object</code>
    * [.getAll([options])](#balena.models.application.invite.getAll) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.application.invite.getAllByApplication) ⇒ <code>Promise</code>
    * [.create(nameOrSlugOrId, options, [message])](#balena.models.application.invite.create) ⇒ <code>Promise</code>
    * [.revoke(id)](#balena.models.application.invite.revoke) ⇒ <code>Promise</code>
    * [.accept(invitationToken)](#balena.models.application.invite.accept) ⇒ <code>Promise</code>

<a name="balena.models.application.invite.getAll"></a>

###### invite.getAll([options]) ⇒ <code>Promise</code>
This method returns all invites.

**Kind**: static method of [<code>invite</code>](#balena.models.application.invite)  
**Summary**: Get all invites  
**Access**: public  
**Fulfil**: <code>Object[]</code> - invites  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.invite.getAll().then(function(invites) {
	console.log(invites);
});
```
**Example**  
```js
balena.models.application.invite.getAll(function(error, invites) {
	console.log(invites);
});
```
<a name="balena.models.application.invite.getAllByApplication"></a>

###### invite.getAllByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
This method returns all invites for a specific application.

**Kind**: static method of [<code>invite</code>](#balena.models.application.invite)  
**Summary**: Get all invites by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - invites  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.invite.getAllByApplication('MyApp').then(function(invites) {
	console.log(invites);
});
```
**Example**  
```js
balena.models.application.invite.getAllByApplication(123).then(function(invites) {
	console.log(invites);
});
```
**Example**  
```js
balena.models.application.invite.getAllByApplication(123, function(error, invites) {
	console.log(invites);
});
```
<a name="balena.models.application.invite.create"></a>

###### invite.create(nameOrSlugOrId, options, [message]) ⇒ <code>Promise</code>
This method invites a user by their email to an application.

**Kind**: static method of [<code>invite</code>](#balena.models.application.invite)  
**Summary**: Creates a new invite for an application  
**Access**: public  
**Fulfil**: <code>String</code> - application invite  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| options | <code>Object</code> |  | invite creation parameters |
| options.invitee | <code>String</code> |  | the email/balena_username of the invitee |
| [options.roleName] | <code>String</code> | <code>&quot;developer&quot;</code> | the role name to be granted to the invitee |
| [message] | <code>String</code> | <code></code> | the message to send along with the invite |

**Example**  
```js
balena.models.application.invite.create('MyApp', { invitee: "invitee@example.org", roleName: "developer", message: "join my app" }).then(function(invite) {
	console.log(invite);
});
```
**Example**  
```js
balena.models.application.invite.create(53, { invitee: "invitee@example.org" }, function(error, invite) {
	console.log(invite);
});
```
<a name="balena.models.application.invite.revoke"></a>

###### invite.revoke(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>invite</code>](#balena.models.application.invite)  
**Summary**: Revoke an invite  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | application invite id |

**Example**  
```js
balena.models.application.invite.revoke(123);
```
**Example**  
```js
balena.models.application.invite.revoke(123,function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.application.invite.accept"></a>

###### invite.accept(invitationToken) ⇒ <code>Promise</code>
This method adds the calling user to the application.

**Kind**: static method of [<code>invite</code>](#balena.models.application.invite)  
**Summary**: Accepts an invite  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| invitationToken | <code>String</code> | invite token |

**Example**  
```js
balena.models.application.invite.accept("qwerty-invitation-token");
```
**Example**  
```js
balena.models.application.invite.accept("qwerty-invitation-token", function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.application.getDashboardUrl"></a>

##### application.getDashboardUrl(id) ⇒ <code>String</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get Dashboard URL for a specific application  
**Returns**: <code>String</code> - - Dashboard URL for the specific application  
**Throws**:

- Exception if the id is not a finite number


| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | Application id |

**Example**  
```js
balena.models.application.get('MyApp').then(function(application) {
	const dashboardApplicationUrl = balena.models.application.getDashboardUrl(application.id);
	console.log(dashboardApplicationUrl);
});
```
<a name="balena.models.application.getAll"></a>

##### application.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get all applications  
**Access**: public  
**Fulfil**: <code>Object[]</code> - applications  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.getAll().then(function(applications) {
	console.log(applications);
});
```
**Example**  
```js
balena.models.application.getAll(function(error, applications) {
	if (error) throw error;
	console.log(applications);
});
```
<a name="balena.models.application.getAllWithDeviceServiceDetails"></a>

##### ~~application.getAllWithDeviceServiceDetails([options]) ⇒ <code>Promise</code>~~
***Deprecated***

This method does not map exactly to the underlying model: it runs a
larger prebuilt query, and reformats it into an easy to use and
understand format. If you want more control, or to see the raw model
directly, use `application.getAll(options)` instead.
**NOTE:** In contrast with device.getWithServiceDetails() the service details
in the result of this method do not include the associated commit.

**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get applications and their devices, along with each device's
associated services' essential details  
**Access**: public  
**Fulfil**: <code>Object[]</code> - applications  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.getAllWithDeviceServiceDetails().then(function(applications) {
	console.log(applications);
})
```
**Example**  
```js
balena.models.application.getAllWithDeviceServiceDetails(function(error, applications) {
	if (error) throw error;
	console.log(applications);
});
```
<a name="balena.models.application.get"></a>

##### application.get(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get a single application  
**Access**: public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.get('myorganization/myapp').then(function(application) {
	console.log(application);
});
```
**Example**  
```js
// Deprecated in favor of application slug
balena.models.application.get('MyApp').then(function(application) {
	console.log(application);
});
```
**Example**  
```js
balena.models.application.get(123).then(function(application) {
	console.log(application);
});
```
**Example**  
```js
balena.models.application.get('myorganization/myapp', function(error, application) {
	if (error) throw error;
	console.log(application);
});
```
<a name="balena.models.application.getWithDeviceServiceDetails"></a>

##### application.getWithDeviceServiceDetails(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
This method does not map exactly to the underlying model: it runs a
larger prebuilt query, and reformats it into an easy to use and
understand format. If you want more control, or to see the raw model
directly, use `application.get(uuidOrId, options)` instead.

**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get a single application and its devices, along with each device's
associated services' essential details  
**Access**: public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.getWithDeviceServiceDetails('myorganization/myapp').then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.application.getWithDeviceServiceDetails(123).then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.application.getWithDeviceServiceDetails('myorganization/myapp', function(error, device) {
	if (error) throw error;
	console.log(device);
});
```
<a name="balena.models.application.getAppByName"></a>

##### application.getAppByName(appName, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get a single application using the appname and the handle of the owning organization  
**Access**: public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| appName | <code>String</code> |  | application name |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.getAppByName('MyApp').then(function(application) {
	console.log(application);
});
```
<a name="balena.models.application.getAppByOwner"></a>

##### application.getAppByOwner(appName, owner, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get a single application using the appname and the handle of the owning organization  
**Access**: public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| appName | <code>String</code> |  | application name |
| owner | <code>String</code> |  | The handle of the owning organization |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.getAppByOwner('MyApp', 'MyOrg').then(function(application) {
	console.log(application);
});
```
<a name="balena.models.application.has"></a>

##### application.has(nameOrSlugOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Check if an application exists  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has application  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |

**Example**  
```js
balena.models.application.has('MyApp').then(function(hasApp) {
	console.log(hasApp);
});
```
**Example**  
```js
balena.models.application.has(123).then(function(hasApp) {
	console.log(hasApp);
});
```
**Example**  
```js
balena.models.application.has('MyApp', function(error, hasApp) {
	if (error) throw error;
	console.log(hasApp);
});
```
<a name="balena.models.application.hasAny"></a>

##### application.hasAny() ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Check if the user has any applications  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has any applications  
**Example**  
```js
balena.models.application.hasAny().then(function(hasAny) {
	console.log('Has any?', hasAny);
});
```
**Example**  
```js
balena.models.application.hasAny(function(error, hasAny) {
	if (error) throw error;
	console.log('Has any?', hasAny);
});
```
<a name="balena.models.application.create"></a>

##### application.create(options) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Create an application  
**Access**: public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | application creation parameters |
| options.name | <code>String</code> | application name |
| [options.applicationType] | <code>String</code> | application type slug e.g. microservices-starter |
| options.deviceType | <code>String</code> | device type slug |
| [options.parent] | <code>Number</code> \| <code>String</code> | parent application name or id |
| options.organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the organization that the application will belong to or null |

**Example**  
```js
balena.models.application.create({ name: 'My App', applicationType: 'essentials', deviceType: 'raspberry-pi' }).then(function(application) {
	console.log(application);
});
```
**Example**  
```js
balena.models.application.create({ name: 'My App', applicationType: 'microservices', deviceType: 'raspberry-pi', parent: 'ParentApp' }).then(function(application) {
	console.log(application);
});
```
**Example**  
```js
balena.models.application.create({ name: 'My App', applicationType: 'microservices-starter', deviceType: 'raspberry-pi' }, function(error, application) {
	if (error) throw error;
	console.log(application);
});
```
<a name="balena.models.application.remove"></a>

##### application.remove(nameOrSlugOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Remove application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |

**Example**  
```js
balena.models.application.remove('MyApp');
```
**Example**  
```js
balena.models.application.remove(123);
```
**Example**  
```js
balena.models.application.remove('MyApp', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.rename"></a>

##### application.rename(nameOrSlugOrId, newName) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Rename application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |
| newName | <code>String</code> | new application name (string) |

**Example**  
```js
balena.models.application.rename('MyApp', 'MyRenamedApp');
```
**Example**  
```js
balena.models.application.rename(123, 'MyRenamedApp');
```
**Example**  
```js
balena.models.application.rename('MyApp', 'MyRenamedApp', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.restart"></a>

##### application.restart(nameOrSlugOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Restart application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |

**Example**  
```js
balena.models.application.restart('MyApp');
```
**Example**  
```js
balena.models.application.restart(123);
```
**Example**  
```js
balena.models.application.restart('MyApp', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.generateApiKey"></a>

##### ~~application.generateApiKey(nameOrSlugOrId) ⇒ <code>Promise</code>~~
***Deprecated***

Generally you shouldn't use this method: if you're provisioning a recent BalenaOS
version (2.4.0+) then generateProvisioningKey should work just as well, but
be more secure.

**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Generate an API key for a specific application  
**Access**: public  
**Fulfil**: <code>String</code> - api key  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |

**Example**  
```js
balena.models.application.generateApiKey('MyApp').then(function(apiKey) {
	console.log(apiKey);
});
```
**Example**  
```js
balena.models.application.generateApiKey(123).then(function(apiKey) {
	console.log(apiKey);
});
```
**Example**  
```js
balena.models.application.generateApiKey('MyApp', function(error, apiKey) {
	if (error) throw error;
	console.log(apiKey);
});
```
<a name="balena.models.application.generateProvisioningKey"></a>

##### application.generateProvisioningKey(nameOrSlugOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Generate a device provisioning key for a specific application  
**Access**: public  
**Fulfil**: <code>String</code> - device provisioning key  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |

**Example**  
```js
balena.models.application.generateProvisioningKey('MyApp').then(function(key) {
	console.log(key);
});
```
**Example**  
```js
balena.models.application.generateProvisioningKey(123).then(function(key) {
	console.log(key);
});
```
**Example**  
```js
balena.models.application.generateProvisioningKey('MyApp', function(error, key) {
	if (error) throw error;
	console.log(key);
});
```
<a name="balena.models.application.purge"></a>

##### application.purge(appId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Purge devices by application id  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| appId | <code>Number</code> | application id |

**Example**  
```js
balena.models.application.purge(123);
```
**Example**  
```js
balena.models.application.purge(123, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.shutdown"></a>

##### application.shutdown(appId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Shutdown devices by application id  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| appId | <code>Number</code> |  | application id |
| [options] | <code>Object</code> |  | options |
| [options.force] | <code>Boolean</code> | <code>false</code> | override update lock |

**Example**  
```js
balena.models.application.shutdown(123);
```
**Example**  
```js
balena.models.application.shutdown(123, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.reboot"></a>

##### application.reboot(appId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Reboot devices by application id  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| appId | <code>Number</code> |  | application id |
| [options] | <code>Object</code> |  | options |
| [options.force] | <code>Boolean</code> | <code>false</code> | override update lock |

**Example**  
```js
balena.models.application.reboot(123);
```
**Example**  
```js
balena.models.application.reboot(123, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.willTrackNewReleases"></a>

##### application.willTrackNewReleases(nameOrSlugOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get whether the application is configured to receive updates whenever a new release is available  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is tracking the latest release  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |

**Example**  
```js
balena.models.application.willTrackNewReleases('MyApp').then(function(isEnabled) {
	console.log(isEnabled);
});
```
**Example**  
```js
balena.models.application.willTrackNewReleases(123).then(function(isEnabled) {
	console.log(isEnabled);
});
```
**Example**  
```js
balena.models.application.willTrackNewReleases('MyApp', function(error, isEnabled) {
	console.log(isEnabled);
});
```
<a name="balena.models.application.isTrackingLatestRelease"></a>

##### application.isTrackingLatestRelease(nameOrSlugOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get whether the application is up to date and is tracking the latest release for updates  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is tracking the latest release  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |

**Example**  
```js
balena.models.application.isTrackingLatestRelease('MyApp').then(function(isEnabled) {
	console.log(isEnabled);
});
```
**Example**  
```js
balena.models.application.isTrackingLatestRelease(123).then(function(isEnabled) {
	console.log(isEnabled);
});
```
**Example**  
```js
balena.models.application.isTrackingLatestRelease('MyApp', function(error, isEnabled) {
	console.log(isEnabled);
});
```
<a name="balena.models.application.pinToRelease"></a>

##### application.pinToRelease(nameOrSlugOrId, fullReleaseHash) ⇒ <code>Promise</code>
Configures the application to run a particular release
and not get updated when the latest release changes.

**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Set a specific application to run a particular release  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |
| fullReleaseHash | <code>String</code> | the hash of a successful release (string) |

**Example**  
```js
balena.models.application.pinToRelease('MyApp', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.pinToRelease(123, 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.pinToRelease('MyApp', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.application.getTargetReleaseHash"></a>

##### application.getTargetReleaseHash(nameOrSlugOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get the hash of the current release for a specific application  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - The release hash of the current release  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |

**Example**  
```js
balena.models.application.getTargetReleaseHash('MyApp').then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.application.getTargetReleaseHash(123).then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.application.getTargetReleaseHash('MyApp', function(release) {
	console.log(release);
});
```
<a name="balena.models.application.trackLatestRelease"></a>

##### application.trackLatestRelease(nameOrSlugOrId) ⇒ <code>Promise</code>
The application's current release will be updated with each new successfully built release.

**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Configure a specific application to track the latest available release  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |

**Example**  
```js
balena.models.application.trackLatestRelease('MyApp').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.trackLatestRelease(123).then(function() {
	...
});
```
**Example**  
```js
balena.models.application.trackLatestRelease('MyApp', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.application.enableDeviceUrls"></a>

##### application.enableDeviceUrls(nameOrSlugOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Enable device urls for all devices that belong to an application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |

**Example**  
```js
balena.models.application.enableDeviceUrls('MyApp');
```
**Example**  
```js
balena.models.application.enableDeviceUrls(123);
```
**Example**  
```js
balena.models.device.enableDeviceUrls('MyApp', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.disableDeviceUrls"></a>

##### application.disableDeviceUrls(nameOrSlugOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Disable device urls for all devices that belong to an application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |

**Example**  
```js
balena.models.application.disableDeviceUrls('MyApp');
```
**Example**  
```js
balena.models.application.disableDeviceUrls(123);
```
**Example**  
```js
balena.models.device.disableDeviceUrls('MyApp', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.grantSupportAccess"></a>

##### application.grantSupportAccess(nameOrSlugOrId, expiryTimestamp) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Grant support access to an application until a specified time  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |
| expiryTimestamp | <code>Number</code> | a timestamp in ms for when the support access will expire |

**Example**  
```js
balena.models.application.grantSupportAccess('MyApp', Date.now() + 3600 * 1000);
```
**Example**  
```js
balena.models.application.grantSupportAccess(123, Date.now() + 3600 * 1000);
```
**Example**  
```js
balena.models.application.grantSupportAccess('MyApp', Date.now() + 3600 * 1000, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.revokeSupportAccess"></a>

##### application.revokeSupportAccess(nameOrSlugOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Revoke support access to an application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |

**Example**  
```js
balena.models.application.revokeSupportAccess('MyApp');
```
**Example**  
```js
balena.models.application.revokeSupportAccess(123);
```
**Example**  
```js
balena.models.application.revokeSupportAccess('MyApp', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device"></a>

#### models.device : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.device](#balena.models.device) : <code>object</code>
    * [.tags](#balena.models.device.tags) : <code>object</code>
        * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.tags.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.tags.getAllByDevice) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.device.tags.getAll) ⇒ <code>Promise</code>
        * [.set(uuidOrId, tagKey, value)](#balena.models.device.tags.set) ⇒ <code>Promise</code>
        * [.remove(uuidOrId, tagKey)](#balena.models.device.tags.remove) ⇒ <code>Promise</code>
    * [.configVar](#balena.models.device.configVar) : <code>object</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.configVar.getAllByDevice) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.configVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(uuidOrId, key)](#balena.models.device.configVar.get) ⇒ <code>Promise</code>
        * [.set(uuidOrId, key, value)](#balena.models.device.configVar.set) ⇒ <code>Promise</code>
        * [.remove(uuidOrId, key)](#balena.models.device.configVar.remove) ⇒ <code>Promise</code>
    * [.envVar](#balena.models.device.envVar) : <code>object</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.envVar.getAllByDevice) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.envVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(uuidOrId, key)](#balena.models.device.envVar.get) ⇒ <code>Promise</code>
        * [.set(uuidOrId, key, value)](#balena.models.device.envVar.set) ⇒ <code>Promise</code>
        * [.remove(uuidOrId, key)](#balena.models.device.envVar.remove) ⇒ <code>Promise</code>
    * [.serviceVar](#balena.models.device.serviceVar) : <code>object</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.serviceVar.getAllByDevice) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.serviceVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(uuidOrId, id, key)](#balena.models.device.serviceVar.get) ⇒ <code>Promise</code>
        * [.set(uuidOrId, id, key, value)](#balena.models.device.serviceVar.set) ⇒ <code>Promise</code>
        * [.remove(uuidOrId, id, key)](#balena.models.device.serviceVar.remove) ⇒ <code>Promise</code>
    * [.getDashboardUrl(uuid)](#balena.models.device.getDashboardUrl) ⇒ <code>String</code>
    * [.getAll([options])](#balena.models.device.getAll) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByParentDevice(parentUuidOrId, [options])](#balena.models.device.getAllByParentDevice) ⇒ <code>Promise</code>
    * [.get(uuidOrId, [options])](#balena.models.device.get) ⇒ <code>Promise</code>
    * [.getWithServiceDetails(uuidOrId, [options])](#balena.models.device.getWithServiceDetails) ⇒ <code>Promise</code>
    * [.getByName(name)](#balena.models.device.getByName) ⇒ <code>Promise</code>
    * [.getName(uuidOrId)](#balena.models.device.getName) ⇒ <code>Promise</code>
    * [.getApplicationName(uuidOrId)](#balena.models.device.getApplicationName) ⇒ <code>Promise</code>
    * [.has(uuidOrId)](#balena.models.device.has) ⇒ <code>Promise</code>
    * [.isOnline(uuidOrId)](#balena.models.device.isOnline) ⇒ <code>Promise</code>
    * [.getLocalIPAddresses(uuidOrId)](#balena.models.device.getLocalIPAddresses) ⇒ <code>Promise</code>
    * [.getMACAddresses(uuidOrId)](#balena.models.device.getMACAddresses) ⇒ <code>Promise</code>
    * [.getMetrics(uuidOrId)](#balena.models.device.getMetrics) ⇒ <code>Promise</code>
    * [.remove(uuidOrId)](#balena.models.device.remove) ⇒ <code>Promise</code>
    * [.deactivate(uuidOrId)](#balena.models.device.deactivate) ⇒ <code>Promise</code>
    * [.rename(uuidOrId, newName)](#balena.models.device.rename) ⇒ <code>Promise</code>
    * [.note(uuidOrId, note)](#balena.models.device.note) ⇒ <code>Promise</code>
    * [.setCustomLocation(uuidOrId, location)](#balena.models.device.setCustomLocation) ⇒ <code>Promise</code>
    * [.unsetCustomLocation(uuidOrId)](#balena.models.device.unsetCustomLocation) ⇒ <code>Promise</code>
    * [.move(uuidOrId, applicationNameOrSlugOrId)](#balena.models.device.move) ⇒ <code>Promise</code>
    * [.restartApplication(uuidOrId)](#balena.models.device.restartApplication) ⇒ <code>Promise</code>
    * [.getSupervisorTargetState(uuidOrId)](#balena.models.device.getSupervisorTargetState) ⇒ <code>Promise</code>
    * ~~[.getDisplayName(deviceTypeSlug)](#balena.models.device.getDisplayName) ⇒ <code>Promise</code>~~
    * ~~[.getDeviceSlug(deviceTypeName)](#balena.models.device.getDeviceSlug) ⇒ <code>Promise</code>~~
    * ~~[.getSupportedDeviceTypes()](#balena.models.device.getSupportedDeviceTypes) ⇒ <code>Promise</code>~~
    * ~~[.getManifestBySlug(slugOrName)](#balena.models.device.getManifestBySlug) ⇒ <code>Promise</code>~~
    * [.getManifestByApplication(nameOrSlugOrId)](#balena.models.device.getManifestByApplication) ⇒ <code>Promise</code>
    * [.generateUniqueKey()](#balena.models.device.generateUniqueKey) ⇒ <code>String</code>
    * [.register(applicationNameOrSlugOrId, uuid)](#balena.models.device.register) ⇒ <code>Promise</code>
    * [.generateDeviceKey(uuidOrId)](#balena.models.device.generateDeviceKey) ⇒ <code>Promise</code>
    * [.hasDeviceUrl(uuidOrId)](#balena.models.device.hasDeviceUrl) ⇒ <code>Promise</code>
    * [.getDeviceUrl(uuidOrId)](#balena.models.device.getDeviceUrl) ⇒ <code>Promise</code>
    * [.enableDeviceUrl(uuidOrId)](#balena.models.device.enableDeviceUrl) ⇒ <code>Promise</code>
    * [.disableDeviceUrl(uuidOrId)](#balena.models.device.disableDeviceUrl) ⇒ <code>Promise</code>
    * [.enableLocalMode(uuidOrId)](#balena.models.device.enableLocalMode) ⇒ <code>Promise</code>
    * [.disableLocalMode(uuidOrId)](#balena.models.device.disableLocalMode) ⇒ <code>Promise</code>
    * [.isInLocalMode(uuidOrId)](#balena.models.device.isInLocalMode) ⇒ <code>Promise</code>
    * [.getLocalModeSupport(device)](#balena.models.device.getLocalModeSupport) ⇒ <code>Object</code>
    * [.enableLockOverride(uuidOrId)](#balena.models.device.enableLockOverride) ⇒ <code>Promise</code>
    * [.disableLockOverride(uuidOrId)](#balena.models.device.disableLockOverride) ⇒ <code>Promise</code>
    * [.hasLockOverride(uuidOrId)](#balena.models.device.hasLockOverride) ⇒ <code>Promise</code>
    * [.getStatus(uuidOrId)](#balena.models.device.getStatus) ⇒ <code>Promise</code>
    * [.getProgress(uuidOrId)](#balena.models.device.getProgress) ⇒ <code>Promise</code>
    * [.grantSupportAccess(uuidOrId, expiryTimestamp)](#balena.models.device.grantSupportAccess) ⇒ <code>Promise</code>
    * [.revokeSupportAccess(uuidOrId)](#balena.models.device.revokeSupportAccess) ⇒ <code>Promise</code>
    * [.lastOnline(device)](#balena.models.device.lastOnline) ⇒ <code>String</code>
    * [.getOsVersion(device)](#balena.models.device.getOsVersion) ⇒ <code>String</code>
    * [.isTrackingApplicationRelease(uuidOrId)](#balena.models.device.isTrackingApplicationRelease) ⇒ <code>Promise</code>
    * [.getTargetReleaseHash(uuidOrId)](#balena.models.device.getTargetReleaseHash) ⇒ <code>Promise</code>
    * [.pinToRelease(uuidOrId, fullReleaseHashOrId)](#balena.models.device.pinToRelease) ⇒ <code>Promise</code>
    * [.setSupervisorRelease(uuidOrId, supervisorVersionOrId)](#balena.models.device.setSupervisorRelease) ⇒ <code>Promise</code>
    * [.trackApplicationRelease(uuidOrId)](#balena.models.device.trackApplicationRelease) ⇒ <code>Promise</code>
    * [.startOsUpdate(uuid, targetOsVersion)](#balena.models.device.startOsUpdate) ⇒ <code>Promise</code>
    * [.getOsUpdateStatus(uuid)](#balena.models.device.getOsUpdateStatus) ⇒ <code>Promise</code>
    * [.ping(uuidOrId)](#balena.models.device.ping) ⇒ <code>Promise</code>
    * ~~[.getApplicationInfo(uuidOrId)](#balena.models.device.getApplicationInfo) ⇒ <code>Promise</code>~~
    * [.identify(uuidOrId)](#balena.models.device.identify) ⇒ <code>Promise</code>
    * ~~[.startApplication(uuidOrId)](#balena.models.device.startApplication) ⇒ <code>Promise</code>~~
    * ~~[.stopApplication(uuidOrId)](#balena.models.device.stopApplication) ⇒ <code>Promise</code>~~
    * [.reboot(uuidOrId, [options])](#balena.models.device.reboot) ⇒ <code>Promise</code>
    * [.shutdown(uuidOrId, [options])](#balena.models.device.shutdown) ⇒ <code>Promise</code>
    * [.purge(uuidOrId)](#balena.models.device.purge) ⇒ <code>Promise</code>
    * [.update(uuidOrId, [options])](#balena.models.device.update) ⇒ <code>Promise</code>
    * [.getSupervisorState(uuidOrId)](#balena.models.device.getSupervisorState) ⇒ <code>Promise</code>
    * [.startService(uuidOrId, imageId)](#balena.models.device.startService) ⇒ <code>Promise</code>
    * [.stopService(uuidOrId, imageId)](#balena.models.device.stopService) ⇒ <code>Promise</code>
    * [.restartService(uuidOrId, imageId)](#balena.models.device.restartService) ⇒ <code>Promise</code>

<a name="balena.models.device.tags"></a>

##### device.tags : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.tags](#balena.models.device.tags) : <code>object</code>
    * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.tags.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.tags.getAllByDevice) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.device.tags.getAll) ⇒ <code>Promise</code>
    * [.set(uuidOrId, tagKey, value)](#balena.models.device.tags.set) ⇒ <code>Promise</code>
    * [.remove(uuidOrId, tagKey)](#balena.models.device.tags.remove) ⇒ <code>Promise</code>

<a name="balena.models.device.tags.getAllByApplication"></a>

###### tags.getAllByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.device.tags)  
**Summary**: Get all device tags for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.tags.getAllByApplication('MyApp').then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.device.tags.getAllByApplication(999999).then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.device.tags.getAllByApplication('MyApp', function(error, tags) {
	if (error) throw error;
	console.log(tags)
});
```
<a name="balena.models.device.tags.getAllByDevice"></a>

###### tags.getAllByDevice(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.device.tags)  
**Summary**: Get all device tags for a device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.tags.getAllByDevice('7cf02a6').then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.device.tags.getAllByDevice(123).then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.device.tags.getAllByDevice('7cf02a6', function(error, tags) {
	if (error) throw error;
	console.log(tags)
});
```
<a name="balena.models.device.tags.getAll"></a>

###### tags.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.device.tags)  
**Summary**: Get all device tags  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.tags.getAll().then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.device.tags.getAll(function(error, tags) {
	if (error) throw error;
	console.log(tags)
});
```
<a name="balena.models.device.tags.set"></a>

###### tags.set(uuidOrId, tagKey, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.device.tags)  
**Summary**: Set a device tag  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| tagKey | <code>String</code> | tag key |
| value | <code>String</code> \| <code>undefined</code> | tag value |

**Example**  
```js
balena.models.device.tags.set('7cf02a6', 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.device.tags.set(123, 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.device.tags.set('7cf02a6', 'EDITOR', 'vim', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.tags.remove"></a>

###### tags.remove(uuidOrId, tagKey) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.device.tags)  
**Summary**: Remove a device tag  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| tagKey | <code>String</code> | tag key |

**Example**  
```js
balena.models.device.tags.remove('7cf02a6', 'EDITOR');
```
**Example**  
```js
balena.models.device.tags.remove('7cf02a6', 'EDITOR', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.configVar"></a>

##### device.configVar : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.configVar](#balena.models.device.configVar) : <code>object</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.configVar.getAllByDevice) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.configVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(uuidOrId, key)](#balena.models.device.configVar.get) ⇒ <code>Promise</code>
    * [.set(uuidOrId, key, value)](#balena.models.device.configVar.set) ⇒ <code>Promise</code>
    * [.remove(uuidOrId, key)](#balena.models.device.configVar.remove) ⇒ <code>Promise</code>

<a name="balena.models.device.configVar.getAllByDevice"></a>

###### configVar.getAllByDevice(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.device.configVar)  
**Summary**: Get all config variables for a device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device config variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.configVar.getAllByDevice('7cf02a6').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.configVar.getAllByDevice(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.configVar.getAllByDevice('7cf02a6', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.device.configVar.getAllByApplication"></a>

###### configVar.getAllByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.device.configVar)  
**Summary**: Get all device config variables by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device config variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.configVar.getAllByApplication('MyApp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.configVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.configVar.getAllByApplication('MyApp', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.device.configVar.get"></a>

###### configVar.get(uuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.device.configVar)  
**Summary**: Get the value of a specific config variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the config variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| key | <code>String</code> | config variable name |

**Example**  
```js
balena.models.device.configVar.get('7cf02a6', 'BALENA_VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.configVar.get(999999, 'BALENA_VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.configVar.get('7cf02a6', 'BALENA_VAR', function(error, value) {
	if (error) throw error;
	console.log(value)
});
```
<a name="balena.models.device.configVar.set"></a>

###### configVar.set(uuidOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.device.configVar)  
**Summary**: Set the value of a specific config variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| key | <code>String</code> | config variable name |
| value | <code>String</code> | config variable value |

**Example**  
```js
balena.models.device.configVar.set('7cf02a6', 'BALENA_VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.configVar.set(999999, 'BALENA_VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.configVar.set('7cf02a6', 'BALENA_VAR', 'newvalue', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.configVar.remove"></a>

###### configVar.remove(uuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.device.configVar)  
**Summary**: Clear the value of a specific config variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| key | <code>String</code> | config variable name |

**Example**  
```js
balena.models.device.configVar.remove('7cf02a6', 'BALENA_VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.configVar.remove(999999, 'BALENA_VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.configVar.remove('7cf02a6', 'BALENA_VAR', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.envVar"></a>

##### device.envVar : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.envVar](#balena.models.device.envVar) : <code>object</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.envVar.getAllByDevice) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.envVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(uuidOrId, key)](#balena.models.device.envVar.get) ⇒ <code>Promise</code>
    * [.set(uuidOrId, key, value)](#balena.models.device.envVar.set) ⇒ <code>Promise</code>
    * [.remove(uuidOrId, key)](#balena.models.device.envVar.remove) ⇒ <code>Promise</code>

<a name="balena.models.device.envVar.getAllByDevice"></a>

###### envVar.getAllByDevice(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.device.envVar)  
**Summary**: Get all environment variables for a device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device environment variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.envVar.getAllByDevice('7cf02a6').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.envVar.getAllByDevice(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.envVar.getAllByDevice('7cf02a6', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.device.envVar.getAllByApplication"></a>

###### envVar.getAllByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.device.envVar)  
**Summary**: Get all device environment variables by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device environment variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.envVar.getAllByApplication('MyApp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.envVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.envVar.getAllByApplication('MyApp', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.device.envVar.get"></a>

###### envVar.get(uuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.device.envVar)  
**Summary**: Get the value of a specific environment variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the environment variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| key | <code>String</code> | environment variable name |

**Example**  
```js
balena.models.device.envVar.get('7cf02a6', 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.envVar.get(999999, 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.envVar.get('7cf02a6', 'VAR', function(error, value) {
	if (error) throw error;
	console.log(value)
});
```
<a name="balena.models.device.envVar.set"></a>

###### envVar.set(uuidOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.device.envVar)  
**Summary**: Set the value of a specific environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| key | <code>String</code> | environment variable name |
| value | <code>String</code> | environment variable value |

**Example**  
```js
balena.models.device.envVar.set('7cf02a6', 'VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.envVar.set(999999, 'VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.envVar.set('7cf02a6', 'VAR', 'newvalue', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.envVar.remove"></a>

###### envVar.remove(uuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.device.envVar)  
**Summary**: Clear the value of a specific environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| key | <code>String</code> | environment variable name |

**Example**  
```js
balena.models.device.envVar.remove('7cf02a6', 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.envVar.remove(999999, 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.envVar.remove('7cf02a6', 'VAR', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.serviceVar"></a>

##### device.serviceVar : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.serviceVar](#balena.models.device.serviceVar) : <code>object</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.serviceVar.getAllByDevice) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.device.serviceVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(uuidOrId, id, key)](#balena.models.device.serviceVar.get) ⇒ <code>Promise</code>
    * [.set(uuidOrId, id, key, value)](#balena.models.device.serviceVar.set) ⇒ <code>Promise</code>
    * [.remove(uuidOrId, id, key)](#balena.models.device.serviceVar.remove) ⇒ <code>Promise</code>

<a name="balena.models.device.serviceVar.getAllByDevice"></a>

###### serviceVar.getAllByDevice(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Get all service variable overrides for a device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - service variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.serviceVar.getAllByDevice('7cf02a6').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.serviceVar.getAllByDevice(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.serviceVar.getAllByDevice('7cf02a6', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.device.serviceVar.getAllByApplication"></a>

###### serviceVar.getAllByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Get all device service variable overrides by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - service variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.serviceVar.getAllByApplication('MyApp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.serviceVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.serviceVar.getAllByApplication('MyApp', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.device.serviceVar.get"></a>

###### serviceVar.get(uuidOrId, id, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Get the overriden value of a service variable on a device  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| id | <code>Number</code> | service id |
| key | <code>String</code> | variable name |

**Example**  
```js
balena.models.device.serviceVar.get('7cf02a6', 123, 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.serviceVar.get(999999, 123, 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.serviceVar.get('7cf02a6', 123, 'VAR', function(error, value) {
	if (error) throw error;
	console.log(value)
});
```
<a name="balena.models.device.serviceVar.set"></a>

###### serviceVar.set(uuidOrId, id, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Set the overriden value of a service variable on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| id | <code>Number</code> | service id |
| key | <code>String</code> | variable name |
| value | <code>String</code> | variable value |

**Example**  
```js
balena.models.device.serviceVar.set('7cf02a6', 123, 'VAR', 'override').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.serviceVar.set(999999, 123, 'VAR', 'override').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.serviceVar.set('7cf02a6', 123, 'VAR', 'override', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.serviceVar.remove"></a>

###### serviceVar.remove(uuidOrId, id, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Clear the overridden value of a service variable on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| id | <code>Number</code> | service id |
| key | <code>String</code> | variable name |

**Example**  
```js
balena.models.device.serviceVar.remove('7cf02a6', 123, 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.serviceVar.remove(999999, 123, 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.serviceVar.remove('7cf02a6', 123, 'VAR', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.getDashboardUrl"></a>

##### device.getDashboardUrl(uuid) ⇒ <code>String</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get Dashboard URL for a specific device  
**Returns**: <code>String</code> - - Dashboard URL for the specific device  
**Throws**:

- Exception if the uuid is empty


| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | Device uuid |

**Example**  
```js
dashboardDeviceUrl = balena.models.device.getDashboardUrl('a44b544b8cc24d11b036c659dfeaccd8')
```
<a name="balena.models.device.getAll"></a>

##### device.getAll([options]) ⇒ <code>Promise</code>
This method returns all devices that the current user can access.
In order to have the following computed properties in the result
you have to explicitly define them in a `$select` in the extra options:
* `overall_status`
* `overall_progress`

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get all devices  
**Access**: public  
**Fulfil**: <code>Object[]</code> - devices  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.getAll().then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
balena.models.device.getAll({ $select: ['overall_status', 'overall_progress'] }).then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.device.getAll(function(error, devices) {
	if (error) throw error;
	console.log(devices);
});
```
<a name="balena.models.device.getAllByApplication"></a>

##### device.getAllByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
This method returns all devices of a specific application.
In order to have the following computed properties in the result
you have to explicitly define them in a `$select` in the extra options:
* `overall_status`
* `overall_progress`

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get all devices by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - devices  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.getAllByApplication('MyApp').then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
balena.models.device.getAllByApplication(123).then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
balena.models.device.getAllByApplication('MyApp', { $select: ['overall_status', 'overall_progress'] }).then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.device.getAllByApplication('MyApp', function(error, devices) {
	if (error) throw error;
	console.log(devices);
});
```
<a name="balena.models.device.getAllByParentDevice"></a>

##### device.getAllByParentDevice(parentUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get all devices by parent device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - devices  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| parentUuidOrId | <code>String</code> \| <code>Number</code> |  | parent device uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.getAllByParentDevice('7cf02a6').then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
balena.models.device.getAllByParentDevice(123).then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
balena.models.device.getAllByParentDevice('7cf02a6', function(error, devices) {
	if (error) throw error;
	console.log(devices);
});
```
<a name="balena.models.device.get"></a>

##### device.get(uuidOrId, [options]) ⇒ <code>Promise</code>
This method returns a single device by id or uuid.
In order to have the following computed properties in the result
you have to explicitly define them in a `$select` in the extra options:
* `overall_status`
* `overall_progress`

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get a single device  
**Access**: public  
**Fulfil**: <code>Object</code> - device  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.get('7cf02a6').then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.device.get(123).then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.device.get('7cf02a6', { $select: ['overall_status', 'overall_progress'] }).then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.device.get('7cf02a6', function(error, device) {
	if (error) throw error;
	console.log(device);
});
```
<a name="balena.models.device.getWithServiceDetails"></a>

##### device.getWithServiceDetails(uuidOrId, [options]) ⇒ <code>Promise</code>
This method does not map exactly to the underlying model: it runs a
larger prebuilt query, and reformats it into an easy to use and
understand format. If you want more control, or to see the raw model
directly, use `device.get(uuidOrId, options)` instead.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get a single device along with its associated services' details,
including their associated commit  
**Access**: public  
**Fulfil**: <code>Object</code> - device with service details  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.getWithServiceDetails('7cf02a6').then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.device.getWithServiceDetails(123).then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.device.getWithServiceDetails('7cf02a6', function(error, device) {
	if (error) throw error;
	console.log(device);
});
```
<a name="balena.models.device.getByName"></a>

##### device.getByName(name) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get devices by name  
**Access**: public  
**Fulfil**: <code>Object[]</code> - devices  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | device name |

**Example**  
```js
balena.models.device.getByName('MyDevice').then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
balena.models.device.getByName('MyDevice', function(error, devices) {
	if (error) throw error;
	console.log(devices);
});
```
<a name="balena.models.device.getName"></a>

##### device.getName(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the name of a device  
**Access**: public  
**Fulfil**: <code>String</code> - device name  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getName('7cf02a6').then(function(deviceName) {
	console.log(deviceName);
});
```
**Example**  
```js
balena.models.device.getName(123).then(function(deviceName) {
	console.log(deviceName);
});
```
**Example**  
```js
balena.models.device.getName('7cf02a6', function(error, deviceName) {
	if (error) throw error;
	console.log(deviceName);
});
```
<a name="balena.models.device.getApplicationName"></a>

##### device.getApplicationName(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get application name  
**Access**: public  
**Fulfil**: <code>String</code> - application name  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getApplicationName('7cf02a6').then(function(applicationName) {
	console.log(applicationName);
});
```
**Example**  
```js
balena.models.device.getApplicationName(123).then(function(applicationName) {
	console.log(applicationName);
});
```
**Example**  
```js
balena.models.device.getApplicationName('7cf02a6', function(error, applicationName) {
	if (error) throw error;
	console.log(applicationName);
});
```
<a name="balena.models.device.has"></a>

##### device.has(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Check if a device exists  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has device  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.has('7cf02a6').then(function(hasDevice) {
	console.log(hasDevice);
});
```
**Example**  
```js
balena.models.device.has(123).then(function(hasDevice) {
	console.log(hasDevice);
});
```
**Example**  
```js
balena.models.device.has('7cf02a6', function(error, hasDevice) {
	if (error) throw error;
	console.log(hasDevice);
});
```
<a name="balena.models.device.isOnline"></a>

##### device.isOnline(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Check if a device is online  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is device online  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.isOnline('7cf02a6').then(function(isOnline) {
	console.log('Is device online?', isOnline);
});
```
**Example**  
```js
balena.models.device.isOnline(123).then(function(isOnline) {
	console.log('Is device online?', isOnline);
});
```
**Example**  
```js
balena.models.device.isOnline('7cf02a6', function(error, isOnline) {
	if (error) throw error;
	console.log('Is device online?', isOnline);
});
```
<a name="balena.models.device.getLocalIPAddresses"></a>

##### device.getLocalIPAddresses(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the local IP addresses of a device  
**Access**: public  
**Fulfil**: <code>String[]</code> - local ip addresses  
**Reject**: <code>Error</code> Will reject if the device is offline  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getLocalIPAddresses('7cf02a6').then(function(localIPAddresses) {
	localIPAddresses.forEach(function(localIP) {
		console.log(localIP);
	});
});
```
**Example**  
```js
balena.models.device.getLocalIPAddresses(123).then(function(localIPAddresses) {
	localIPAddresses.forEach(function(localIP) {
		console.log(localIP);
	});
});
```
**Example**  
```js
balena.models.device.getLocalIPAddresses('7cf02a6', function(error, localIPAddresses) {
	if (error) throw error;

	localIPAddresses.forEach(function(localIP) {
		console.log(localIP);
	});
});
```
<a name="balena.models.device.getMACAddresses"></a>

##### device.getMACAddresses(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the MAC addresses of a device  
**Access**: public  
**Fulfil**: <code>String[]</code> - mac addresses  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getMACAddresses('7cf02a6').then(function(macAddresses) {
	macAddresses.forEach(function(mac) {
		console.log(mac);
	});
});
```
**Example**  
```js
balena.models.device.getMACAddresses(123).then(function(macAddresses) {
	macAddresses.forEach(function(mac) {
		console.log(mac);
	});
});
```
**Example**  
```js
balena.models.device.getMACAddresses('7cf02a6', function(error, macAddresses) {
	if (error) throw error;

	macAddresses.forEach(function(mac) {
		console.log(mac);
	});
});
```
<a name="balena.models.device.getMetrics"></a>

##### device.getMetrics(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the metrics related information for a device  
**Access**: public  
**Fulfil**: <code>Object</code> - device metrics  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getMetrics('7cf02a6').then(function(deviceMetrics) {
	console.log(deviceMetrics);
});
```
**Example**  
```js
balena.models.device.getMetrics(123).then(function(deviceMetrics) {
	console.log(deviceMetrics);
});
```
**Example**  
```js
balena.models.device.getMetrics('7cf02a6', function(error, deviceMetrics) {
	if (error) throw error;

	console.log(deviceMetrics);
});
```
<a name="balena.models.device.remove"></a>

##### device.remove(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Remove device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.remove('7cf02a6');
```
**Example**  
```js
balena.models.device.remove(123);
```
**Example**  
```js
balena.models.device.remove('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.deactivate"></a>

##### device.deactivate(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Deactivate device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.deactivate('7cf02a6');
```
**Example**  
```js
balena.models.device.deactivate(123);
```
**Example**  
```js
balena.models.device.deactivate('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.rename"></a>

##### device.rename(uuidOrId, newName) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Rename device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| newName | <code>String</code> | the device new name |

**Example**  
```js
balena.models.device.rename('7cf02a6', 'NewName');
```
**Example**  
```js
balena.models.device.rename(123, 'NewName');
```
**Example**  
```js
balena.models.device.rename('7cf02a6', 'NewName', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.note"></a>

##### device.note(uuidOrId, note) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Note a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| note | <code>String</code> | the note |

**Example**  
```js
balena.models.device.note('7cf02a6', 'My useful note');
```
**Example**  
```js
balena.models.device.note(123, 'My useful note');
```
**Example**  
```js
balena.models.device.note('7cf02a6', 'My useful note', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.setCustomLocation"></a>

##### device.setCustomLocation(uuidOrId, location) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Set a custom location for a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| location | <code>Object</code> | the location ({ latitude: 123, longitude: 456 }) |

**Example**  
```js
balena.models.device.setCustomLocation('7cf02a6', { latitude: 123, longitude: 456 });
```
**Example**  
```js
balena.models.device.setCustomLocation(123, { latitude: 123, longitude: 456 });
```
**Example**  
```js
balena.models.device.setCustomLocation('7cf02a6', { latitude: 123, longitude: 456 }, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.unsetCustomLocation"></a>

##### device.unsetCustomLocation(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Clear the custom location of a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.unsetCustomLocation('7cf02a6');
```
**Example**  
```js
balena.models.device.unsetCustomLocation(123);
```
**Example**  
```js
balena.models.device.unsetLocation('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.move"></a>

##### device.move(uuidOrId, applicationNameOrSlugOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Move a device to another application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| applicationNameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |

**Example**  
```js
balena.models.device.move('7cf02a6', 'MyApp');
```
**Example**  
```js
balena.models.device.move(123, 'MyApp');
```
**Example**  
```js
balena.models.device.move(123, 456);
```
**Example**  
```js
balena.models.device.move('7cf02a6', 'MyApp', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.restartApplication"></a>

##### device.restartApplication(uuidOrId) ⇒ <code>Promise</code>
This function restarts the Docker container running
the application on the device, but doesn't reboot
the device itself.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Restart application on device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.restartApplication('7cf02a6');
```
**Example**  
```js
balena.models.device.restartApplication(123);
```
**Example**  
```js
balena.models.device.restartApplication('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.getSupervisorTargetState"></a>

##### device.getSupervisorTargetState(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the target supervisor state on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getSupervisorTargetState('7cf02a6').then(function(state) {
	console.log(state);
});
```
**Example**  
```js
balena.models.device.getSupervisorTargetState(123).then(function(state) {
	console.log(state);
});
```
**Example**  
```js
balena.models.device.getSupervisorTargetState('7cf02a6', function(error, state) {
	if (error) throw error;
	console.log(state);
});
```
<a name="balena.models.device.getDisplayName"></a>

##### ~~device.getDisplayName(deviceTypeSlug) ⇒ <code>Promise</code>~~
***Deprecated***

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get display name for a device  
**Access**: public  
**Fulfil**: <code>String</code> - device display name  
**See**: [getSupportedDeviceTypes](#balena.models.device.getSupportedDeviceTypes) for a list of supported devices  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeSlug | <code>String</code> | device type slug |

**Example**  
```js
balena.models.device.getDisplayName('raspberry-pi').then(function(deviceTypeName) {
	console.log(deviceTypeName);
	// Raspberry Pi
});
```
**Example**  
```js
balena.models.device.getDisplayName('raspberry-pi', function(error, deviceTypeName) {
	if (error) throw error;
	console.log(deviceTypeName);
	// Raspberry Pi
});
```
<a name="balena.models.device.getDeviceSlug"></a>

##### ~~device.getDeviceSlug(deviceTypeName) ⇒ <code>Promise</code>~~
***Deprecated***

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get device slug  
**Access**: public  
**Fulfil**: <code>String</code> - device slug name  
**See**: [getSupportedDeviceTypes](#balena.models.device.getSupportedDeviceTypes) for a list of supported devices  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeName | <code>String</code> | device type name |

**Example**  
```js
balena.models.device.getDeviceSlug('Raspberry Pi').then(function(deviceTypeSlug) {
	console.log(deviceTypeSlug);
	// raspberry-pi
});
```
**Example**  
```js
balena.models.device.getDeviceSlug('Raspberry Pi', function(error, deviceTypeSlug) {
	if (error) throw error;
	console.log(deviceTypeSlug);
	// raspberry-pi
});
```
<a name="balena.models.device.getSupportedDeviceTypes"></a>

##### ~~device.getSupportedDeviceTypes() ⇒ <code>Promise</code>~~
***Deprecated***

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get supported device types  
**Access**: public  
**Fulfil**: <code>String[]</code> - supported device types  
**Example**  
```js
balena.models.device.getSupportedDeviceTypes().then(function(supportedDeviceTypes) {
	supportedDeviceTypes.forEach(function(supportedDeviceType) {
		console.log('Balena supports:', supportedDeviceType);
	});
});
```
**Example**  
```js
balena.models.device.getSupportedDeviceTypes(function(error, supportedDeviceTypes) {
	if (error) throw error;

	supportedDeviceTypes.forEach(function(supportedDeviceType) {
		console.log('Balena supports:', supportedDeviceType);
	});
});
```
<a name="balena.models.device.getManifestBySlug"></a>

##### ~~device.getManifestBySlug(slugOrName) ⇒ <code>Promise</code>~~
***Deprecated***

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get a device manifest by slug  
**Access**: public  
**Fulfil**: <code>Object</code> - device manifest  

| Param | Type | Description |
| --- | --- | --- |
| slugOrName | <code>String</code> | device slug |

**Example**  
```js
balena.models.device.getManifestBySlug('raspberry-pi').then(function(manifest) {
	console.log(manifest);
});
```
**Example**  
```js
balena.models.device.getManifestBySlug('raspberry-pi', function(error, manifest) {
	if (error) throw error;
	console.log(manifest);
});
```
<a name="balena.models.device.getManifestByApplication"></a>

##### device.getManifestByApplication(nameOrSlugOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get a device manifest by application name  
**Access**: public  
**Fulfil**: <code>Object</code> - device manifest  

| Param | Type | Description |
| --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |

**Example**  
```js
balena.models.device.getManifestByApplication('MyApp').then(function(manifest) {
	console.log(manifest);
});
```
**Example**  
```js
balena.models.device.getManifestByApplication(123).then(function(manifest) {
	console.log(manifest);
});
```
**Example**  
```js
balena.models.device.getManifestByApplication('MyApp', function(error, manifest) {
	if (error) throw error;
	console.log(manifest);
});
```
<a name="balena.models.device.generateUniqueKey"></a>

##### device.generateUniqueKey() ⇒ <code>String</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Generate a random key, useful for both uuid and api key.  
**Returns**: <code>String</code> - A generated key  
**Access**: public  
**Example**  
```js
randomKey = balena.models.device.generateUniqueKey();
// randomKey is a randomly generated key that can be used as either a uuid or an api key
console.log(randomKey);
```
<a name="balena.models.device.register"></a>

##### device.register(applicationNameOrSlugOrId, uuid) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Register a new device with a Balena application.  
**Access**: public  
**Fulfil**: <code>Object</code> Device registration info ({ id: "...", uuid: "...", api_key: "..." })  

| Param | Type | Description |
| --- | --- | --- |
| applicationNameOrSlugOrId | <code>String</code> \| <code>Number</code> | application name (string) (deprecated), slug (string) or id (number) |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
var uuid = balena.models.device.generateUniqueKey();
balena.models.device.register('MyApp', uuid).then(function(registrationInfo) {
	console.log(registrationInfo);
});
```
**Example**  
```js
var uuid = balena.models.device.generateUniqueKey();
balena.models.device.register(123, uuid).then(function(registrationInfo) {
	console.log(registrationInfo);
});
```
**Example**  
```js
var uuid = balena.models.device.generateUniqueKey();
balena.models.device.register('MyApp', uuid, function(error, registrationInfo) {
	if (error) throw error;
	console.log(registrationInfo);
});
```
<a name="balena.models.device.generateDeviceKey"></a>

##### device.generateDeviceKey(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Generate a device key  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.generateDeviceKey('7cf02a6').then(function(deviceApiKey) {
	console.log(deviceApiKey);
});
```
**Example**  
```js
balena.models.device.generateDeviceKey(123).then(function(deviceApiKey) {
	console.log(deviceApiKey);
});
```
**Example**  
```js
balena.models.device.generateDeviceKey('7cf02a6', function(error, deviceApiKey) {
	if (error) throw error;
	console.log(deviceApiKey);
});
```
<a name="balena.models.device.hasDeviceUrl"></a>

##### device.hasDeviceUrl(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Check if a device is web accessible with device utls  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has device url  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.hasDeviceUrl('7cf02a6').then(function(hasDeviceUrl) {
	if (hasDeviceUrl) {
		console.log('The device has device URL enabled');
	}
});
```
**Example**  
```js
balena.models.device.hasDeviceUrl(123).then(function(hasDeviceUrl) {
	if (hasDeviceUrl) {
		console.log('The device has device URL enabled');
	}
});
```
**Example**  
```js
balena.models.device.hasDeviceUrl('7cf02a6', function(error, hasDeviceUrl) {
	if (error) throw error;

	if (hasDeviceUrl) {
		console.log('The device has device URL enabled');
	}
});
```
<a name="balena.models.device.getDeviceUrl"></a>

##### device.getDeviceUrl(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get a device url  
**Access**: public  
**Fulfil**: <code>String</code> - device url  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getDeviceUrl('7cf02a6').then(function(url) {
	console.log(url);
});
```
**Example**  
```js
balena.models.device.getDeviceUrl(123).then(function(url) {
	console.log(url);
});
```
**Example**  
```js
balena.models.device.getDeviceUrl('7cf02a6', function(error, url) {
	if (error) throw error;
	console.log(url);
});
```
<a name="balena.models.device.enableDeviceUrl"></a>

##### device.enableDeviceUrl(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Enable device url for a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.enableDeviceUrl('7cf02a6');
```
**Example**  
```js
balena.models.device.enableDeviceUrl(123);
```
**Example**  
```js
balena.models.device.enableDeviceUrl('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.disableDeviceUrl"></a>

##### device.disableDeviceUrl(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Disable device url for a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.disableDeviceUrl('7cf02a6');
```
**Example**  
```js
balena.models.device.disableDeviceUrl(123);
```
**Example**  
```js
balena.models.device.disableDeviceUrl('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.enableLocalMode"></a>

##### device.enableLocalMode(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Enable local mode  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.enableLocalMode('7cf02a6');
```
**Example**  
```js
balena.models.device.enableLocalMode(123);
```
**Example**  
```js
balena.models.device.enableLocalMode('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.disableLocalMode"></a>

##### device.disableLocalMode(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Disable local mode  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.disableLocalMode('7cf02a6');
```
**Example**  
```js
balena.models.device.disableLocalMode(123);
```
**Example**  
```js
balena.models.device.disableLocalMode('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.isInLocalMode"></a>

##### device.isInLocalMode(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Check if local mode is enabled on the device  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has device url  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.isInLocalMode('7cf02a6').then(function(isInLocalMode) {
	if (isInLocalMode) {
		console.log('The device has local mode enabled');
	}
});
```
**Example**  
```js
balena.models.device.isInLocalMode(123).then(function(isInLocalMode) {
	if (isInLocalMode) {
		console.log('The device has local mode enabled');
	}
});
```
**Example**  
```js
balena.models.device.isInLocalMode('7cf02a6', function(error, isInLocalMode) {
	if (error) throw error;

	if (isInLocalMode) {
		console.log('The device has local mode enabled');
	}
});
```
<a name="balena.models.device.getLocalModeSupport"></a>

##### device.getLocalModeSupport(device) ⇒ <code>Object</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Returns whether local mode is supported along with a message describing the reason why local mode is not supported.  
**Returns**: <code>Object</code> - Local mode support info ({ supported: true/false, message: "..." })  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| device | <code>Object</code> | A device object |

**Example**  
```js
balena.models.device.get('7cf02a6').then(function(device) {
	balena.models.device.getLocalModeSupport(device);
})
```
<a name="balena.models.device.enableLockOverride"></a>

##### device.enableLockOverride(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Enable lock override  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.enableLockOverride('7cf02a6');
```
**Example**  
```js
balena.models.device.enableLockOverride(123);
```
**Example**  
```js
balena.models.device.enableLockOverride('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.disableLockOverride"></a>

##### device.disableLockOverride(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Disable lock override  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.disableLockOverride('7cf02a6');
```
**Example**  
```js
balena.models.device.disableLockOverride(123);
```
**Example**  
```js
balena.models.device.disableLockOverride('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.hasLockOverride"></a>

##### device.hasLockOverride(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Check if a device has the lock override enabled  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.hasLockOverride('7cf02a6');
```
**Example**  
```js
balena.models.device.hasLockOverride(123);
```
**Example**  
```js
balena.models.device.hasLockOverride('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.getStatus"></a>

##### device.getStatus(uuidOrId) ⇒ <code>Promise</code>
Convenience method for getting the overall status of a device.
It's recommended to use `balena.models.device.get()` instead,
in case that you need to retrieve more device fields than just the status.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the status of a device  
**Access**: public  
**Fulfil**: <code>String</code> - device status  
**See**: [get](#balena.models.device.get) for an example on selecting the `overall_status` field.  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getStatus('7cf02a6').then(function(status) {
	console.log(status);
});
```
**Example**  
```js
balena.models.device.getStatus(123).then(function(status) {
	console.log(status);
});
```
**Example**  
```js
balena.models.device.getStatus('7cf02a6', function(error, status) {
	if (error) throw error;
	console.log(status);
});
```
<a name="balena.models.device.getProgress"></a>

##### device.getProgress(uuidOrId) ⇒ <code>Promise</code>
Convenience method for getting the overall progress of a device.
It's recommended to use `balena.models.device.get()` instead,
in case that you need to retrieve more device fields than just the progress.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the progress of a device  
**Access**: public  
**Fulfil**: <code>Number\|Null</code> - device progress  
**See**: [get](#balena.models.device.get) for an example on selecting the `overall_progress` field.  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getProgress('7cf02a6').then(function(progress) {
	console.log(progress);
});
```
**Example**  
```js
balena.models.device.getProgress(123).then(function(progress) {
	console.log(progress);
});
```
**Example**  
```js
balena.models.device.getProgress('7cf02a6', function(error, progress) {
	if (error) throw error;
	console.log(progress);
});
```
<a name="balena.models.device.grantSupportAccess"></a>

##### device.grantSupportAccess(uuidOrId, expiryTimestamp) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Grant support access to a device until a specified time  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| expiryTimestamp | <code>Number</code> | a timestamp in ms for when the support access will expire |

**Example**  
```js
balena.models.device.grantSupportAccess('7cf02a6', Date.now() + 3600 * 1000);
```
**Example**  
```js
balena.models.device.grantSupportAccess(123, Date.now() + 3600 * 1000);
```
**Example**  
```js
balena.models.device.grantSupportAccess('7cf02a6', Date.now() + 3600 * 1000, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.revokeSupportAccess"></a>

##### device.revokeSupportAccess(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Revoke support access to a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.revokeSupportAccess('7cf02a6');
```
**Example**  
```js
balena.models.device.revokeSupportAccess(123);
```
**Example**  
```js
balena.models.device.revokeSupportAccess('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.lastOnline"></a>

##### device.lastOnline(device) ⇒ <code>String</code>
If the device has never been online this method returns the string `Connecting...`.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get a string showing when a device was last set as online  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| device | <code>Object</code> | A device object |

**Example**  
```js
balena.models.device.get('7cf02a6').then(function(device) {
	balena.models.device.lastOnline(device);
})
```
<a name="balena.models.device.getOsVersion"></a>

##### device.getOsVersion(device) ⇒ <code>String</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the OS version (version number and variant combined) running on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| device | <code>Object</code> | A device object |

**Example**  
```js
balena.models.device.get('7cf02a6').then(function(device) {
	console.log(device.os_version); // => 'balenaOS 2.26.0+rev1'
	console.log(device.os_variant); // => 'prod'
	balena.models.device.getOsVersion(device); // => '2.26.0+rev1.prod'
})
```
<a name="balena.models.device.isTrackingApplicationRelease"></a>

##### device.isTrackingApplicationRelease(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get whether the device is configured to track the current application release  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is tracking the current application release  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.isTrackingApplicationRelease('7cf02a6').then(function(isEnabled) {
	console.log(isEnabled);
});
```
**Example**  
```js
balena.models.device.isTrackingApplicationRelease('7cf02a6', function(error, isEnabled) {
	console.log(isEnabled);
});
```
<a name="balena.models.device.getTargetReleaseHash"></a>

##### device.getTargetReleaseHash(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the hash of the currently tracked release for a specific device  
**Access**: public  
**Fulfil**: <code>String</code> - The release hash of the currently tracked release  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getTargetReleaseHash('7cf02a6').then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.device.getTargetReleaseHash('7cf02a6', function(release) {
	console.log(release);
});
```
<a name="balena.models.device.pinToRelease"></a>

##### device.pinToRelease(uuidOrId, fullReleaseHashOrId) ⇒ <code>Promise</code>
Configures the device to run a particular release
and not get updated when the current application release changes.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Set a specific device to run a particular release  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| fullReleaseHashOrId | <code>String</code> \| <code>Number</code> | the hash of a successful release (string) or id (number) |

**Example**  
```js
balena.models.device.pinToRelease('7cf02a6', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.pinToRelease(123, 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.pinToRelease('7cf02a6', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.setSupervisorRelease"></a>

##### device.setSupervisorRelease(uuidOrId, supervisorVersionOrId) ⇒ <code>Promise</code>
Configures the device to run a particular supervisor release.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Set a specific device to run a particular supervisor release  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| supervisorVersionOrId | <code>String</code> \| <code>Number</code> | the version of a released supervisor (string) or id (number) |

**Example**  
```js
balena.models.device.setSupervisorRelease('7cf02a6', 'v10.8.0').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.setSupervisorRelease(123, 'v11.4.14').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.setSupervisorRelease('7cf02a6', 123, function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.trackApplicationRelease"></a>

##### device.trackApplicationRelease(uuidOrId) ⇒ <code>Promise</code>
The device's current release will be updated with each new successfully built release.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Configure a specific device to track the current application release  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.trackApplicationRelease('7cf02a6').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.trackApplicationRelease('7cf02a6', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.startOsUpdate"></a>

##### device.startOsUpdate(uuid, targetOsVersion) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Start an OS update on a device  
**Access**: public  
**Fulfil**: <code>Object</code> - action response  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | full device uuid |
| targetOsVersion | <code>String</code> | semver-compatible version for the target device Unsupported (unpublished) version will result in rejection. The version **must** be the exact version number, a "prod" variant and greater than the one running on the device. To resolve the semver-compatible range use `balena.model.os.getMaxSatisfyingVersion`. |

**Example**  
```js
balena.models.device.startOsUpdate('7cf02a687b74206f92cb455969cf8e98', '2.29.2+rev1.prod').then(function(status) {
	console.log(result.status);
});
```
**Example**  
```js
balena.models.device.startOsUpdate('7cf02a687b74206f92cb455969cf8e98', '2.29.2+rev1.prod', function(error, status) {
	if (error) throw error;
	console.log(result.status);
});
```
<a name="balena.models.device.getOsUpdateStatus"></a>

##### device.getOsUpdateStatus(uuid) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the OS update status of a device  
**Access**: public  
**Fulfil**: <code>Object</code> - action response  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | full device uuid |

**Example**  
```js
balena.models.device.getOsUpdateStatus('7cf02a687b74206f92cb455969cf8e98').then(function(status) {
	console.log(result.status);
});
```
**Example**  
```js
balena.models.device.getOsUpdateStatus('7cf02a687b74206f92cb455969cf8e98', function(error, status) {
	if (error) throw error;
	console.log(result.status);
});
```
<a name="balena.models.device.ping"></a>

##### device.ping(uuidOrId) ⇒ <code>Promise</code>
This is useful to signal that the supervisor is alive and responding.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Ping a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.ping('7cf02a6');
```
**Example**  
```js
balena.models.device.ping(123);
```
**Example**  
```js
balena.models.device.ping('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.getApplicationInfo"></a>

##### ~~device.getApplicationInfo(uuidOrId) ⇒ <code>Promise</code>~~
***Deprecated***

This is not supported on multicontainer devices, and will be removed in a future major release

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get application container information  
**Access**: public  
**Fulfil**: <code>Object</code> - application info  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getApplicationInfo('7cf02a6').then(function(appInfo) {
	console.log(appInfo);
});
```
**Example**  
```js
balena.models.device.getApplicationInfo(123).then(function(appInfo) {
	console.log(appInfo);
});
```
**Example**  
```js
balena.models.device.getApplicationInfo('7cf02a6', function(error, appInfo) {
	if (error) throw error;
	console.log(appInfo);
});
```
<a name="balena.models.device.identify"></a>

##### device.identify(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Identify device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.identify('7cf02a6');
```
**Example**  
```js
balena.models.device.identify(123);
```
**Example**  
```js
balena.models.device.identify('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.startApplication"></a>

##### ~~device.startApplication(uuidOrId) ⇒ <code>Promise</code>~~
***Deprecated***

This is not supported on multicontainer devices, and will be removed in a future major release

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Start application on device  
**Access**: public  
**Fulfil**: <code>String</code> - application container id  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.startApplication('7cf02a6').then(function(containerId) {
	console.log(containerId);
});
```
**Example**  
```js
balena.models.device.startApplication(123).then(function(containerId) {
	console.log(containerId);
});
```
**Example**  
```js
balena.models.device.startApplication('7cf02a6', function(error, containerId) {
	if (error) throw error;
	console.log(containerId);
});
```
<a name="balena.models.device.stopApplication"></a>

##### ~~device.stopApplication(uuidOrId) ⇒ <code>Promise</code>~~
***Deprecated***

This is not supported on multicontainer devices, and will be removed in a future major release

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Stop application on device  
**Access**: public  
**Fulfil**: <code>String</code> - application container id  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.stopApplication('7cf02a6').then(function(containerId) {
	console.log(containerId);
});
```
**Example**  
```js
balena.models.device.stopApplication(123).then(function(containerId) {
	console.log(containerId);
});
```
**Example**  
```js
balena.models.device.stopApplication('7cf02a6', function(error, containerId) {
	if (error) throw error;
	console.log(containerId);
});
```
<a name="balena.models.device.reboot"></a>

##### device.reboot(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Reboot device  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> |  | options |
| [options.force] | <code>Boolean</code> | <code>false</code> | override update lock |

**Example**  
```js
balena.models.device.reboot('7cf02a6');
```
**Example**  
```js
balena.models.device.reboot(123);
```
**Example**  
```js
balena.models.device.reboot('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.shutdown"></a>

##### device.shutdown(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Shutdown device  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> |  | options |
| [options.force] | <code>Boolean</code> | <code>false</code> | override update lock |

**Example**  
```js
balena.models.device.shutdown('7cf02a6');
```
**Example**  
```js
balena.models.device.shutdown(123);
```
**Example**  
```js
balena.models.device.shutdown('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.purge"></a>

##### device.purge(uuidOrId) ⇒ <code>Promise</code>
This function clears the user application's `/data` directory.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Purge device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.purge('7cf02a6');
```
**Example**  
```js
balena.models.device.purge(123);
```
**Example**  
```js
balena.models.device.purge('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.update"></a>

##### device.update(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Trigger an update check on the supervisor  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> |  | options |
| [options.force] | <code>Boolean</code> | <code>false</code> | override update lock |

**Example**  
```js
balena.models.device.update('7cf02a6', {
	force: true
});
```
**Example**  
```js
balena.models.device.update(123, {
	force: true
});
```
**Example**  
```js
balena.models.device.update('7cf02a6', {
	force: true
}, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.getSupervisorState"></a>

##### device.getSupervisorState(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the supervisor state on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getSupervisorState('7cf02a6').then(function(state) {
	console.log(state);
});
```
**Example**  
```js
balena.models.device.getSupervisorState(123).then(function(state) {
	console.log(state);
});
```
**Example**  
```js
balena.models.device.getSupervisorState('7cf02a6', function(error, state) {
	if (error) throw error;
	console.log(state);
});
```
<a name="balena.models.device.startService"></a>

##### device.startService(uuidOrId, imageId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Start a service on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| imageId | <code>Number</code> | id of the image to start |

**Example**  
```js
balena.models.device.startService('7cf02a6', 123).then(function() {
	...
});
```
**Example**  
```js
balena.models.device.startService(1, 123).then(function() {
	...
});
```
**Example**  
```js
balena.models.device.startService('7cf02a6', 123, function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.stopService"></a>

##### device.stopService(uuidOrId, imageId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Stop a service on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| imageId | <code>Number</code> | id of the image to stop |

**Example**  
```js
balena.models.device.stopService('7cf02a6', 123).then(function() {
	...
});
```
**Example**  
```js
balena.models.device.stopService(1, 123).then(function() {
	...
});
```
**Example**  
```js
balena.models.device.stopService('7cf02a6', 123, function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.restartService"></a>

##### device.restartService(uuidOrId, imageId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Restart a service on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| imageId | <code>Number</code> | id of the image to restart |

**Example**  
```js
balena.models.device.restartService('7cf02a6', 123).then(function() {
	...
});
```
**Example**  
```js
balena.models.device.restartService(1, 123).then(function() {
	...
});
```
**Example**  
```js
balena.models.device.restartService('7cf02a6', 123, function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.deviceType"></a>

#### models.deviceType : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.deviceType](#balena.models.deviceType) : <code>object</code>
    * [.get(idOrSlug, [options])](#balena.models.deviceType.get) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.deviceType.getAll) ⇒ <code>Promise</code>
    * [.getAllSupported([options])](#balena.models.deviceType.getAllSupported) ⇒ <code>Promise</code>
    * [.getBySlugOrName(slugOrName)](#balena.models.deviceType.getBySlugOrName) ⇒ <code>Promise</code>
    * [.getName(deviceTypeSlug)](#balena.models.deviceType.getName) ⇒ <code>Promise</code>
    * [.getInterpolatedPartials(deviceTypeSlug, initial)](#balena.models.deviceType.getInterpolatedPartials) ⇒ <code>Promise</code>
    * [.getInstructions(deviceTypeSlug)](#balena.models.deviceType.getInstructions) ⇒ <code>Promise</code>
    * [.getSlugByName(deviceTypeName)](#balena.models.deviceType.getSlugByName) ⇒ <code>Promise</code>

<a name="balena.models.deviceType.get"></a>

##### deviceType.get(idOrSlug, [options]) ⇒ <code>Promise</code>
This method returns a single device type.

**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get a single deviceType  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device types  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| idOrSlug | <code>String</code> \| <code>Number</code> |  | device type slug (string) or id |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.deviceType.get('raspberry-pi').then(function(deviceType) {
	console.log(deviceType);
});
```
**Example**  
```js
balena.models.deviceType.get('raspberry-pi', function(error, deviceType) {
	if (error) throw error;
	console.log(deviceType);
});
```
<a name="balena.models.deviceType.getAll"></a>

##### deviceType.getAll([options]) ⇒ <code>Promise</code>
This method returns all device types.

**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get all deviceTypes  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device types  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.deviceType.getAll().then(function(deviceTypes) {
	console.log(deviceTypes);
});
```
**Example**  
```js
balena.models.deviceType.getAll({ $select: ['name', 'slug'] }).then(function(deviceTypes) {
	console.log(deviceTypes);
})
```
**Example**  
```js
balena.models.deviceType.getAll(function(error, deviceTypes) {
	if (error) throw error;
	console.log(deviceTypes);
});
```
<a name="balena.models.deviceType.getAllSupported"></a>

##### deviceType.getAllSupported([options]) ⇒ <code>Promise</code>
This method returns all supported device types.

**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get all supported deviceTypes  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device types  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.deviceType.getAllSupported().then(function(deviceTypes) {
	console.log(deviceTypes);
});
```
**Example**  
```js
balena.models.deviceType.getAllSupported({ $select: ['name', 'slug'] }).then(function(deviceTypes) {
	console.log(deviceTypes);
})
```
**Example**  
```js
balena.models.deviceType.getAllSupported(function(error, deviceTypes) {
	if (error) throw error;
	console.log(deviceTypes);
});
```
<a name="balena.models.deviceType.getBySlugOrName"></a>

##### deviceType.getBySlugOrName(slugOrName) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get a deviceType by slug or name  
**Access**: public  
**Fulfil**: <code>Object</code> - device manifest  

| Param | Type | Description |
| --- | --- | --- |
| slugOrName | <code>String</code> | deviceType slug |

**Example**  
```js
balena.models.deviceType.getBySlugOrName('raspberry-pi').then(function(manifest) {
	console.log(manifest);
});
```
**Example**  
```js
balena.models.deviceType.getBySlugOrName('raspberry-pi', function(error, manifest) {
	if (error) throw error;
	console.log(manifest);
});
```
<a name="balena.models.deviceType.getName"></a>

##### deviceType.getName(deviceTypeSlug) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get display name for a device  
**Access**: public  
**Fulfil**: <code>String</code> - device display name  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeSlug | <code>String</code> | device type slug |

**Example**  
```js
balena.models.deviceType.getName('raspberry-pi').then(function(deviceTypeName) {
	console.log(deviceTypeName);
	// Raspberry Pi
});
```
**Example**  
```js
balena.models.deviceType.getName('raspberry-pi', function(error, deviceTypeName) {
	if (error) throw error;
	console.log(deviceTypeName);
	// Raspberry Pi
});
```
<a name="balena.models.deviceType.getInterpolatedPartials"></a>

##### deviceType.getInterpolatedPartials(deviceTypeSlug, initial) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get a contract with resolved partial templates  
**Access**: public  
**Fulfil**: <code>Contract</code> - device type contract with resolved partials  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeSlug | <code>String</code> | device type slug |
| initial | <code>any</code> | Other contract values necessary for interpreting contracts |

**Example**  
```js
balena.models.deviceType.getInterpolatedPartials('raspberry-pi').then(function(contract) {
 for (const partial in contract.partials) {
 	console.log(`${partial}: ${contract.partials[partial]}`);
 }
	// bootDevice: ["Connect power to the Raspberry Pi (v1 / Zero / Zero W)"]
});
```
<a name="balena.models.deviceType.getInstructions"></a>

##### deviceType.getInstructions(deviceTypeSlug) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get instructions for installing a host OS on a given device type  
**Access**: public  
**Fulfil**: <code>String[]</code> - step by step instructions for installing the host OS to the device  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeSlug | <code>String</code> | device type slug |

**Example**  
```js
balena.models.deviceType.getInstructions('raspberry-pi').then(function(instructions) {
 for (let instruction of instructions.values()) {
	 console.log(instruction);
 }
 // Insert the sdcard to the host machine.
 // Write the BalenaOS file you downloaded to the sdcard. We recommend using <a href="http://www.etcher.io/">Etcher</a>.
 // Wait for writing of BalenaOS to complete.
 // Remove the sdcard from the host machine.
 // Insert the freshly flashed sdcard into the Raspberry Pi (v1 / Zero / Zero W).
 // Connect power to the Raspberry Pi (v1 / Zero / Zero W) to boot the device.
});
```
**Example**  
```js
balena.models.deviceType.getInstructions('raspberry-pi', baseInstructions = {
 `Use the form on the left to configure and download {{name}} for your new {{deviceType.name}}.
 {{#each instructions}}
  {{{this}}}
 {{/each}}
 Your device should appear in your application dashboard within a few minutes. Have fun!`
}).then(function(instructions) {
 for (let instruction of instructions.values()) {
	 console.log(instruction);
 }
 // Use the form on the left to configure and download BalenaOS for your new Raspberry Pi (v1 / Zero / Zero W).
 // Insert the sdcard to the host machine.
 // Write the BalenaOS file you downloaded to the sdcard. We recommend using <a href="http://www.etcher.io/">Etcher</a>.
 // Wait for writing of BalenaOS to complete.
 // Remove the sdcard from the host machine.
 // Insert the freshly flashed sdcard into the Raspberry Pi (v1 / Zero / Zero W).
 // Connect power to the Raspberry Pi (v1 / Zero / Zero W) to boot the device.
 // Your device should appear in your application dashboard within a few minutes. Have fun!
});
```
<a name="balena.models.deviceType.getSlugByName"></a>

##### deviceType.getSlugByName(deviceTypeName) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get device slug  
**Access**: public  
**Fulfil**: <code>String</code> - device slug name  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeName | <code>String</code> | device type name |

**Example**  
```js
balena.models.deviceType.getSlugByName('Raspberry Pi').then(function(deviceTypeSlug) {
	console.log(deviceTypeSlug);
	// raspberry-pi
});
```
**Example**  
```js
balena.models.deviceType.getSlugByName('Raspberry Pi', function(error, deviceTypeSlug) {
	if (error) throw error;
	console.log(deviceTypeSlug);
	// raspberry-pi
});
```
<a name="balena.models.apiKey"></a>

#### models.apiKey : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.apiKey](#balena.models.apiKey) : <code>object</code>
    * [.create(name, [description])](#balena.models.apiKey.create) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.apiKey.getAll) ⇒ <code>Promise</code>
    * [.getAllNamedUserApiKeys([options])](#balena.models.apiKey.getAllNamedUserApiKeys) ⇒ <code>Promise</code>
    * [.getProvisioningApiKeysByApplication(nameOrSlugOrId, [options])](#balena.models.apiKey.getProvisioningApiKeysByApplication) ⇒ <code>Promise</code>
    * [.update(id, apiKeyInfo)](#balena.models.apiKey.update) ⇒ <code>Promise</code>
    * [.revoke(id)](#balena.models.apiKey.revoke) ⇒ <code>Promise</code>

<a name="balena.models.apiKey.create"></a>

##### apiKey.create(name, [description]) ⇒ <code>Promise</code>
This method registers a new api key for the current user with the name given.

**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Creates a new user API key  
**Access**: public  
**Fulfil**: <code>String</code> - API key  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>String</code> |  | the API key name |
| [description] | <code>String</code> | <code></code> | the API key description |

**Example**  
```js
balena.models.apiKey.create(apiKeyName).then(function(apiKey) {
	console.log(apiKey);
});
```
**Example**  
```js
balena.models.apiKey.create(apiKeyName, apiKeyDescription).then(function(apiKey) {
	console.log(apiKey);
});
```
**Example**  
```js
balena.models.apiKey.create(apiKeyName, function(error, apiKey) {
	if (error) throw error;
	console.log(apiKey);
});
```
<a name="balena.models.apiKey.getAll"></a>

##### apiKey.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Get all API keys  
**Access**: public  
**Fulfil**: <code>Object[]</code> - apiKeys  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.apiKey.getAll().then(function(apiKeys) {
	console.log(apiKeys);
});
```
**Example**  
```js
balena.models.apiKey.getAll(function(error, apiKeys) {
	if (error) throw error;
	console.log(apiKeys);
});
```
<a name="balena.models.apiKey.getAllNamedUserApiKeys"></a>

##### apiKey.getAllNamedUserApiKeys([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Get all named user API keys of the current user  
**Access**: public  
**Fulfil**: <code>Object[]</code> - apiKeys  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.apiKey.getAllNamedUserApiKeys().then(function(apiKeys) {
	console.log(apiKeys);
});
```
**Example**  
```js
balena.models.apiKey.getAllNamedUserApiKeys(function(error, apiKeys) {
	if (error) throw error;
	console.log(apiKeys);
});
```
<a name="balena.models.apiKey.getProvisioningApiKeysByApplication"></a>

##### apiKey.getProvisioningApiKeysByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Get all provisioning API keys for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - apiKeys  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.apiKey.getProvisioningApiKeysByApplication('myorganization/myapp').then(function(apiKeys) {
	console.log(apiKeys);
});
```
**Example**  
```js
balena.models.apiKey.getProvisioningApiKeysByApplication(123, function(error, apiKeys) {
	if (error) throw error;
	console.log(apiKeys);
});
```
<a name="balena.models.apiKey.update"></a>

##### apiKey.update(id, apiKeyInfo) ⇒ <code>Promise</code>
**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Update the details of an API key  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | API key id |
| apiKeyInfo | <code>Object</code> | an object with the updated name or description |

**Example**  
```js
balena.models.apiKey.update(123, { name: 'updatedName' });
```
**Example**  
```js
balena.models.apiKey.update(123, { description: 'updated description' });
```
**Example**  
```js
balena.models.apiKey.update(123, { name: 'updatedName', description: 'updated description' });
```
**Example**  
```js
balena.models.apiKey.update(123, { name: 'updatedName', description: 'updated description' }, function(error, apiKeys) {
	if (error) throw error;
	console.log(apiKeys);
});
```
<a name="balena.models.apiKey.revoke"></a>

##### apiKey.revoke(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Revoke an API key  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | API key id |

**Example**  
```js
balena.models.apiKey.revoke(123);
```
**Example**  
```js
balena.models.apiKey.revoke(123, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.key"></a>

#### models.key : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.key](#balena.models.key) : <code>object</code>
    * [.getAll([options])](#balena.models.key.getAll) ⇒ <code>Promise</code>
    * [.get(id)](#balena.models.key.get) ⇒ <code>Promise</code>
    * [.remove(id)](#balena.models.key.remove) ⇒ <code>Promise</code>
    * [.create(title, key)](#balena.models.key.create) ⇒ <code>Promise</code>

<a name="balena.models.key.getAll"></a>

##### key.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>key</code>](#balena.models.key)  
**Summary**: Get all ssh keys  
**Access**: public  
**Fulfil**: <code>Object[]</code> - ssh keys  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.key.getAll().then(function(keys) {
	console.log(keys);
});
```
**Example**  
```js
balena.models.key.getAll(function(error, keys) {
	if (error) throw error;
	console.log(keys);
});
```
<a name="balena.models.key.get"></a>

##### key.get(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>key</code>](#balena.models.key)  
**Summary**: Get a single ssh key  
**Access**: public  
**Fulfil**: <code>Object</code> - ssh key  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | key id |

**Example**  
```js
balena.models.key.get(51).then(function(key) {
	console.log(key);
});
```
**Example**  
```js
balena.models.key.get(51, function(error, key) {
	if (error) throw error;
	console.log(key);
});
```
<a name="balena.models.key.remove"></a>

##### key.remove(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>key</code>](#balena.models.key)  
**Summary**: Remove ssh key  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | key id |

**Example**  
```js
balena.models.key.remove(51);
```
**Example**  
```js
balena.models.key.remove(51, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.key.create"></a>

##### key.create(title, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>key</code>](#balena.models.key)  
**Summary**: Create a ssh key  
**Access**: public  
**Fulfil**: <code>Object</code> - ssh key  

| Param | Type | Description |
| --- | --- | --- |
| title | <code>String</code> | key title |
| key | <code>String</code> | the public ssh key |

**Example**  
```js
balena.models.key.create('Main', 'ssh-rsa AAAAB....').then(function(key) {
	console.log(key);
});
```
**Example**  
```js
balena.models.key.create('Main', 'ssh-rsa AAAAB....', function(error, key) {
	if (error) throw error;
	console.log(key);
});
```
<a name="balena.models.organization"></a>

#### models.organization : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.organization](#balena.models.organization) : <code>object</code>
    * [.membership](#balena.models.organization.membership) : <code>object</code>
        * [.get(membershipId, [options])](#balena.models.organization.membership.get) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.organization.membership.getAll) ⇒ <code>Promise</code>
        * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.membership.getAllByOrganization) ⇒ <code>Promise</code>
        * [.create(options)](#balena.models.organization.membership.create) ⇒ <code>Promise</code>
        * [.changeRole(idOrUniqueKey, roleName)](#balena.models.organization.membership.changeRole) ⇒ <code>Promise</code>
        * [.remove(id)](#balena.models.organization.membership.remove) ⇒ <code>Promise</code>
    * [.invite](#balena.models.organization.invite) : <code>object</code>
        * [.getAll([options])](#balena.models.organization.invite.getAll) ⇒ <code>Promise</code>
        * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.invite.getAllByOrganization) ⇒ <code>Promise</code>
        * [.create(handleOrId, options, [message])](#balena.models.organization.invite.create) ⇒ <code>Promise</code>
        * [.revoke(id)](#balena.models.organization.invite.revoke) ⇒ <code>Promise</code>
        * [.accept(invitationToken)](#balena.models.organization.invite.accept) ⇒ <code>Promise</code>
    * [.create(options)](#balena.models.organization.create) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.organization.getAll) ⇒ <code>Promise</code>
    * [.get(handleOrId, [options])](#balena.models.organization.get) ⇒ <code>Promise</code>
    * [.remove(handleOrId)](#balena.models.organization.remove) ⇒ <code>Promise</code>

<a name="balena.models.organization.membership"></a>

##### organization.membership : <code>object</code>
**Kind**: static namespace of [<code>organization</code>](#balena.models.organization)  

* [.membership](#balena.models.organization.membership) : <code>object</code>
    * [.get(membershipId, [options])](#balena.models.organization.membership.get) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.organization.membership.getAll) ⇒ <code>Promise</code>
    * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.membership.getAllByOrganization) ⇒ <code>Promise</code>
    * [.create(options)](#balena.models.organization.membership.create) ⇒ <code>Promise</code>
    * [.changeRole(idOrUniqueKey, roleName)](#balena.models.organization.membership.changeRole) ⇒ <code>Promise</code>
    * [.remove(id)](#balena.models.organization.membership.remove) ⇒ <code>Promise</code>

<a name="balena.models.organization.membership.get"></a>

###### membership.get(membershipId, [options]) ⇒ <code>Promise</code>
This method returns a single organization membership.

**Kind**: static method of [<code>membership</code>](#balena.models.organization.membership)  
**Summary**: Get a single organization membership  
**Access**: public  
**Fulfil**: <code>Object</code> - organization membership  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| membershipId | <code>number</code> \| <code>Object</code> |  | the id or an object with the unique `user` & `is_member_of__organization` numeric pair of the membership |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.organization.membership.get(5).then(function(memberships) {
	console.log(memberships);
});
```
**Example**  
```js
balena.models.organization.membership.get(5, function(error, memberships) {
	console.log(memberships);
});
```
<a name="balena.models.organization.membership.getAll"></a>

###### membership.getAll([options]) ⇒ <code>Promise</code>
This method returns all organization memberships.

**Kind**: static method of [<code>membership</code>](#balena.models.organization.membership)  
**Summary**: Get all organization memberships  
**Access**: public  
**Fulfil**: <code>Object[]</code> - organization memberships  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.organization.membership.getAll().then(function(memberships) {
	console.log(memberships);
});
```
**Example**  
```js
balena.models.organization.membership.getAll(function(error, memberships) {
	console.log(memberships);
});
```
<a name="balena.models.organization.membership.getAllByOrganization"></a>

###### membership.getAllByOrganization(handleOrId, [options]) ⇒ <code>Promise</code>
This method returns all organization memberships for a specific organization.

**Kind**: static method of [<code>membership</code>](#balena.models.organization.membership)  
**Summary**: Get all memberships by organization  
**Access**: public  
**Fulfil**: <code>Object[]</code> - organization memberships  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| handleOrId | <code>String</code> \| <code>Number</code> |  | organization handle (string) or id (number). |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.organization.membership.getAllByOrganization('MyOrg').then(function(memberships) {
	console.log(memberships);
});
```
**Example**  
```js
balena.models.organization.membership.getAllByOrganization(123).then(function(memberships) {
	console.log(memberships);
});
```
**Example**  
```js
balena.models.organization.membership.getAllByOrganization(123, function(error, memberships) {
	console.log(memberships);
});
```
<a name="balena.models.organization.membership.create"></a>

###### membership.create(options) ⇒ <code>Promise</code>
This method adds a user to an organization by their usename.

**Kind**: static method of [<code>membership</code>](#balena.models.organization.membership)  
**Summary**: Creates a new membership for an organization  
**Access**: public  
**Fulfil**: <code>Object</code> - organization membership  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | membership creation parameters |
| options.organization | <code>String</code> \| <code>Number</code> |  | organization handle (string), or id (number) |
| options.username | <code>String</code> |  | the username of the balena user that will become a member |
| [options.roleName] | <code>String</code> | <code>&quot;member&quot;</code> | the role name to be granted to the membership |

**Example**  
```js
balena.models.organization.membership.create({ organization: "myorg", username: "user123", roleName: "member" }).then(function(membership) {
	console.log(membership);
});
```
**Example**  
```js
balena.models.organization.membership.create({ organization: 53, username: "user123" }, function(error, membership) {
	console.log(membership);
});
```
<a name="balena.models.organization.membership.changeRole"></a>

###### membership.changeRole(idOrUniqueKey, roleName) ⇒ <code>Promise</code>
This method changes the role of an organization member.

**Kind**: static method of [<code>membership</code>](#balena.models.organization.membership)  
**Summary**: Changes the role of an organization member  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| idOrUniqueKey | <code>Number</code> \| <code>Object</code> | the id or an object with the unique `user` & `is_member_of__organization` numeric pair of the membership that will be changed |
| roleName | <code>String</code> | the role name to be granted to the membership |

**Example**  
```js
balena.models.organization.membership.changeRole(123, "member").then(function() {
	console.log('OK');
});
```
**Example**  
```js
balena.models.organization.membership.changeRole({
	user: 123,
	is_member_of__organization: 125,
}, "member").then(function() {
	console.log('OK');
});
```
**Example**  
```js
balena.models.organization.membership.changeRole(123, "administrator", function(error) {
	console.log('OK');
});
```
<a name="balena.models.organization.membership.remove"></a>

###### membership.remove(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>membership</code>](#balena.models.organization.membership)  
**Summary**: Remove a membership  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | organization membership id |

**Example**  
```js
balena.models.organization.membership.remove(123);
```
**Example**  
```js
balena.models.organization.membership.remove({
	user: 123,
	is_member_of__application: 125,
});
```
**Example**  
```js
balena.models.organization.membership.remove(123,function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.organization.invite"></a>

##### organization.invite : <code>object</code>
**Kind**: static namespace of [<code>organization</code>](#balena.models.organization)  

* [.invite](#balena.models.organization.invite) : <code>object</code>
    * [.getAll([options])](#balena.models.organization.invite.getAll) ⇒ <code>Promise</code>
    * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.invite.getAllByOrganization) ⇒ <code>Promise</code>
    * [.create(handleOrId, options, [message])](#balena.models.organization.invite.create) ⇒ <code>Promise</code>
    * [.revoke(id)](#balena.models.organization.invite.revoke) ⇒ <code>Promise</code>
    * [.accept(invitationToken)](#balena.models.organization.invite.accept) ⇒ <code>Promise</code>

<a name="balena.models.organization.invite.getAll"></a>

###### invite.getAll([options]) ⇒ <code>Promise</code>
This method returns all invites.

**Kind**: static method of [<code>invite</code>](#balena.models.organization.invite)  
**Summary**: Get all invites  
**Access**: public  
**Fulfil**: <code>Object[]</code> - invites  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.organization.invite.getAll().then(function(invites) {
	console.log(invites);
});
```
**Example**  
```js
balena.models.organization.invite.getAll(function(error, invites) {
	console.log(invites);
});
```
<a name="balena.models.organization.invite.getAllByOrganization"></a>

###### invite.getAllByOrganization(handleOrId, [options]) ⇒ <code>Promise</code>
This method returns all invites for a specific organization.

**Kind**: static method of [<code>invite</code>](#balena.models.organization.invite)  
**Summary**: Get all invites by organization  
**Access**: public  
**Fulfil**: <code>Object[]</code> - invites  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| handleOrId | <code>String</code> \| <code>Number</code> |  | organization handle (string), or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.organization.invite.getAllByOrganization('MyOrg').then(function(invites) {
	console.log(invites);
});
```
**Example**  
```js
balena.models.organization.invite.getAllByOrganization(123).then(function(invites) {
	console.log(invites);
});
```
**Example**  
```js
balena.models.organization.invite.getAllByOrganization(123, function(error, invites) {
	console.log(invites);
});
```
<a name="balena.models.organization.invite.create"></a>

###### invite.create(handleOrId, options, [message]) ⇒ <code>Promise</code>
This method invites a user by their email to an organization.

**Kind**: static method of [<code>invite</code>](#balena.models.organization.invite)  
**Summary**: Creates a new invite for an organization  
**Access**: public  
**Fulfil**: <code>String</code> - organization invite  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| handleOrId | <code>String</code> \| <code>Number</code> |  | organization handle (string), or id (number) |
| options | <code>Object</code> |  | invite creation parameters |
| options.invitee | <code>String</code> |  | the email/balena_username of the invitee |
| [options.roleName] | <code>String</code> | <code>&quot;developer&quot;</code> | the role name to be granted to the invitee |
| [message] | <code>String</code> | <code></code> | the message to send along with the invite |

**Example**  
```js
balena.models.organization.invite.create('MyOrg', { invitee: "invitee@example.org", roleName: "developer", message: "join my org" }).then(function(invite) {
	console.log(invite);
});
```
**Example**  
```js
balena.models.organization.invite.create(53, { invitee: "invitee@example.org" }, function(error, invite) {
	console.log(invite);
});
```
<a name="balena.models.organization.invite.revoke"></a>

###### invite.revoke(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>invite</code>](#balena.models.organization.invite)  
**Summary**: Revoke an invite  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | organization invite id |

**Example**  
```js
balena.models.organization.invite.revoke(123);
```
**Example**  
```js
balena.models.organization.invite.revoke(123,function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.organization.invite.accept"></a>

###### invite.accept(invitationToken) ⇒ <code>Promise</code>
This method adds the calling user to the organization.

**Kind**: static method of [<code>invite</code>](#balena.models.organization.invite)  
**Summary**: Accepts an invite  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| invitationToken | <code>String</code> | invite token |

**Example**  
```js
balena.models.organization.invite.accept("qwerty-invitation-token");
```
**Example**  
```js
balena.models.organization.invite.accept("qwerty-invitation-token", function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.organization.create"></a>

##### organization.create(options) ⇒ <code>Promise</code>
This method creates a new organization with the current user as an administrator.

**Kind**: static method of [<code>organization</code>](#balena.models.organization)  
**Summary**: Creates a new organization  
**Access**: public  
**Fulfil**: <code>String</code> - Organization  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Organization parameters to use. |
| options.name | <code>String</code> | Required: the name of the organization that will be created. |
| [options.handle] | <code>String</code> | The handle of the organization that will be created. |

**Example**  
```js
balena.models.organization.create({ name:'MyOrganization' }).then(function(organization) {
	console.log(organization);
});
```
**Example**  
```js
balena.models.organization.create({ name:'MyOrganization' }, function(error, organization) {
	if (error) throw error;
	console.log(organization);
});
```
<a name="balena.models.organization.getAll"></a>

##### organization.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>organization</code>](#balena.models.organization)  
**Summary**: Get all Organizations  
**Access**: public  
**Fulfil**: <code>Object[]</code> - organizations  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.organization.getAll().then(function(organizations) {
	console.log(organizations);
});
```
**Example**  
```js
balena.models.organization.getAll(function(error, organizations) {
	if (error) throw error;
	console.log(organizations);
});
```
<a name="balena.models.organization.get"></a>

##### organization.get(handleOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>organization</code>](#balena.models.organization)  
**Summary**: Get a single organization  
**Access**: public  
**Fulfil**: <code>Object</code> - organization  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| handleOrId | <code>String</code> \| <code>Number</code> |  | organization handle (string) or id (number). |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.organization.get('myorganization').then(function(organization) {
	console.log(organization);
});
```
**Example**  
```js
balena.models.organization.get(123).then(function(organization) {
	console.log(organization);
});
```
**Example**  
```js
balena.models.organization.get('myorganization', function(error, organization) {
	if (error) throw error;
	console.log(organization);
});
```
<a name="balena.models.organization.remove"></a>

##### organization.remove(handleOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>organization</code>](#balena.models.organization)  
**Summary**: Remove an Organization  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| handleOrId | <code>String</code> \| <code>Number</code> | organization handle (string) or id (number). |

**Example**  
```js
balena.models.organization.remove(123);
```
**Example**  
```js
balena.models.organization.remove(123, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.os"></a>

#### models.os : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.os](#balena.models.os) : <code>object</code>
    * [.getDownloadSize(deviceType, [version])](#balena.models.os.getDownloadSize) ⇒ <code>Promise</code>
    * [.getSupportedVersions(deviceType)](#balena.models.os.getSupportedVersions) ⇒ <code>Promise</code>
    * [.getMaxSatisfyingVersion(deviceType, versionOrRange)](#balena.models.os.getMaxSatisfyingVersion) ⇒ <code>Promise</code>
    * [.getLastModified(deviceType, [version])](#balena.models.os.getLastModified) ⇒ <code>Promise</code>
    * [.download(deviceType, [version])](#balena.models.os.download) ⇒ <code>Promise</code>
    * [.getConfig(nameOrSlugOrId, options)](#balena.models.os.getConfig) ⇒ <code>Promise</code>
    * [.isSupportedOsUpdate(deviceType, currentVersion, targetVersion)](#balena.models.os.isSupportedOsUpdate) ⇒ <code>Promise</code>
    * [.getSupportedOsUpdateVersions(deviceType, currentVersion)](#balena.models.os.getSupportedOsUpdateVersions) ⇒ <code>Promise</code>
    * [.isArchitectureCompatibleWith(osArchitecture, applicationArchitecture)](#balena.models.os.isArchitectureCompatibleWith) ⇒ <code>Boolean</code>

<a name="balena.models.os.getDownloadSize"></a>

##### os.getDownloadSize(deviceType, [version]) ⇒ <code>Promise</code>
**Note!** Currently only the raw (uncompressed) size is reported.

**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get OS download size estimate  
**Access**: public  
**Fulfil**: <code>Number</code> - OS image download size, in bytes.  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| [version] | <code>String</code> | semver-compatible version or 'latest', defaults to 'latest'. The version **must** be the exact version number. |

**Example**  
```js
balena.models.os.getDownloadSize('raspberry-pi').then(function(size) {
	console.log('The OS download size for raspberry-pi', size);
});

balena.models.os.getDownloadSize('raspberry-pi', function(error, size) {
	if (error) throw error;
	console.log('The OS download size for raspberry-pi', size);
});
```
<a name="balena.models.os.getSupportedVersions"></a>

##### os.getSupportedVersions(deviceType) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get OS supported versions  
**Access**: public  
**Fulfil**: <code>Object</code> - the versions information, of the following structure:
* versions - an array of strings,
containing exact version numbers supported by the current environment
* recommended - the recommended version, i.e. the most recent version
that is _not_ pre-release, can be `null`
* latest - the most recent version, including pre-releases
* default - recommended (if available) or latest otherwise  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |

**Example**  
```js
balena.models.os.getSupportedVersions('raspberry-pi').then(function(osVersions) {
	console.log('Supported OS versions for raspberry-pi', osVersions);
});

balena.models.os.getSupportedVersions('raspberry-pi', function(error, osVersions) {
	if (error) throw error;
	console.log('Supported OS versions for raspberry-pi', osVersions);
});
```
<a name="balena.models.os.getMaxSatisfyingVersion"></a>

##### os.getMaxSatisfyingVersion(deviceType, versionOrRange) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get the max OS version satisfying the given range  
**Access**: public  
**Fulfil**: <code>String\|null</code> - the version number, or `null` if no matching versions are found  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| versionOrRange | <code>String</code> | can be one of * the exact version number, in which case it is returned if the version is supported, or `null` is returned otherwise, * a [semver](https://www.npmjs.com/package/semver)-compatible range specification, in which case the most recent satisfying version is returned if it exists, or `null` is returned, * `'latest'` in which case the most recent version is returned, including pre-releases, * `'recommended'` in which case the recommended version is returned, i.e. the most recent version excluding pre-releases, which can be `null` if only pre-release versions are available, * `'default'` in which case the recommended version is returned if available, or `latest` is returned otherwise. Defaults to `'latest'`. |

**Example**  
```js
balena.models.os.getSupportedVersions('raspberry-pi').then(function(osVersions) {
	console.log('Supported OS versions for raspberry-pi', osVersions);
});

balena.models.os.getSupportedVersions('raspberry-pi', function(error, osVersions) {
	if (error) throw error;
	console.log('Supported OS versions for raspberry-pi', osVersions);
});
```
<a name="balena.models.os.getLastModified"></a>

##### os.getLastModified(deviceType, [version]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get the OS image last modified date  
**Access**: public  
**Fulfil**: <code>Date</code> - last modified date  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| [version] | <code>String</code> | semver-compatible version or 'latest', defaults to 'latest'. Unsupported (unpublished) version will result in rejection. The version **must** be the exact version number. To resolve the semver-compatible range use `balena.model.os.getMaxSatisfyingVersion`. |

**Example**  
```js
balena.models.os.getLastModified('raspberry-pi').then(function(date) {
	console.log('The raspberry-pi image was last modified in ' + date);
});

balena.models.os.getLastModified('raspberrypi3', '2.0.0').then(function(date) {
	console.log('The raspberry-pi image was last modified in ' + date);
});

balena.models.os.getLastModified('raspberry-pi', function(error, date) {
	if (error) throw error;
	console.log('The raspberry-pi image was last modified in ' + date);
});
```
<a name="balena.models.os.download"></a>

##### os.download(deviceType, [version]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Download an OS image  
**Access**: public  
**Fulfil**: <code>ReadableStream</code> - download stream  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| [version] | <code>String</code> | semver-compatible version or 'latest', defaults to 'latest' Unsupported (unpublished) version will result in rejection. The version **must** be the exact version number. To resolve the semver-compatible range use `balena.model.os.getMaxSatisfyingVersion`. |

**Example**  
```js
balena.models.os.download('raspberry-pi').then(function(stream) {
	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
});

balena.models.os.download('raspberry-pi', function(error, stream) {
	if (error) throw error;
	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
});
```
<a name="balena.models.os.getConfig"></a>

##### os.getConfig(nameOrSlugOrId, options) ⇒ <code>Promise</code>
Builds the config.json for a device in the given application, with the given
options.

Note that an OS version is required. For versions < 2.7.8, config
generation is only supported when using a session token, not an API key.

**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get an applications config.json  
**Access**: public  
**Fulfil**: <code>Object</code> - application configuration as a JSON object.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number). |
| options | <code>Object</code> |  | OS configuration options to use. |
| options.version | <code>String</code> |  | Required: the OS version of the image. |
| [options.network] | <code>String</code> | <code>&#x27;ethernet&#x27;</code> | The network type that the device will use, one of 'ethernet' or 'wifi'. |
| [options.appUpdatePollInterval] | <code>Number</code> |  | How often the OS checks for updates, in minutes. |
| [options.wifiKey] | <code>String</code> |  | The key for the wifi network the device will connect to. |
| [options.wifiSsid] | <code>String</code> |  | The ssid for the wifi network the device will connect to. |
| [options.ip] | <code>String</code> |  | static ip address. |
| [options.gateway] | <code>String</code> |  | static ip gateway. |
| [options.netmask] | <code>String</code> |  | static ip netmask. |

**Example**  
```js
balena.models.os.getConfig('MyApp', { version: ''2.12.7+rev1.prod'' }).then(function(config) {
	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
});

balena.models.os.getConfig(123, { version: ''2.12.7+rev1.prod'' }).then(function(config) {
	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
});

balena.models.os.getConfig('MyApp', { version: ''2.12.7+rev1.prod'' }, function(error, config) {
	if (error) throw error;
	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
});
```
<a name="balena.models.os.isSupportedOsUpdate"></a>

##### os.isSupportedOsUpdate(deviceType, currentVersion, targetVersion) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Returns whether the provided device type supports OS updates between the provided balenaOS versions  
**Access**: public  
**Fulfil**: <code>Boolean</code> - whether upgrading the OS to the target version is supported  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| currentVersion | <code>String</code> | semver-compatible version for the starting OS version |
| targetVersion | <code>String</code> | semver-compatible version for the target OS version |

**Example**  
```js
balena.models.os.isSupportedOsUpgrade('raspberry-pi', '2.9.6+rev2.prod', '2.29.2+rev1.prod').then(function(isSupported) {
	console.log(isSupported);
});

balena.models.os.isSupportedOsUpgrade('raspberry-pi', '2.9.6+rev2.prod', '2.29.2+rev1.prod', function(error, config) {
	if (error) throw error;
	console.log(isSupported);
});
```
<a name="balena.models.os.getSupportedOsUpdateVersions"></a>

##### os.getSupportedOsUpdateVersions(deviceType, currentVersion) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Returns the supported OS update targets for the provided device type  
**Access**: public  
**Fulfil**: <code>Object</code> - the versions information, of the following structure:
* versions - an array of strings,
containing exact version numbers that OS update is supported
* recommended - the recommended version, i.e. the most recent version
that is _not_ pre-release, can be `null`
* current - the provided current version after normalization  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| currentVersion | <code>String</code> | semver-compatible version for the starting OS version |

**Example**  
```js
balena.models.os.getSupportedOsUpdateVersions('raspberry-pi', '2.9.6+rev2.prod').then(function(isSupported) {
	console.log(isSupported);
});

balena.models.os.getSupportedOsUpdateVersions('raspberry-pi', '2.9.6+rev2.prod', function(error, config) {
	if (error) throw error;
	console.log(isSupported);
});
```
<a name="balena.models.os.isArchitectureCompatibleWith"></a>

##### os.isArchitectureCompatibleWith(osArchitecture, applicationArchitecture) ⇒ <code>Boolean</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Returns whether the specified OS architecture is compatible with the target architecture  
**Returns**: <code>Boolean</code> - - Whether the specified OS architecture is capable of running
applications build for the target architecture  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| osArchitecture | <code>String</code> | The OS's architecture as specified in its device type |
| applicationArchitecture | <code>String</code> | The application's architecture as specified in its device type |

**Example**  
```js
const result1 = balena.models.os.isArchitectureCompatibleWith('aarch64', 'armv7hf');
console.log(result1);

const result2 = balena.models.os.isArchitectureCompatibleWith('armv7hf', 'amd64');
console.log(result2);
```
<a name="balena.models.hostapp"></a>

#### models.hostapp : <code>object</code>
**Beta** The hostapp methods are still in beta and might change in a non-major release.

**Kind**: static namespace of [<code>models</code>](#balena.models)  
<a name="balena.models.hostapp.getAllOsVersions"></a>

##### hostapp.getAllOsVersions(deviceTypes) ⇒ <code>Promise</code>
**Kind**: static method of [<code>hostapp</code>](#balena.models.hostapp)  
**Summary**: Get all OS versions for the passed device types  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypes | <code>Array.&lt;String&gt;</code> | device type slugs |

**Example**  
```js
balena.models.hostapp.getAllOsVersions(['fincm3', 'raspberrypi3']);
```
<a name="balena.models.config"></a>

#### models.config : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.config](#balena.models.config) : <code>object</code>
    * [.getAll()](#balena.models.config.getAll) ⇒ <code>Promise</code>
    * ~~[.getDeviceTypes()](#balena.models.config.getDeviceTypes) ⇒ <code>Promise</code>~~
    * [.getDeviceOptions(deviceType)](#balena.models.config.getDeviceOptions) ⇒ <code>Promise</code>

<a name="balena.models.config.getAll"></a>

##### config.getAll() ⇒ <code>Promise</code>
**Kind**: static method of [<code>config</code>](#balena.models.config)  
**Summary**: Get all configuration  
**Access**: public  
**Fulfil**: <code>Object</code> - configuration  
**Example**  
```js
balena.models.config.getAll().then(function(config) {
	console.log(config);
});
```
**Example**  
```js
balena.models.config.getAll(function(error, config) {
	if (error) throw error;
	console.log(config);
});
```
<a name="balena.models.config.getDeviceTypes"></a>

##### ~~config.getDeviceTypes() ⇒ <code>Promise</code>~~
***Deprecated***

**Kind**: static method of [<code>config</code>](#balena.models.config)  
**Summary**: Get device types  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device types  
**Example**  
```js
balena.models.config.getDeviceTypes().then(function(deviceTypes) {
	console.log(deviceTypes);
});
```
**Example**  
```js
balena.models.config.getDeviceTypes(function(error, deviceTypes) {
	if (error) throw error;
	console.log(deviceTypes);
})
```
<a name="balena.models.config.getDeviceOptions"></a>

##### config.getDeviceOptions(deviceType) ⇒ <code>Promise</code>
**Kind**: static method of [<code>config</code>](#balena.models.config)  
**Summary**: Get configuration/initialization options for a device type  
**Access**: public  
**Fulfil**: <code>Object[]</code> - configuration options  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |

**Example**  
```js
balena.models.config.getDeviceOptions('raspberry-pi').then(function(options) {
	console.log(options);
});
```
**Example**  
```js
balena.models.config.getDeviceOptions('raspberry-pi', function(error, options) {
	if (error) throw error;
	console.log(options);
});
```
<a name="balena.models.release"></a>

#### models.release : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.release](#balena.models.release) : <code>object</code>
    * [.tags](#balena.models.release.tags) : <code>object</code>
        * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.release.tags.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByRelease(commitOrId, [options])](#balena.models.release.tags.getAllByRelease) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.release.tags.getAll) ⇒ <code>Promise</code>
        * [.set(commitOrId, tagKey, value)](#balena.models.release.tags.set) ⇒ <code>Promise</code>
        * [.remove(commitOrId, tagKey)](#balena.models.release.tags.remove) ⇒ <code>Promise</code>
    * [.get(commitOrId, [options])](#balena.models.release.get) ⇒ <code>Promise</code>
    * [.getWithImageDetails(commitOrId, [options])](#balena.models.release.getWithImageDetails) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.release.getAllByApplication) ⇒ <code>Promise</code>
    * [.getLatestByApplication(nameOrSlugOrId, [options])](#balena.models.release.getLatestByApplication) ⇒ <code>Promise</code>
    * [.createFromUrl(nameOrSlugOrId, urlDeployOptions)](#balena.models.release.createFromUrl) ⇒ <code>Promise</code>

<a name="balena.models.release.tags"></a>

##### release.tags : <code>object</code>
**Kind**: static namespace of [<code>release</code>](#balena.models.release)  

* [.tags](#balena.models.release.tags) : <code>object</code>
    * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.release.tags.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByRelease(commitOrId, [options])](#balena.models.release.tags.getAllByRelease) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.release.tags.getAll) ⇒ <code>Promise</code>
    * [.set(commitOrId, tagKey, value)](#balena.models.release.tags.set) ⇒ <code>Promise</code>
    * [.remove(commitOrId, tagKey)](#balena.models.release.tags.remove) ⇒ <code>Promise</code>

<a name="balena.models.release.tags.getAllByApplication"></a>

###### tags.getAllByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Get all release tags for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - release tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.tags.getAllByApplication('MyApp').then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.release.tags.getAllByApplication(999999).then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.release.tags.getAllByApplication('MyApp', function(error, tags) {
	if (error) throw error;
	console.log(tags)
});
```
<a name="balena.models.release.tags.getAllByRelease"></a>

###### tags.getAllByRelease(commitOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Get all release tags for a release  
**Access**: public  
**Fulfil**: <code>Object[]</code> - release tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| commitOrId | <code>String</code> \| <code>Number</code> |  | release commit (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.tags.getAllByRelease(123).then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.release.tags.getAllByRelease('7cf02a6').then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.release.tags.getAllByRelease(123, function(error, tags) {
	if (error) throw error;
	console.log(tags)
});
```
<a name="balena.models.release.tags.getAll"></a>

###### tags.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Get all release tags  
**Access**: public  
**Fulfil**: <code>Object[]</code> - release tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.tags.getAll().then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.release.tags.getAll(function(error, tags) {
	if (error) throw error;
	console.log(tags)
});
```
<a name="balena.models.release.tags.set"></a>

###### tags.set(commitOrId, tagKey, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Set a release tag  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| commitOrId | <code>String</code> \| <code>Number</code> | release commit (string) or id (number) |
| tagKey | <code>String</code> | tag key |
| value | <code>String</code> \| <code>undefined</code> | tag value |

**Example**  
```js
balena.models.release.tags.set(123, 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.release.tags.set('7cf02a6', 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.release.tags.set(123, 'EDITOR', 'vim', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.release.tags.remove"></a>

###### tags.remove(commitOrId, tagKey) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Remove a release tag  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| commitOrId | <code>String</code> \| <code>Number</code> | release commit (string) or id (number) |
| tagKey | <code>String</code> | tag key |

**Example**  
```js
balena.models.release.tags.remove(123, 'EDITOR');
```
**Example**  
```js
balena.models.release.tags.remove('7cf02a6', 'EDITOR');
```
**Example**  
```js
balena.models.release.tags.remove(123, 'EDITOR', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.release.get"></a>

##### release.get(commitOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Get a specific release  
**Access**: public  
**Fulfil**: <code>Object</code> - release  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| commitOrId | <code>String</code> \| <code>Number</code> |  | release commit (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.get(123).then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.release.get('7cf02a6').then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.release.get(123, function(error, release) {
	if (error) throw error;
	console.log(release);
});
```
<a name="balena.models.release.getWithImageDetails"></a>

##### release.getWithImageDetails(commitOrId, [options]) ⇒ <code>Promise</code>
This method does not map exactly to the underlying model: it runs a
larger prebuilt query, and reformats it into an easy to use and
understand format. If you want significantly more control, or to see the
raw model directly, use `release.get(id, options)` instead.

**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Get a specific release with the details of the images built  
**Access**: public  
**Fulfil**: <code>Object</code> - release with image details  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| commitOrId | <code>String</code> \| <code>Number</code> |  | release commit (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | a map of extra pine options |
| [options.release] | <code>Boolean</code> | <code>{}</code> | extra pine options for releases |
| [options.image] | <code>Object</code> | <code>{}</code> | extra pine options for images |

**Example**  
```js
balena.models.release.getWithImageDetails(123).then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.release.getWithImageDetails('7cf02a6').then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.release.getWithImageDetails(123, { image: { $select: 'build_log' } })
.then(function(release) {
	console.log(release.images[0].build_log);
});
```
**Example**  
```js
balena.models.release.getWithImageDetails(123, function(error, release) {
	if (error) throw error;
	console.log(release);
});
```
<a name="balena.models.release.getAllByApplication"></a>

##### release.getAllByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Get all releases from an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - releases  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.getAllByApplication('MyApp').then(function(releases) {
	console.log(releases);
});
```
**Example**  
```js
balena.models.release.getAllByApplication(123).then(function(releases) {
	console.log(releases);
});
```
**Example**  
```js
balena.models.release.getAllByApplication('MyApp', function(error, releases) {
	if (error) throw error;
	console.log(releases);
});
```
<a name="balena.models.release.getLatestByApplication"></a>

##### release.getLatestByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Get the latest successful release for an application  
**Access**: public  
**Fulfil**: <code>Object\|undefined</code> - release  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.getLatestByApplication('MyApp').then(function(releases) {
	console.log(releases);
});
```
**Example**  
```js
balena.models.release.getLatestByApplication(123).then(function(releases) {
	console.log(releases);
});
```
**Example**  
```js
balena.models.release.getLatestByApplication('MyApp', function(error, releases) {
	if (error) throw error;
	console.log(releases);
});
```
<a name="balena.models.release.createFromUrl"></a>

##### release.createFromUrl(nameOrSlugOrId, urlDeployOptions) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Create a new release built from the source in the provided url  
**Access**: public  
**Fulfil**: <code>number</code> - release ID  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| urlDeployOptions | <code>Object</code> |  | builder options |
| urlDeployOptions.url | <code>String</code> |  | a url with a tarball of the project to build |
| [urlDeployOptions.shouldFlatten] | <code>Boolean</code> | <code>true</code> | Should be true when the tarball includes an extra root folder with all the content |

**Example**  
```js
balena.models.release.createFromUrl('MyApp', { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }).then(function(releaseId) {
	console.log(releaseId);
});
```
**Example**  
```js
balena.models.release.createFromUrl(123, { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }).then(function(releaseId) {
	console.log(releaseId);
});
```
**Example**  
```js
balena.models.release.createFromUrl('MyApp', { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }, function(error, releaseId) {
	if (error) throw error;
	console.log(releaseId);
});
```
<a name="balena.models.service"></a>

#### models.service : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.service](#balena.models.service) : <code>object</code>
    * [.var](#balena.models.service.var) : <code>object</code>
        * [.getAllByService(id, [options])](#balena.models.service.var.getAllByService) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.service.var.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(id, key)](#balena.models.service.var.get) ⇒ <code>Promise</code>
        * [.set(id, key, value)](#balena.models.service.var.set) ⇒ <code>Promise</code>
        * [.remove(id, key)](#balena.models.service.var.remove) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.service.getAllByApplication) ⇒ <code>Promise</code>

<a name="balena.models.service.var"></a>

##### service.var : <code>object</code>
**Kind**: static namespace of [<code>service</code>](#balena.models.service)  

* [.var](#balena.models.service.var) : <code>object</code>
    * [.getAllByService(id, [options])](#balena.models.service.var.getAllByService) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrSlugOrId, [options])](#balena.models.service.var.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(id, key)](#balena.models.service.var.get) ⇒ <code>Promise</code>
    * [.set(id, key, value)](#balena.models.service.var.set) ⇒ <code>Promise</code>
    * [.remove(id, key)](#balena.models.service.var.remove) ⇒ <code>Promise</code>

<a name="balena.models.service.var.getAllByService"></a>

###### var.getAllByService(id, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Get all variables for a service  
**Access**: public  
**Fulfil**: <code>Object[]</code> - service variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>Number</code> |  | service id |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.service.var.getAllByService(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.service.var.getAllByService(999999, function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.service.var.getAllByApplication"></a>

###### var.getAllByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Get all service variables by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - service variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.service.var.getAllByApplication('MyApp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.service.var.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.service.var.getAllByApplication('MyApp', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.service.var.get"></a>

###### var.get(id, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Get the value of a specific service variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | service id |
| key | <code>String</code> | variable name |

**Example**  
```js
balena.models.service.var.get(999999, 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.service.var.get(999999, 'VAR', function(error, value) {
	if (error) throw error;
	console.log(value)
});
```
<a name="balena.models.service.var.set"></a>

###### var.set(id, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Set the value of a specific service variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | service id |
| key | <code>String</code> | variable name |
| value | <code>String</code> | variable value |

**Example**  
```js
balena.models.service.var.set(999999, 'VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.service.var.set(999999, 'VAR', 'newvalue', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.service.var.remove"></a>

###### var.remove(id, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Clear the value of a specific service variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | service id |
| key | <code>String</code> | variable name |

**Example**  
```js
balena.models.service.var.remove(999999, 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.service.var.remove(999999, 'VAR', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.service.getAllByApplication"></a>

##### service.getAllByApplication(nameOrSlugOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>service</code>](#balena.models.service)  
**Summary**: Get all services from an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - services  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrSlugOrId | <code>String</code> \| <code>Number</code> |  | application name (string) (deprecated), slug (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.service.getAllByApplication('MyApp').then(function(services) {
	console.log(services);
});
```
**Example**  
```js
balena.models.service.getAllByApplication(123).then(function(services) {
	console.log(services);
});
```
**Example**  
```js
balena.models.service.getAllByApplication('MyApp', function(error, services) {
	if (error) throw error;
	console.log(services);
});
```
<a name="balena.models.image"></a>

#### models.image : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.image](#balena.models.image) : <code>object</code>
    * [.get(id, [options])](#balena.models.image.get) ⇒ <code>Promise</code>
    * [.getLogs(id)](#balena.models.image.getLogs) ⇒ <code>Promise</code>

<a name="balena.models.image.get"></a>

##### image.get(id, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>image</code>](#balena.models.image)  
**Summary**: Get a specific image  
**Access**: public  
**Fulfil**: <code>Object</code> - image  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>Number</code> |  | image id |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.image.get(123).then(function(image) {
	console.log(image);
});
```
**Example**  
```js
balena.models.image.get(123, function(error, image) {
	if (error) throw error;
	console.log(image);
});
```
<a name="balena.models.image.getLogs"></a>

##### image.getLogs(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>image</code>](#balena.models.image)  
**Summary**: Get the logs for an image  
**Access**: public  
**Fulfil**: <code>string</code> - logs  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | image id |

**Example**  
```js
balena.models.image.getLogs(123).then(function(logs) {
	console.log(logs);
});
```
**Example**  
```js
balena.models.image.getLogs(123, function(error, logs) {
	if (error) throw error;
	console.log(logs);
});
```
<a name="balena.models.billing"></a>

#### models.billing : <code>object</code>
**Note!** The billing methods are available on Balena.io exclusively.

**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.billing](#balena.models.billing) : <code>object</code>
    * [.getAccount(organization)](#balena.models.billing.getAccount) ⇒ <code>Promise</code>
    * [.getPlan(organization)](#balena.models.billing.getPlan) ⇒ <code>Promise</code>
    * [.getBillingInfo(organization)](#balena.models.billing.getBillingInfo) ⇒ <code>Promise</code>
    * [.updateBillingInfo(organization, billingInfo)](#balena.models.billing.updateBillingInfo) ⇒ <code>Promise</code>
    * [.changePlan(organization, planChangeOptions)](#balena.models.billing.changePlan) ⇒ <code>Promise</code>
    * [.getInvoices(organization)](#balena.models.billing.getInvoices) ⇒ <code>Promise</code>
    * [.downloadInvoice(organization)](#balena.models.billing.downloadInvoice) ⇒ <code>Promise</code>

<a name="balena.models.billing.getAccount"></a>

##### billing.getAccount(organization) ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Get the user's billing account  
**Access**: public  
**Fulfil**: <code>Object</code> - billing account  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |

**Example**  
```js
balena.models.billing.getAccount(orgId).then(function(billingAccount) {
	console.log(billingAccount);
});
```
**Example**  
```js
balena.models.billing.getAccount(orgId, function(error, billingAccount) {
	if (error) throw error;
	console.log(billingAccount);
});
```
<a name="balena.models.billing.getPlan"></a>

##### billing.getPlan(organization) ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Get the current billing plan  
**Access**: public  
**Fulfil**: <code>Object</code> - billing plan  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |

**Example**  
```js
balena.models.billing.getPlan(orgId).then(function(billingPlan) {
	console.log(billingPlan);
});
```
**Example**  
```js
balena.models.billing.getPlan(orgId, function(error, billingPlan) {
	if (error) throw error;
	console.log(billingPlan);
});
```
<a name="balena.models.billing.getBillingInfo"></a>

##### billing.getBillingInfo(organization) ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Get the current billing information  
**Access**: public  
**Fulfil**: <code>Object</code> - billing information  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |

**Example**  
```js
balena.models.billing.getBillingInfo(orgId).then(function(billingInfo) {
	console.log(billingInfo);
});
```
**Example**  
```js
balena.models.billing.getBillingInfo(orgId, function(error, billingInfo) {
	if (error) throw error;
	console.log(billingInfo);
});
```
<a name="balena.models.billing.updateBillingInfo"></a>

##### billing.updateBillingInfo(organization, billingInfo) ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Update the current billing information  
**Access**: public  
**Fulfil**: <code>Object</code> - billing information  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |
| billingInfo | <code>Object</code> | an object containing a billing info token_id |
| billingInfo.token_id | <code>String</code> | the token id generated for the billing info form |
| [billingInfo.'g-recaptcha-response'] | <code>String</code> \| <code>undefined</code> | the captcha response |

**Example**  
```js
balena.models.billing.updateBillingInfo(orgId, { token_id: 'xxxxxxx' }).then(function(billingInfo) {
	console.log(billingInfo);
});
```
**Example**  
```js
balena.models.billing.updateBillingInfo(orgId, { token_id: 'xxxxxxx' }, function(error, billingInfo) {
	if (error) throw error;
	console.log(billingInfo);
});
```
<a name="balena.models.billing.changePlan"></a>

##### billing.changePlan(organization, planChangeOptions) ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Change the current billing plan  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |
| planChangeOptions | <code>Object</code> | an object containing the billing plan change options |
| billingInfo.tier | <code>String</code> | the code of the target billing plan |
| billingInfo.cycle | <code>String</code> | the billing cycle |
| [billingInfo.planChangeReason] | <code>String</code> | the reason for changing the current plan |

**Example**  
```js
balena.models.billing.changePlan(orgId, { billingCode: 'prototype-v2', cycle: 'annual' }).then(function() {
	console.log('Plan changed!');
});
```
<a name="balena.models.billing.getInvoices"></a>

##### billing.getInvoices(organization) ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Get the available invoices  
**Access**: public  
**Fulfil**: <code>Object</code> - invoices  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |

**Example**  
```js
balena.models.billing.getInvoices(orgId).then(function(invoices) {
	console.log(invoices);
});
```
**Example**  
```js
balena.models.billing.getInvoices(orgId, function(error, invoices) {
	if (error) throw error;
	console.log(invoices);
});
```
<a name="balena.models.billing.downloadInvoice"></a>

##### billing.downloadInvoice(organization) ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Download a specific invoice  
**Access**: public  
**Fulfil**: <code>Blob\|ReadableStream</code> - blob on the browser, download stream on node  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |
|  | <code>String</code> | an invoice number |

**Example**  
```js
# Browser
balena.models.billing.downloadInvoice(orgId, '0000').then(function(blob) {
	console.log(blob);
});
# Node
balena.models.billing.downloadInvoice(orgId, '0000').then(function(stream) {
	stream.pipe(fs.createWriteStream('foo/bar/invoice-0000.pdf'));
});
```
<a name="balena.auth"></a>

### balena.auth : <code>object</code>
**Kind**: static namespace of [<code>balena</code>](#balena)  

* [.auth](#balena.auth) : <code>object</code>
    * [.twoFactor](#balena.auth.twoFactor) : <code>object</code>
        * [.isEnabled()](#balena.auth.twoFactor.isEnabled) ⇒ <code>Promise</code>
        * [.isPassed()](#balena.auth.twoFactor.isPassed) ⇒ <code>Promise</code>
        * [.verify(code)](#balena.auth.twoFactor.verify) ⇒ <code>Promise</code>
        * [.getSetupKey()](#balena.auth.twoFactor.getSetupKey) ⇒ <code>Promise</code>
        * [.enable(code)](#balena.auth.twoFactor.enable) ⇒ <code>Promise</code>
        * [.challenge(code)](#balena.auth.twoFactor.challenge) ⇒ <code>Promise</code>
        * [.disable(password)](#balena.auth.twoFactor.disable) ⇒ <code>Promise</code>
    * [.whoami()](#balena.auth.whoami) ⇒ <code>Promise</code>
    * [.authenticate(credentials)](#balena.auth.authenticate) ⇒ <code>Promise</code>
    * [.login(credentials)](#balena.auth.login) ⇒ <code>Promise</code>
    * [.loginWithToken(authToken)](#balena.auth.loginWithToken) ⇒ <code>Promise</code>
    * [.isLoggedIn()](#balena.auth.isLoggedIn) ⇒ <code>Promise</code>
    * [.getToken()](#balena.auth.getToken) ⇒ <code>Promise</code>
    * [.getUserId()](#balena.auth.getUserId) ⇒ <code>Promise</code>
    * [.getUserActorId()](#balena.auth.getUserActorId) ⇒ <code>Promise</code>
    * [.getEmail()](#balena.auth.getEmail) ⇒ <code>Promise</code>
    * [.logout()](#balena.auth.logout) ⇒ <code>Promise</code>
    * [.register(credentials)](#balena.auth.register) ⇒ <code>Promise</code>

<a name="balena.auth.twoFactor"></a>

#### auth.twoFactor : <code>object</code>
**Kind**: static namespace of [<code>auth</code>](#balena.auth)  

* [.twoFactor](#balena.auth.twoFactor) : <code>object</code>
    * [.isEnabled()](#balena.auth.twoFactor.isEnabled) ⇒ <code>Promise</code>
    * [.isPassed()](#balena.auth.twoFactor.isPassed) ⇒ <code>Promise</code>
    * [.verify(code)](#balena.auth.twoFactor.verify) ⇒ <code>Promise</code>
    * [.getSetupKey()](#balena.auth.twoFactor.getSetupKey) ⇒ <code>Promise</code>
    * [.enable(code)](#balena.auth.twoFactor.enable) ⇒ <code>Promise</code>
    * [.challenge(code)](#balena.auth.twoFactor.challenge) ⇒ <code>Promise</code>
    * [.disable(password)](#balena.auth.twoFactor.disable) ⇒ <code>Promise</code>

<a name="balena.auth.twoFactor.isEnabled"></a>

##### twoFactor.isEnabled() ⇒ <code>Promise</code>
**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Check if two factor authentication is enabled  
**Access**: public  
**Fulfil**: <code>Boolean</code> - whether 2fa is enabled  
**Example**  
```js
balena.auth.twoFactor.isEnabled().then(function(isEnabled) {
	if (isEnabled) {
		console.log('2FA is enabled for this account');
	}
});
```
**Example**  
```js
balena.auth.twoFactor.isEnabled(function(error, isEnabled) {
	if (error) throw error;

	if (isEnabled) {
		console.log('2FA is enabled for this account');
	}
});
```
<a name="balena.auth.twoFactor.isPassed"></a>

##### twoFactor.isPassed() ⇒ <code>Promise</code>
**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Check if two factor authentication challenge was passed  
**Access**: public  
**Fulfil**: <code>Boolean</code> - whether 2fa challenge was passed  
**Example**  
```js
balena.auth.twoFactor.isPassed().then(function(isPassed) {
	if (isPassed) {
		console.log('2FA challenge passed');
	}
});
```
**Example**  
```js
balena.auth.twoFactor.isPassed(function(error, isPassed) {
	if (error) throw error;

	if (isPassed) {
		console.log('2FA challenge passed');
	}
});
```
<a name="balena.auth.twoFactor.verify"></a>

##### twoFactor.verify(code) ⇒ <code>Promise</code>
Verifies two factor authentication.
Note that this method not update the token automatically.
You should use [challenge](#balena.auth.twoFactor.challenge) when possible,
as it takes care of that as well.

**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Verify two factor authentication  
**Access**: public  
**Fulfil**: <code>String</code> - session token  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>String</code> | code |

**Example**  
```js
const token = balena.auth.twoFactor.verify('1234');
balena.auth.loginWithToken(token);
```
**Example**  
```js
balena.auth.twoFactor.verify('1234', function(error, token) {
	if (error) throw error;
	console.log(token);
});
```
<a name="balena.auth.twoFactor.getSetupKey"></a>

##### twoFactor.getSetupKey() ⇒ <code>Promise</code>
Retrieves a setup key for enabling two factor authentication.

**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Get two factor authentication setup key  
**Access**: public  
**Fulfil**: <code>String</code> - setup key  
**Example**  
```js
const setupKey = balena.auth.twoFactor.getSetupKey();
console.log(setupKey);
```
**Example**  
```js
balena.auth.twoFactor.getSetupKey(function(error, setupKey) {
	if (error) throw error;
	console.log(setupKey);
});
```
<a name="balena.auth.twoFactor.enable"></a>

##### twoFactor.enable(code) ⇒ <code>Promise</code>
Enables two factor authentication.

**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Enable two factor authentication  
**Access**: public  
**Fulfil**: <code>String</code> - session token  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>String</code> | code |

**Example**  
```js
const token = balena.auth.twoFactor.enable('1234');
balena.auth.loginWithToken(token);
```
**Example**  
```js
balena.auth.twoFactor.enable('1234', function(error, token) {
	if (error) throw error;
	console.log(token);
});
```
<a name="balena.auth.twoFactor.challenge"></a>

##### twoFactor.challenge(code) ⇒ <code>Promise</code>
You should use [login](#balena.auth.login) when possible,
as it takes care of saving the token and email as well.

**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Challenge two factor authentication and complete login  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>String</code> | code |

**Example**  
```js
balena.auth.twoFactor.challenge('1234');
```
**Example**  
```js
balena.auth.twoFactor.challenge('1234', function(error) {
	if (error) throw error;
});
```
<a name="balena.auth.twoFactor.disable"></a>

##### twoFactor.disable(password) ⇒ <code>Promise</code>
Disables two factor authentication.

**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Disable two factor authentication  
**Access**: public  
**Fulfil**: <code>String</code> - session token  

| Param | Type | Description |
| --- | --- | --- |
| password | <code>String</code> | password |

**Example**  
```js
const token = balena.auth.twoFactor.disable('1234');
balena.auth.loginWithToken(token);
```
**Example**  
```js
balena.auth.twoFactor.disable('1234', function(error, token) {
	if (error) throw error;
	console.log(token);
});
```
<a name="balena.auth.whoami"></a>

#### auth.whoami() ⇒ <code>Promise</code>
This will only work if you used [login](#balena.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Return current logged in username  
**Access**: public  
**Fulfil**: <code>(String\|undefined)</code> - username, if it exists  
**Example**  
```js
balena.auth.whoami().then(function(username) {
	if (!username) {
		console.log('I\'m not logged in!');
	} else {
		console.log('My username is:', username);
	}
});
```
**Example**  
```js
balena.auth.whoami(function(error, username) {
	if (error) throw error;

	if (!username) {
		console.log('I\'m not logged in!');
	} else {
		console.log('My username is:', username);
	}
});
```
<a name="balena.auth.authenticate"></a>

#### auth.authenticate(credentials) ⇒ <code>Promise</code>
You should use [login](#balena.auth.login) when possible,
as it takes care of saving the token and email as well.

Notice that if `credentials` contains extra keys, they'll be discarted
by the server automatically.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Authenticate with the server  
**Access**: protected  
**Fulfil**: <code>String</code> - session token  

| Param | Type | Description |
| --- | --- | --- |
| credentials | <code>Object</code> | in the form of email, password |
| credentials.email | <code>String</code> | the email |
| credentials.password | <code>String</code> | the password |

**Example**  
```js
balena.auth.authenticate(credentials).then(function(token) {
	console.log('My token is:', token);
});
```
**Example**  
```js
balena.auth.authenticate(credentials, function(error, token) {
	if (error) throw error;
	console.log('My token is:', token);
});
```
<a name="balena.auth.login"></a>

#### auth.login(credentials) ⇒ <code>Promise</code>
If the login is successful, the token is persisted between sessions.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Login  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| credentials | <code>Object</code> | in the form of email, password |
| credentials.email | <code>String</code> | the email |
| credentials.password | <code>String</code> | the password |

**Example**  
```js
balena.auth.login(credentials);
```
**Example**  
```js
balena.auth.login(credentials, function(error) {
	if (error) throw error;
});
```
<a name="balena.auth.loginWithToken"></a>

#### auth.loginWithToken(authToken) ⇒ <code>Promise</code>
Login to balena with a session token or api key instead of with credentials.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Login with a token or api key  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| authToken | <code>String</code> | the auth token |

**Example**  
```js
balena.auth.loginWithToken(authToken);
```
**Example**  
```js
balena.auth.loginWithToken(authToken, function(error) {
	if (error) throw error;
});
```
<a name="balena.auth.isLoggedIn"></a>

#### auth.isLoggedIn() ⇒ <code>Promise</code>
**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Check if you're logged in  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is logged in  
**Example**  
```js
balena.auth.isLoggedIn().then(function(isLoggedIn) {
	if (isLoggedIn) {
		console.log('I\'m in!');
	} else {
		console.log('Too bad!');
	}
});
```
**Example**  
```js
balena.auth.isLoggedIn(function(error, isLoggedIn) {
	if (error) throw error;

	if (isLoggedIn) {
		console.log('I\'m in!');
	} else {
		console.log('Too bad!');
	}
});
```
<a name="balena.auth.getToken"></a>

#### auth.getToken() ⇒ <code>Promise</code>
This will only work if you used [login](#balena.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Get current logged in user's raw API key or session token  
**Access**: public  
**Fulfil**: <code>String</code> - raw API key or session token  
**Example**  
```js
balena.auth.getToken().then(function(token) {
	console.log(token);
});
```
**Example**  
```js
balena.auth.getToken(function(error, token) {
	if (error) throw error;
	console.log(token);
});
```
<a name="balena.auth.getUserId"></a>

#### auth.getUserId() ⇒ <code>Promise</code>
This will only work if you used [login](#balena.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Get current logged in user's id  
**Access**: public  
**Fulfil**: <code>Number</code> - user id  
**Example**  
```js
balena.auth.getUserId().then(function(userId) {
	console.log(userId);
});
```
**Example**  
```js
balena.auth.getUserId(function(error, userId) {
	if (error) throw error;
	console.log(userId);
});
```
<a name="balena.auth.getUserActorId"></a>

#### auth.getUserActorId() ⇒ <code>Promise</code>
This will only work if you used [login](#balena.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Get current logged in user's actor id  
**Access**: public  
**Fulfil**: <code>Number</code> - user id  
**Example**  
```js
balena.auth.getUserActorId().then(function(userActorId) {
	console.log(userActorId);
});
```
**Example**  
```js
balena.auth.getUserActorId(function(error, userActorId) {
	if (error) throw error;
	console.log(userActorId);
});
```
<a name="balena.auth.getEmail"></a>

#### auth.getEmail() ⇒ <code>Promise</code>
This will only work if you used [login](#balena.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Get current logged in user's email  
**Access**: public  
**Fulfil**: <code>String</code> - user email  
**Example**  
```js
balena.auth.getEmail().then(function(email) {
	console.log(email);
});
```
**Example**  
```js
balena.auth.getEmail(function(error, email) {
	if (error) throw error;
	console.log(email);
});
```
<a name="balena.auth.logout"></a>

#### auth.logout() ⇒ <code>Promise</code>
**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Logout  
**Access**: public  
**Example**  
```js
balena.auth.logout();
```
**Example**  
```js
balena.auth.logout(function(error) {
	if (error) throw error;
});
```
<a name="balena.auth.register"></a>

#### auth.register(credentials) ⇒ <code>Promise</code>
**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Register a user account  
**Access**: public  
**Fulfil**: <code>String</code> - session token  

| Param | Type | Description |
| --- | --- | --- |
| credentials | <code>Object</code> | in the form of username, password and email |
| credentials.email | <code>String</code> | the email |
| credentials.password | <code>String</code> | the password |
| [credentials.'g-recaptcha-response'] | <code>String</code> \| <code>undefined</code> | the captcha response |

**Example**  
```js
balena.auth.register({
	email: 'johndoe@gmail.com',
	password: 'secret'
}).then(function(token) {
	console.log(token);
});
```
**Example**  
```js
balena.auth.register({
	email: 'johndoe@gmail.com',
	password: 'secret'
}, function(error, token) {
	if (error) throw error;
	console.log(token);
});
```
<a name="balena.logs"></a>

### balena.logs : <code>object</code>
**Kind**: static namespace of [<code>balena</code>](#balena)  

* [.logs](#balena.logs) : <code>object</code>
    * [.subscribe(uuidOrId, [options])](#balena.logs.subscribe) ⇒ <code>Promise.&lt;LogSubscription&gt;</code>
    * [.history(uuidOrId, [options])](#balena.logs.history) ⇒ <code>Promise</code>
    * [.LogSubscription](#balena.logs.LogSubscription) : <code>EventEmitter</code>
        * [.unsubscribe()](#balena.logs.LogSubscription.unsubscribe)
        * ["line"](#balena.logs.LogSubscription.event_line)
        * ["error"](#balena.logs.LogSubscription.event_error)

<a name="balena.logs.subscribe"></a>

#### logs.subscribe(uuidOrId, [options]) ⇒ <code>Promise.&lt;LogSubscription&gt;</code>
Connects to the stream of devices logs, returning a LogSubscription, which
can be used to listen for logs as they appear, line by line.

**Kind**: static method of [<code>logs</code>](#balena.logs)  
**Summary**: Subscribe to device logs  
**Access**: public  
**Fulfil**: [<code>LogSubscription</code>](#balena.logs.LogSubscription)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> |  | options |
| [options.count] | <code>Number</code> \| <code>&#x27;all&#x27;</code> | <code>0</code> | number of historical messages to include (or 'all') |

**Example**  
```js
balena.logs.subscribe('7cf02a6').then(function(logs) {
	logs.on('line', function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
balena.logs.subscribe(123).then(function(logs) {
	logs.on('line', function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
balena.logs.subscribe('7cf02a6', function(error, logs) {
	if (error) throw error;

	logs.on('line', function(line) {
		console.log(line);
	});
});
```
<a name="balena.logs.history"></a>

#### logs.history(uuidOrId, [options]) ⇒ <code>Promise</code>
Get an array of the latest log messages for a given device.

**Kind**: static method of [<code>logs</code>](#balena.logs)  
**Summary**: Get device logs history  
**Access**: public  
**Fulfil**: <code>Object[]</code> - history lines  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> |  | options |
| [options.count] | <code>Number</code> \| <code>&#x27;all&#x27;</code> | <code>1000</code> | number of log messages to return (or 'all') |

**Example**  
```js
balena.logs.history('7cf02a6').then(function(lines) {
	lines.forEach(function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
balena.logs.history(123).then(function(lines) {
	lines.forEach(function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
balena.logs.history('7cf02a6', { count: 20 }, function(error, lines) {
	if (error) throw error;

	lines.forEach(function(line) {
		console.log(line);
	});
});
```
<a name="balena.logs.LogSubscription"></a>

#### logs.LogSubscription : <code>EventEmitter</code>
The log subscription emits events as log data arrives.
You can get a LogSubscription for a given device by calling `balena.logs.subscribe(deviceId)`

**Kind**: static typedef of [<code>logs</code>](#balena.logs)  

* [.LogSubscription](#balena.logs.LogSubscription) : <code>EventEmitter</code>
    * [.unsubscribe()](#balena.logs.LogSubscription.unsubscribe)
    * ["line"](#balena.logs.LogSubscription.event_line)
    * ["error"](#balena.logs.LogSubscription.event_error)

<a name="balena.logs.LogSubscription.unsubscribe"></a>

##### LogSubscription.unsubscribe()
Disconnect from the logs feed and stop receiving any future events on this emitter.

**Kind**: static method of [<code>LogSubscription</code>](#balena.logs.LogSubscription)  
**Summary**: Unsubscribe from device logs  
**Access**: public  
**Example**  
```js
logs.unsubscribe();
```
<a name="balena.logs.LogSubscription.event_line"></a>

##### "line"
**Kind**: event emitted by [<code>LogSubscription</code>](#balena.logs.LogSubscription)  
**Summary**: Event fired when a new line of log output is available  
**Example**  
```js
logs.on('line', function(line) {
	console.log(line);
});
```
<a name="balena.logs.LogSubscription.event_error"></a>

##### "error"
**Kind**: event emitted by [<code>LogSubscription</code>](#balena.logs.LogSubscription)  
**Summary**: Event fired when an error has occured reading the device logs  
**Example**  
```js
logs.on('error', function(error) {
	console.error(error);
});
```
<a name="balena.settings"></a>

### balena.settings : <code>object</code>
**Kind**: static namespace of [<code>balena</code>](#balena)  

* [.settings](#balena.settings) : <code>object</code>
    * [.get([key])](#balena.settings.get) ⇒ <code>Promise</code>
    * [.getAll()](#balena.settings.getAll) ⇒ <code>Promise</code>

<a name="balena.settings.get"></a>

#### settings.get([key]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>settings</code>](#balena.settings)  
**Summary**: Get a single setting. **Only implemented in Node.js**  
**Access**: public  
**Fulfil**: <code>\*</code> - setting value  

| Param | Type | Description |
| --- | --- | --- |
| [key] | <code>String</code> | setting key |

**Example**  
```js
balena.settings.get('apiUrl').then(function(apiUrl) {
	console.log(apiUrl);
});
```
**Example**  
```js
balena.settings.get('apiUrl', function(error, apiUrl) {
	if (error) throw error;
	console.log(apiUrl);
});
```
<a name="balena.settings.getAll"></a>

#### settings.getAll() ⇒ <code>Promise</code>
**Kind**: static method of [<code>settings</code>](#balena.settings)  
**Summary**: Get all settings **Only implemented in Node.js**  
**Access**: public  
**Fulfil**: <code>Object</code> - settings  
**Example**  
```js
balena.settings.getAll().then(function(settings) {
	console.log(settings);
});
```
**Example**  
```js
balena.settings.getAll(function(error, settings) {
	if (error) throw error;
	console.log(settings);
});
```
