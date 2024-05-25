import fs from "node:fs";

/** @type {import('vite').UserConfig} */
export default {
  server: {
    open: "/race-condition/index.html",
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
    https: {
      key: fs.readFileSync("./key.pem"),
      cert: fs.readFileSync("./cert.pem"),
    },
  },
};
