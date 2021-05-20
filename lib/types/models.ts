import type { DeviceOverallStatus } from './device-overall-status';
export type { DeviceOverallStatus } from './device-overall-status';
import { Contract } from './contract';
import { JWTUser } from './jwt';
import type {
	PineDeferred,
	NavigationResource,
	OptionalNavigationResource,
	ReverseNavigationResource,
} from '../../typings/pinejs-client-core';

// TODO: Drop in the next major
export { SocialServiceAccount } from './jwt';

export interface ResourceTypeMap {
	api_key: ApiKey;
	application: Application;
	application__can_use__application_as_host: ApplicationHostedOnApplication;
	application_config_variable: ApplicationVariable;
	application_environment_variable: ApplicationVariable;
	application_membership_role: ApplicationMembershipRole;
	application_tag: ApplicationTag;
	application_type: ApplicationType;
	build_environment_variable: BuildVariable;
	cpu_architecture: CpuArchitecture;
	device: Device;
	device_config_variable: DeviceVariable;
	device_environment_variable: DeviceVariable;
	device_service_environment_variable: DeviceServiceEnvironmentVariable;
	device_tag: DeviceTag;
	device_type: DeviceType;
	feature: Feature;
	gateway_download: GatewayDownload;
	image: Image;
	image_install: ImageInstall;
	invitee: Invitee;
	invitee__is_invited_to__application: ApplicationInvite;
	invitee__is_invited_to__organization: OrganizationInvite;
	/** @deprecated */
	my_application: Application;
	organization: Organization;
	organization__has_private_access_to__device_type: OrganizationPrivateDeviceTypeAccess;
	organization_membership: OrganizationMembership;
	organization_membership_role: OrganizationMembershipRole;
	organization_membership_tag: OrganizationMembershipTag;
	plan: Plan;
	plan__has__discount_code: PlanDiscountCode;
	plan_addon: PlanAddon;
	plan_feature: PlanFeature;
	public_organization: PublicOrganization;
	recovery_two_factor: RecoveryTwoFactor;
	release: Release;
	release_tag: ReleaseTag;
	service: Service;
	service_environment_variable: ServiceEnvironmentVariable;
	service_install: ServiceInstall;
	service_instance: ServiceInstance;
	subscription: Subscription;
	subscription_addon_discount: SubscriptionAddonDiscount;
	subscription_prepaid_addon: SubscriptionPrepaidAddon;
	supervisor_release: SupervisorRelease;
	support_feature: SupportFeature;
	support_tier: SupportTier;
	team: Team;
	team_application_access: TeamApplicationAccess;
	team_membership: TeamMembership;
	user: User;
	user__has__public_key: SSHKey;
	user__has_direct_access_to__application: UserHasDirectAccessToApplication;
	/** @deprecated in favor of user_application_membership */
	user__is_member_of__application: ApplicationMembership;
	user_application_membership: ApplicationMembership;
}

export interface Organization {
	id: number;
	created_at: string;
	name: string;
	handle: string;

	application: ReverseNavigationResource<Application>;
	/** includes__organization_membership */
	organization_membership: ReverseNavigationResource<OrganizationMembership>;
	owns__team: ReverseNavigationResource<Team>;
}

export interface Team {
	id: number;
	created_at: string;
	name: string;

	belongs_to__organization: NavigationResource<Organization>;

	/** includes__user */
	team_membership: ReverseNavigationResource<TeamMembership>;
	/** grants_access_to__application */
	team_application_access: ReverseNavigationResource<TeamApplicationAccess>;
}

export interface RecoveryTwoFactor {
	id: number;
	used_timestamp: string | null;

	belongs_to__user: NavigationResource<User>;
}

// TODO: Stop (confusingly) extending the UserJWT in the next major version
export interface User extends JWTUser {
	id: number;
	actor: number;
	created_at: string;
	username: string;

