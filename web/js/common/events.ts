
export type _listener<T extends any[] = Array<any>> = (...args: T) => void;

export interface __events<T extends any[] = Array<any>> {
	[event: string]: _listener<T>[];
}

export class EventEmitter<T extends any[] = Array<any>> {

	private _events: __events<T> = {};
	private _eventNames: string[] = [];

	/**
	 * @param opts Event names
	 */
	constructor(opts: string[]) {
		this._eventNames = opts;
	}

	emit(name: string, args: T) {
		const ev = this._events[name];

		if(typeof ev === "undefined") return;

		for(const fn of ev) 
			fn(...args);

		return;
	}

	on(name: string, listener: _listener<T>) {
		if(!this._eventNames.includes(name)) 
			throw new TypeError("That event doesn't exists. " + name)

		const ev = this._events[name];

		if(typeof ev === "undefined") {
			this._events[name] = [];
			this.on(name, listener);
			return;
		}

		this.off(name, listener);

		ev.push(listener);
	}

	addListener(name: string, listener: _listener<T>) {
		this.on(name, listener);
	}

	off(name: string, listener: _listener<T>) {
		const ev = this._events[name];

		if(typeof ev === "undefined") return;

		this._events[name] = ev.filter(fn => {
			return fn !== listener;
		});
	}

	removeListener(name: string, listener: _listener<T>) {
		this.off(name, listener);
	}

	removeAllListeners() {
		this._events = {};
	}

	getListeners(name: string) {
		const ev = this._events[name];

		if(typeof ev === "undefined") return [];

		return ev.slice(0);
	}
}
