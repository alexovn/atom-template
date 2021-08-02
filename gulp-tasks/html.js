"use strict";

import { path } from "../gulpfile.babel.js";
import { src, dest } from "gulp";

const srcPath = "#src/";

import plumber from "gulp-plumber";
import browserSync from "browser-sync";
import webphtml from "gulp-webp-in-html";
import environments from "gulp-environments"
import nunjucks from "gulp-nunjucks";

const development = environments.development;
const production = environments.production;


function html() {
    return src(path.src.html)
        .pipe(plumber())
        .pipe(nunjucks.compile({
            path: [srcPath + "views/**/*.html"]
        }))
        .pipe(production(webphtml()))
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream());
}

exports.html = html;