	organization_membership: ReverseNavigationResource<OrganizationMembership>;
	/** @deprecated in favor of user_application_membership */
	user__is_member_of__application: ReverseNavigationResource<ApplicationMembership>;
	user_application_membership: ReverseNavigationResource<ApplicationMembership>;
	team_membership: ReverseNavigationResource<TeamMembership>;
	has_direct_access_to__application: ReverseNavigationResource<Application>;
}

export type OrganizationMembershipRoles = 'administrator' | 'member';

export interface OrganizationMembershipRole {
	id: number;
	name: OrganizationMembershipRoles;
}

export interface OrganizationMembership {
	id: number;
	created_at: string;

	user: NavigationResource<User>;
	/** organization */
	is_member_of__organization: NavigationResource<Organization>;
	organization_membership_role: NavigationResource<OrganizationMembershipRole>;

	organization_membership_tag: ReverseNavigationResource<OrganizationMembershipTag>;
}

export interface TeamMembership {
	id: number;
	created_at: string;

	user: NavigationResource<User>;
	/** team */
	is_member_of__team: NavigationResource<Team>;
}

export interface ApiKey {
	id: number;
	created_at: string;
	name: string;
	description: string | null;

	is_of__actor: PineDeferred;
}

export interface Application {
	id: number;
	created_at: string;
	app_name: string;
	slug: string;
	uuid: string;
	is_accessible_by_support_until__date: string;
	is_host: boolean;
	should_track_latest_release: boolean;
	is_public: boolean;
	is_of__class: 'fleet' | 'block' | 'app';
	is_archived: boolean;
	is_discoverable: boolean;
	is_stored_at__repository_url: string | null;
	public_organization: OptionalNavigationResource<PublicOrganization>;
	application_type: NavigationResource<ApplicationType>;
	is_for__device_type: NavigationResource<DeviceType>;
	depends_on__application: OptionalNavigationResource<Application>;
	organization: NavigationResource<Organization>;
	should_be_running__release: OptionalNavigationResource<Release>;

	application_config_variable: ReverseNavigationResource<ApplicationVariable>;
	application_environment_variable: ReverseNavigationResource<ApplicationVariable>;
	build_environment_variable: ReverseNavigationResource<BuildVariable>;
	application_tag: ReverseNavigationResource<ApplicationTag>;
	owns__device: ReverseNavigationResource<Device>;
	owns__release: ReverseNavigationResource<Release>;
	is_depended_on_by__application: ReverseNavigationResource<Application>;
	is_directly_accessible_by__user: ReverseNavigationResource<User>;
	/** includes__user */
	/** @deprecated in favor of user_application_membership */
	user__is_member_of__application: ReverseNavigationResource<ApplicationMembership>;
	user_application_membership: ReverseNavigationResource<ApplicationMembership>;
	/** is_accessible_by__team */
	team_application_access: ReverseNavigationResource<TeamApplicationAccess>;
}

export interface UserHasDirectAccessToApplication {
	id: number;
	user: NavigationResource<User>;
	has_direct_access_to__application: NavigationResource<Application>;
}

export interface PublicOrganization {
	id: number;
	name: string;
	handle: string;
}

export interface Invitee {
	id: number;
	created_at: string;
	email: string;
}

export interface ApplicationInvite {
	id: number;
	message?: string;
	created_at: string;
	invitationToken: string;
	application_membership_role: NavigationResource<ApplicationMembershipRole>;
	invitee: NavigationResource<Invitee>;
	is_invited_to__application: NavigationResource<Application>;
}

export interface OrganizationInvite {
	id: number;
	message?: string;
	created_at: string;
	invitationToken: string;
	organization_membership_role: NavigationResource<OrganizationMembershipRole>;
	invitee: NavigationResource<Invitee>;
	is_invited_to__organization: NavigationResource<Organization>;
}

export interface ApplicationType {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	supports_gateway_mode: boolean;
	supports_multicontainer: boolean;
	supports_web_url: boolean;
	is_legacy: boolean;
	requires_payment: boolean;
	needs__os_version_range: string | null;
	maximum_device_count: number | null;
	is_host_os: boolean;
}

