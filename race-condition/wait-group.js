/**
 * WaitGroup impl with Atomics.
 * It should be used when we want to thread-safe read shared accross multiple threads data.
 */
export default class WaitGroup {
  constructor(initial, opt_sub) {
    this._sub = opt_sub ?? new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
    this._wg = new Int32Array(this._sub);
    this.add(initial);
  }

  static connect(wg) {
    return new WaitGroup(0, wg._sub);
  }

  add(n) {
    let current = Atomics.add(this._wg, 0, 1);
    if (current < 0) {
      throw new Error("WaitGroup is in inconsistent state: negative count.");
    }
    if (current > 0) {
      return;
    }
    Atomics.notify(this._wg, 0);
  }

  done() {
    this.add(-1);
  }

  wait() {
    for (;;) {
      let count = Atomics.load(this._wg, 0);
      if (count === 0) {
        return;
      }
      if (Atomics.wait(this._wg, 0, count) === "ok") {
        return;
      }
    }
  }
}
