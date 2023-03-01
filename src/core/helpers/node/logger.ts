/** Modules */
import { options } from '../../../options';

/**
 * A simple logging feature
 * 
 * @param messages 
 */
export const logger = (...messages: Array<any>) =>
{
	const currentTime = new Date();
	const logType = (messages.shift()).toUpperCase();

	console.log(`[${currentTime.toTimeString().split(' (')[0]}][${logType}]:`, ...messages);
};

/**
 * Logs a debug message to the console if debugging is enabled
 * 
 * @param messages 
 */
export const debug = (...messages: Array<any>) =>
{
	if(options.get('debug'))
	{
		logger('debug', ...messages);
	}
};