export interface ApplicationHostedOnApplication {
	id: null;
	application: NavigationResource<Application>;
	can_use__application_as_host: NavigationResource<Application>;
}

export type ApplicationMembershipRoles = 'developer' | 'operator' | 'observer';

export interface ApplicationMembershipRole {
	id: number;
	name: ApplicationMembershipRoles;
}

export interface ApplicationMembership {
	id: number;
	user: NavigationResource<User>;
	/** application */
	is_member_of__application: NavigationResource<Application>;
	application_membership_role: NavigationResource<ApplicationMembershipRole>;
}

export interface TeamApplicationAccess {
	id: number;
	team: NavigationResource<Team>;
	/** application */
	grants_access_to__application: NavigationResource<Application>;
	application_membership_role: NavigationResource<ApplicationMembershipRole>;
}

export type ReleaseStatus =
	| 'cancelled'
	| 'error'
	| 'failed'
	| 'interrupted'
	| 'local'
	| 'running'
	| 'success'
	| 'timeout'
	| null;

export interface Release {
	id: number;
	created_at: string;
	commit: string;
	composition: string | null;
	contract: string | null;
	status: ReleaseStatus;
	source: string;
	build_log: string | null;
	is_invalidated: boolean;
	start_timestamp: string;
	update_timestamp: string | null;
	end_timestamp: string;
	release_version: string | null;
	semver: string;
	semver_major: number;
	semver_minor: number;
	semver_patch: number;
	revision: number | null;
	is_final: boolean;

	is_created_by__user: OptionalNavigationResource<User>;
	belongs_to__application: NavigationResource<Application>;

	contains__image: ReverseNavigationResource<{
		id: number;
		image: NavigationResource<Image>;
	}>;
	should_be_running_on__application: ReverseNavigationResource<Application>;
	is_running_on__device: ReverseNavigationResource<Device>;
	should_be_running_on__device: ReverseNavigationResource<Device>;
	release_tag: ReverseNavigationResource<ReleaseTag>;
}

export interface Device {
	id: number;
	created_at: string;
	custom_latitude?: string;
	custom_longitude?: string;
	device_name: string;
	download_progress?: number;
	ip_address: string | null;
	public_address: string | null;
	mac_address: string | null;
	is_accessible_by_support_until__date: string | null;
	is_connected_to_vpn: boolean;
	/** @deprecate */
	is_in_local_mode?: boolean;
	is_locked_until__date: string;
	is_web_accessible: boolean;
	is_active: boolean;
	is_online: boolean;
	last_connectivity_event: string | null;
	last_vpn_event: string;
	latitude?: string;
	local_id?: string;
	location: string;
	longitude?: string;
	note: string;
	os_variant?: string;
	os_version: string | null;
	provisioning_progress?: number;
	provisioning_state: string;
	state?: { key: string; name: string };
	status: string;
	status_sort_index?: number;
	supervisor_version: string;
	uuid: string;
	vpn_address: string | null;
	api_heartbeat_state: 'online' | 'offline' | 'timeout' | 'unknown';
	memory_usage: number | null;
	memory_total: number | null;
	storage_block_device: string | null;
	storage_usage: number | null;
	storage_total: number | null;
	cpu_usage: number | null;
	cpu_temp: number | null;
	cpu_id: string | null;
	is_undervolted: boolean;
	/** This is a computed term */
	overall_status: DeviceOverallStatus;
	/** This is a computed term */
	overall_progress: number | null;

	is_of__device_type: NavigationResource<DeviceType>;
	// the schema has this as a nullable, but for simplicity we have it as non-optional
	belongs_to__application: NavigationResource<Application>;
	belongs_to__user: OptionalNavigationResource<User>;
	is_running__release: OptionalNavigationResource<Release>;
	should_be_running__release: OptionalNavigationResource<Release>;
	is_managed_by__service_instance: OptionalNavigationResource<ServiceInstance>;
	is_managed_by__device: OptionalNavigationResource<Device>;
	should_be_managed_by__supervisor_release: OptionalNavigationResource<SupervisorRelease>;

