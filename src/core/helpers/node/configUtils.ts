import _ from 'lodash';

import {
	TUserClient,
	TOptions,
	TPageConfig
} from '../../types/';

import {
	mergeExisting
} from './index';

/**
 * Creates a client config
 * 
 * This is a template that is later used to create a temporary user config
 */
export const configCreate = (server: TOptions, overrides: TOptions) =>
{
	return mergeExisting.keepShapeObject({
		performance: server.performance,
		format: server.format,
		preview: server.preview,
		sorting: server.sorting,
		gallery: server.gallery,
		extensions: server.media.extensions,
		icon: {
			path: server.icon.path,
			mime: server.icon.mime
		},
		style:
		{
			themes: server.style.themes,
			compact: server.style.compact
		},
		readme: {
			toggled: server.readme.toggled
		},
		debug: server.debug
	}, overrides);
};

/**
 * Adjusts a config to make it use client-specific values
 */
export const configAdjust = (config: TPageConfig, client: TUserClient) =>
{
	if(_.isEmpty(client) || !client)
	{
		return config;
	}

	if(_.has(client, 'style.compact')
		&& typeof client.style.compact === 'boolean')
	{
		config.style.compact = client.style.compact;
	}

	if(_.has(config, 'style.themes')
		&& _.isObject(config.style.themes))
	{
		if(_.has(client, 'style.theme'))
		{
			config.style.themes.set = (!client.style.theme ? false : client.style.theme);
		}
	}

	if(_.has(client, 'sort'))
	{
		if(client.sort.row >= 0 && client.sort.row <= 3)
		{
			switch(parseInt(client.sort.row.toString()))
			{
				case 0:
					config.sorting.sortBy = 'name';
					break;
				case 1:
					config.sorting.sortBy = 'modified';
					break;
				case 2:
					config.sorting.sortBy = 'size';
					break;
				case 3:
					config.sorting.sortBy = 'type';
					break;
			}

			config.sorting.enabled = true;
		}

		if(client.sort.ascending === 0
			|| client.sort.ascending === 1)
		{
			config.sorting.order = (client.sort.ascending === 1 ? 'asc': 'desc');
			config.sorting.enabled = true;
		}
	}

	if(_.has(client, 'readme.toggled'))
	{
		config.readme.toggled = client.readme.toggled;
	}

	return config;
};