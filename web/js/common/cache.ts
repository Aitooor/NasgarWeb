
// @ts-ignore
if(!window.custom_cached) 
	// @ts-ignore
	window.custom_cached = {};

// @ts-ignore
const custom_cached = window.custom_cached;

export function setCache<T>(name: string, obj: T): T {
	return custom_cached[name] = obj;
}

export function getCache<T>(name: string, _default?: T): T {
	if(custom_cached[name])
		return custom_cached[name];

	return custom_cached[name] = _default;
}