	device_config_variable: ReverseNavigationResource<DeviceVariable>;
	device_environment_variable: ReverseNavigationResource<DeviceVariable>;
	device_tag: ReverseNavigationResource<DeviceTag>;
	manages__device: ReverseNavigationResource<Device>;
	service_install: ReverseNavigationResource<ServiceInstall>;
	image_install?: ReverseNavigationResource<ImageInstall>;
	gateway_download?: ReverseNavigationResource<GatewayDownload>;
}

export interface CpuArchitecture {
	id: number;
	slug: string;

	is_supported_by__device_type: ReverseNavigationResource<CpuArchitecture>;
}

export interface DeviceType {
	id: number;
	slug: string;
	name: string;
	is_private: boolean;
	logo: string | null;
	contract: Contract | null;
	belongs_to__device_family: OptionalNavigationResource<DeviceFamily>;
	is_default_for__application: ReverseNavigationResource<Application>;
	is_of__cpu_architecture: NavigationResource<CpuArchitecture>;
	is_accessible_privately_by__organization: ReverseNavigationResource<Organization>;
	describes_device: ReverseNavigationResource<Device>;
}

export interface DeviceFamily {
	created_at: string;
	modified_at: string;
	id: number;
	slug: string;
	name: string;
	is_manufactured_by__device_manufacturer: OptionalNavigationResource<DeviceManufacturer>;
}

export interface DeviceManufacturer {
	created_at: string;
	modified_at: string;
	id: number;
	slug: string;
	name: string;
}

export interface OrganizationPrivateDeviceTypeAccess {
	id: number;
	organization: NavigationResource<Organization>;
	has_private_access_to__device_type: NavigationResource<DeviceType>;
}

export type DeviceWithImageInstalls = Device &
	Required<Pick<Device, 'image_install' | 'gateway_download'>>;

export interface SupervisorRelease {
	created_at: string;
	id: number;
	supervisor_version: string;
	image_name: string;
	is_public: boolean;
	note?: string;

	is_for__device_type: NavigationResource<DeviceType>;
}

export interface ServiceInstance {
	id: number;
	created_at: string;
	service_type: string;
	ip_address: string;
	last_heartbeat: string;
}

export interface Service {
	id: number;
	created_at: string;
	service_name: string;
	application: NavigationResource<Application>;
	is_built_by__image: ReverseNavigationResource<Image>;
	service_environment_variable: ReverseNavigationResource<ServiceEnvironmentVariable>;
	device_service_environment_variable: ReverseNavigationResource<DeviceServiceEnvironmentVariable>;
}

export interface Image {
	id: number;
	created_at: string;
	build_log: string;
	contract: string | null;
	content_hash?: string | null;
	project_type?: string | null;
	status: string;
	is_stored_at__image_location: string;
	start_timestamp?: string | null;
	end_timestamp?: string | null;
	push_timestamp?: string | null;
	image_size?: number | null;
	dockerfile: string;
	error_message?: string | null;
	is_a_build_of__service: NavigationResource<Service>;
	release_image: ReverseNavigationResource<ReleaseImage>;
}

export interface ReleaseImage {
	id: number;
	created_at: string;
	image: NavigationResource<Image>;
	is_part_of__release: NavigationResource<Release>;
}

export interface SSHKey {
	title: string;
	public_key: string;
	id: number;
	created_at: string;

	user: NavigationResource<User>;
}

export interface ImageInstall {
	id: number;
	download_progress: number | null;
	status: string;
	install_date: string;

	/** @deprecated Use `installs__image` instead. */
	image: NavigationResource<Image>;
	installs__image: NavigationResource<Image>;
	device: NavigationResource<Device>;
	is_provided_by__release: NavigationResource<Release>;
}

export interface GatewayDownload {
	id: number;
	download_progress: number;
	status: string;

	image: NavigationResource<Image>;
	is_downloaded_by__device: NavigationResource<Device>;
}

