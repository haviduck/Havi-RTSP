// Minimal EventEmitter for Node and browser. Unlike node:events, emitting "error"
// without a listener does not throw.
export class Emitter {
  constructor() {
    this._listeners = new Map();
  }

  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(fn);
    return this;
  }

  once(event, fn) {
    const wrapped = (...args) => {
      this.off(event, wrapped);
      fn(...args);
    };
    wrapped._original = fn;
    return this.on(event, wrapped);
  }

  off(event, fn) {
    const set = this._listeners.get(event);
    if (!set) return this;
    for (const listener of set) {
      if (listener === fn || listener._original === fn) set.delete(listener);
    }
    if (!set.size) this._listeners.delete(event);
    return this;
  }

  emit(event, ...args) {
    const set = this._listeners.get(event);
    if (!set || !set.size) return false;
    for (const fn of [...set]) fn(...args);
    return true;
  }

  removeAllListeners(event) {
    if (event === undefined) this._listeners.clear();
    else this._listeners.delete(event);
    return this;
  }

  listenerCount(event) {
    return this._listeners.get(event)?.size || 0;
  }
}
