"use strict";

import { path, srcPath } from "../gulpfile.babel.js";
import { src, dest } from "gulp";

import plumber from "gulp-plumber";
import webphtml from "gulp-webp-in-html";
import environments from "gulp-environments"
import nunjucks from "gulp-nunjucks";
import prettify from 'gulp-prettify';

const browserSync = require("browser-sync").create();

const development = environments.development;
const production = environments.production;


function html() {
    return src(path.src.html)
        .pipe(plumber())
        .pipe(nunjucks.compile({
            path: [srcPath + "views/**/*.html"]
        }))
        .pipe(production(webphtml()))
        .pipe(prettify( {
            indent_size: 2,
            preserve_newlines: false,
            end_with_newline: true,
            wrap_attributes: 'auto'
        }))
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream());
}

exports.html = html;