export interface ServiceInstall {
	id: number;
	should_be_running: boolean;
	device: NavigationResource<Device>;
	/** service */
	installs__service: NavigationResource<Service>;
	application: NavigationResource<Application>;

	device_service_environment_variable: ReverseNavigationResource<DeviceServiceEnvironmentVariable>;
}

export interface EnvironmentVariableBase {
	id: number;
	name: string;
	value: string;
}

export interface DeviceServiceEnvironmentVariable
	extends EnvironmentVariableBase {
	service_install: NavigationResource<ServiceInstall>;
}

export interface ServiceEnvironmentVariable extends EnvironmentVariableBase {
	service: NavigationResource<Service>;
}

export interface DeviceVariable extends EnvironmentVariableBase {
	device: NavigationResource<Device>;
}

export interface ApplicationVariable extends EnvironmentVariableBase {
	application: NavigationResource<Application>;
}

export interface BuildVariable extends EnvironmentVariableBase {
	application: NavigationResource<Application>;
}

export interface ResourceTagBase {
	id: number;
	tag_key: string;
	value: string;
}

export interface ApplicationTag extends ResourceTagBase {
	application: NavigationResource<Application>;
}

export interface DeviceTag extends ResourceTagBase {
	device: NavigationResource<Device>;
}

export interface OrganizationMembershipTag extends ResourceTagBase {
	organization_membership: NavigationResource<OrganizationMembership>;
}

export interface ReleaseTag extends ResourceTagBase {
	release: NavigationResource<Release>;
}

// Billing model

export interface Feature {
	id: number;
	title: string;
	slug: string;
	billing_code: string | null;
}

export interface SupportFeature {
	id: number;
	feature: number;
	support_tier: NavigationResource<SupportTier>;
}

export interface SupportTier {
	id: number;
	title: string;
	slug: string;
	includes_private_support: boolean;
	includes__SLA?: string;
}

export interface Plan {
	id: number;
	title: string;
	billing_code: string | null;
	monthly_price: number;
	annual_price: number;
	can_self_serve: boolean;
	is_legacy: boolean;

	plan_feature: ReverseNavigationResource<PlanFeature>;
	offers__plan_addon: ReverseNavigationResource<PlanAddon>;
	plan__has__discount_code: ReverseNavigationResource<PlanDiscountCode>;
}

export interface PlanAddon {
	id: number;
	base_price: number;
	can_self_serve: boolean;
	bills_dynamically: boolean;

	offers__feature: NavigationResource<Feature>;
}

export interface PlanDiscountCode {
	id: number;
	discount_code: string;
	plan: NavigationResource<Plan>;
}

export interface PlanFeature {
	id: number;
	quantity: number;
	provides__feature: NavigationResource<Feature>;
}

export type SubscriptionBillingCycle =
	| 'monthly'
	| 'quarterly'
	| 'biannual'
	| 'annual'
	| 'biennial'
	| 'triennial'
	| 'quadrennial'
	| 'quinquennial';

export interface Subscription {
	id: number;
	starts_on__date: string;
	ends_on__date: string | null;
	discount_percentage: number;
	billing_cycle: SubscriptionBillingCycle;
	origin: string;

	is_for__organization: NavigationResource<Organization>;
	is_for__plan: NavigationResource<Plan>;
	subscription_addon_discount: ReverseNavigationResource<SubscriptionAddonDiscount>;
	/** @deprecated */
	discounts__plan_addon: ReverseNavigationResource<SubscriptionAddonDiscount>;
	subscription_prepaid_addon: ReverseNavigationResource<SubscriptionPrepaidAddon>;
}

export interface SubscriptionPrepaidAddon {
	id: number;
	discount_percentage: number;
	quantity: number;
	starts_on__date: string;
	expires_on__date: string | null;

	is_for__plan_addon: NavigationResource<PlanAddon>;
	is_for__subscription: NavigationResource<Subscription>;
}

export interface SubscriptionAddonDiscount {
	id: number;
	discount_percentage: number;
	discounts__plan_addon: NavigationResource<PlanAddon>;
}
