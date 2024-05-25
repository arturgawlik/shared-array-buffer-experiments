if (isMainProcess()) {
  main();
} else {
  mainWorker();
}

function isMainProcess() {
  return !!globalThis.document;
}

function main() {
  const WORKERS_COUNT = 2;
  const SHARED_BUFFER = new SharedArrayBuffer(
    BigInt64Array.BYTES_PER_ELEMENT * (WORKERS_COUNT + 1)
  );
  const view = new BigInt64Array(SHARED_BUFFER);
  view.fill(BigInt(0));

  const actualValueElem = document.querySelector("#actual-value");
  const incrementCallsElem = document.querySelector("#increment-calls");

  for (let index = 0; index < WORKERS_COUNT; index++) {
    const worker = new Worker(new URL("index.js", import.meta.url), {
      type: "module",
    });
    worker.postMessage({ view, index: index + 1 });
  }

  setInterval(() => {
    logValues(
      view[0],
      view.reduce((prevValue, currValue, index) => {
        if (index) {
          return prevValue + currValue;
        } else {
          return BigInt(0);
        }
      })
    );
  }, 3000);

  function logValues(actualValue, incrementCalls) {
    actualValueElem.innerHTML = actualValue;
    incrementCallsElem.innerHTML = incrementCalls;
  }
}

function mainWorker() {
  let viewArray = null;
  let workerIndex = null;

  globalThis.addEventListener("message", (event) => {
    const { view, index } = event.data;
    workerIndex = index;
    viewArray = view;
    startInterval();
  });

  function startInterval() {
    setInterval(() => {
      increment(viewArray, workerIndex);
    }, 1000);
  }
}

function increment(view, workerIndex) {
  view[0]++;
  view[workerIndex]++;
}
