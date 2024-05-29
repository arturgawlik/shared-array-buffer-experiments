/**
 * Mutext impl with Atomics.
 * It should be used in scenarios where we want exlusive access to critial code path.
 */
export default class Mutex {
  static get #LOCKED() {
    return 1;
  }
  static get #UNLOCKED() {
    return 0;
  }

  /**
   * Instantiate mutex.
   * @param {SharedArrayBuffer | undefined} opt_sab
   */
  constructor(opt_sab) {
    this._sab = opt_sab ?? new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
    this._mu = new Int32Array(this._sab);
  }

  /**
   * Instantitate mutext connected to given one.
   * @param {SharedArrayBuffer | undefined} mu
   * @returns {Mutex}
   */
  static connect(mu) {
    return new Mutex(mu._sab);
  }

  /**
   * Switch mutext to lock state.
   */
  lock() {
    for (;;) {
      if (
        Atomics.compareExchange(this._mu, 0, Mutex.#UNLOCKED, Mutex.#LOCKED) ===
        Mutex.#UNLOCKED
      ) {
        return;
      }
      Atomics.wait(this._mu, 0, Mutex.#LOCKED);
    }
  }

  /**
   * Switch mutext to unlock state.
   */
  unlock() {
    if (
      Atomics.compareExchange(this._mu, 0, Mutex.#LOCKED, Mutex.#UNLOCKED) !==
      Mutex.#LOCKED
    ) {
      throw new Error("Mutex has inconsitent state: unlock.on unlocked mutex.");
    }
    Atomics.notify(this._mu, 0, 1);
  }
}
