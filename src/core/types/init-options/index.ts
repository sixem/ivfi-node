export type TOptions = {
	processor?: any;
	performance?: number | boolean;
	format?: {
		[key: string]: Array<string>;
	};
	sorting?: {
		enabled?: boolean;
		types?: number;
		sortBy?: string;
		ascending?: number;
		order?: string;
	};
	gallery?: {
		enabled?: boolean;
		reverseOptions?: boolean;
		scrollInterval?: number;
		listAlignment?: number;
		fitContent?: boolean;
	};
	preview?: {
		enabled?: boolean;
		hoverDelay?: number;
		cursorIndicator?: boolean;
	};
	readme?: {
		enabled?: boolean;
		hidden?: boolean;
		toggled?: boolean;
	};
	media?: {
		extensions?: {
			image?: Array<string>;
			video?: Array<string>;
		};
	};
	style?: {
		themes: boolean | {
			set?: string | boolean;
			path?: string;
			default?: string;
		};
		compact?: boolean;
	};
	icon?: {
		path?: string | null;
		mime?: string | null;
	};
	authentication?: {
		users: {
			[key: string]: string;
		} | false,
		restrict?: string | Array<string>
	};
	ssl?: boolean | {
		key: string;
		cert: string;
	};
	exclude?: boolean;
	debug?: boolean;
};