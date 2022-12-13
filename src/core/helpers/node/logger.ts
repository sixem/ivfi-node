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