if (isMainProcess()) {
  main();
} else {
  mainWorker();
}

function isMainProcess() {
  return !!globalThis.document;
}

function main() {
  const SHARED_BUFFER = new SharedArrayBuffer(1024);
  const view = new Int16Array(SHARED_BUFFER);

  document.querySelector("#btn").addEventListener("click", () => {
    view[0]++;
  });

  const worker = new Worker(new URL("index.js", import.meta.url), {
    type: "module",
  });
  worker.postMessage(view);
}

function mainWorker() {
  let view = null;

  globalThis.addEventListener("message", (event) => {
    view = event.data;
  });

  setInterval(() => {
    console.log(view);
  }, 3000);
}
