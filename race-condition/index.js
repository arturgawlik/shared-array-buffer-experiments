import Mutex from "./mutex.js";

if (isMainProcess()) {
  main();
} else {
  mainWorker();
}

function isMainProcess() {
  return !!globalThis.document;
}

function main() {
  const WORKERS_COUNT = 100;
  const SHARED_BUFFER = new SharedArrayBuffer(
    BigInt64Array.BYTES_PER_ELEMENT * (WORKERS_COUNT + 1)
  );
  const VIEW = new BigInt64Array(SHARED_BUFFER).fill(BigInt(0));

  const actualValueElem = document.querySelector("#actual-value");
  const incrementCallsElem = document.querySelector("#increment-calls");

  const { mutex, sharedArrayBuffer } = prepareSynchronizationHelpers();

  for (let index = 0; index < WORKERS_COUNT; index++) {
    const worker = new Worker(new URL("index.js", import.meta.url), {
      type: "module",
    });
    worker.postMessage({
      view: VIEW,
      index: index + 1,
      mutex,
      sharedArrayBuffer,
    });
  }

  // reading count of increments and incremented value
  setInterval(() => {
    // FIXME: we cannot call sync wait's in main thread.
    // probably need to replace it with waitAsync
    mutex.lock();

    let incrementCallsCount = BigInt(0);
    VIEW.slice(1).forEach((val) => {
      incrementCallsCount += val;
    });
    logValues(VIEW[0], incrementCallsCount);

    mutex.unlock();
  }, 1000);

  function logValues(actualValue, incrementCalls) {
    actualValueElem.innerHTML = actualValue;
    incrementCallsElem.innerHTML = incrementCalls;
  }
}

function mainWorker() {
  let workerViewArray = null;
  let workerIndex = null;
  let workerMutex = null;

  globalThis.addEventListener("message", (event) => {
    const { view, index, mutex } = event.data;
    workerIndex = index;
    workerViewArray = view;
    workerMutex = Mutex.connect(mutex);
    startInterval();
  });

  function startInterval() {
    setInterval(() => {
      increment(workerViewArray, workerIndex, workerMutex);
    });
  }
}

/**
 * @param {BigInt64Array} view
 * @param {number} workerIndex
 * @param {Mutex} mutex
 */
function increment(view, workerIndex, mutex) {
  mutex.lock();

  view[0]++;
  view[workerIndex]++;

  mutex.unlock();
}

function prepareSynchronizationHelpers() {
  const sharedArrayBuffer = new SharedArrayBuffer(4);
  const mutex = new Mutex();
  return {
    sharedArrayBuffer,
    mutex,
  };
}
