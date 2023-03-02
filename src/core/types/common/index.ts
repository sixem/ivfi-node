import {
	EventTargetEventHooks
} from '../module-event-hooks';

/**
 * Extension for preview anchors
 */
export interface IPreviewAnchor extends HTMLElement {
	itemIndex?: number;
}

/**
 * Extension for media indexing
 */
export interface ITableRowMI extends HTMLElement {
	_mediaIndex?: number;
}

/**
 * On preview load types
 */
export type TOnPreviewLoad = {
	loaded: boolean;
	type: string;
	audible: boolean;
	element: HTMLVideoElement | HTMLImageElement;
	src: string;
	timestamp?: number;
};

/**
 * Preview options
 */
export type TPreviewOptions = {
	delay?: number;
	cursor?: boolean;
	encodeAll?: boolean;
	force?: {
		extension?: string | number;
		type?: string | number;
	};
	on?: {
		onLoaded: (data: TOnPreviewLoad) => void;
	};
};

export type TExtensionArray = {
	image: Array<string>;
	video: Array<string>;
};

/**
 * File object passed to the renderer
 */
export type TFileContent = {
	media: boolean;
	type: string;
	hidden: boolean;
	relative: string;
	name: string;
	size: {
		raw: number;
		readable?: string;
	};
	modified: {
		raw: number;
		formatted: Array<string>;
	};
};

/** Metadata array */
export type TMetaData = Array<{
	[key: string]: string | boolean;
}>;

/**
 * Dotfile configuration (.ivfi files)
 */
export type TDotFile = {
	[key: string]: Array<string
			| { [key: string]: string; }>
		| string;
};

/**
 * `galleryItemChanged` event data
 */
export type TPayloadgalleryItemChanged = {
	source: string;
	index: number;
	image: HTMLElement | undefined;
	video: HTMLElement | undefined;
};

/**
 * Global `window` extensions
 */
export interface IWindowGlobals extends Window {
	eventHooks?: EventTargetEventHooks['eventHooks'];
};

/**
 * Global `document` extensions
 */
export interface IDocumentGlobals extends Document {
	eventHooks?: EventTargetEventHooks['eventHooks'];
};