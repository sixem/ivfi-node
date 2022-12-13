import {
	TOptions
} from '../index';

/**
 * Configuration (user) object
 */
export type TUserClient = {
	set?: (
		client: TUserStorage | TUserClient,
		options?: TUserStorage
	) => void;
	get?: () => TUserClient;
	getDefaults?: () => TUserStorage;
	gallery?: {
		listAlignment?: number;
		listState?: number;
		volume?: number;
	};
	style?: {
		compact?: boolean;
		theme?: string | boolean;
	};
	readme?: {
		toggled?: boolean;
	};
	timezoneOffset?: number;
	sort?: {
		ascending?: string | number;
		row?: string | number;
	}
};

/**
 * User storage (cookies)
 */
export type TUserStorage = {
	gallery?: {
		reverseOptions?: boolean;
		fitContent?: boolean;
		autoplay?: boolean;
		listAlignment?: number;
		listWidth?: number | boolean;
		listState?: number;
		volume?: number;
	};
	sort?: {
		ascending?: string | number;
		row?: string | number;
	};
	style?: {
		compact?: boolean;
		theme?: string | boolean;
		set?: string;
	};
	readme?: {
		toggled?: boolean;
	};
};

/**
 * Configuration object (from backend)
 */
export interface IConfigData extends Omit<TUserStorage, 'style'> {
	mobile?: boolean;
	bust?: string;
	style?: {
		compact?: boolean;
		themes?: {
			set?: boolean | string;
		}
	};
}

/**
 * Outer configuration object
 */
export type TConfigCapsule = {
	init?: () => void;
	isMobile?: () => boolean;
	exists?: (
		path: string
	) => boolean;
	set?: (
		path: string,
		value: any
	) => boolean;
	get?: (path: string) => any;
	data?: IConfigData;
};

/**
 * Page configuration object
 */
export type TPageConfig = {
	mobile?: boolean;
	timestamp?: number;
	performance?: boolean | number;
	sorting?: Partial<TOptions['sorting']>;
	gallery?: Partial<TOptions['gallery']>;
	preview?: Partial<TOptions['preview']>;
	style?: Partial<TOptions['style']>;
	readme?: {
		toggled?: boolean;
	}
};