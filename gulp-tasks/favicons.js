"use strict";

import { path } from "../gulpfile.babel.js";
import { src, dest } from "gulp";
import favicons from "gulp-favicons";

function favicon() {
    return src(path.src.favicons)
        .pipe(favicons({
            icons: {
                appleIcon: true,
                favicons: true,
                online: false,
                appleStartup: false,
                android: false,
                firefox: false,
                yandex: false,
                windows: false,
                coast: false
            }
        }))
        .pipe(dest(path.build.favicons))
}
exports.favicon = favicon;