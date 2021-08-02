"use strict";

// import browserSync from "browser-sync";
const browserSync = require("browser-sync").create();

const distPath = "dist/";

function server() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath,
        },
        notify: false,
        open: false,
        port: 5000,
    });
}
exports.server = server;