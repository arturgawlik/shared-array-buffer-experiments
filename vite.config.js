import fs from "node:fs";

/** @type {import('vite').UserConfig} */
export default {
  server: {
    open: "/race-condition/index.html",
    headers: {
      // Need those headers because want to use SharedArrayBuffer.
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
    https: {
      // Need https because want to use SharedArrayBuffer.
      key: fs.readFileSync("./key.pem"),
      cert: fs.readFileSync("./cert.pem"),
    },
  },
};
