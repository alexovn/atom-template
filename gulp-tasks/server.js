"use strict";

import { path, distPath } from "../gulpfile.babel.js";
import gulp from "gulp";

import scripts from "./scripts";
import html from "./html";
import styles from "./styles";
import vendorStyles from "./styles";
import images from "./images";
import sprites from "./sprites";

const browserSync = require("browser-sync").create();

function server() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath,
        },
        notify: false,
        open: false,
        port: 5000,
    });

    gulp.watch([path.watch.html], html.html);
    gulp.watch([path.watch.styles], styles.styles);
    gulp.watch([path.watch.scripts], scripts.scripts);
    gulp.watch([path.watch.images], images.images);
    gulp.watch([path.watch.vendorStyles], vendorStyles.vendorStyles);
    gulp.watch([path.watch.sprites], sprites.sprites);
}

exports.server = server;