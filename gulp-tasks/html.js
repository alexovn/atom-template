"use strict";

import { path, srcPath } from "../gulpfile.babel.js";
import { src, dest } from "gulp";

import plumber from "gulp-plumber";
import webphtml from "gulp-webp-in-html";
import nunjucks from "gulp-nunjucks";
import prettify from 'gulp-prettify';
import gulpif from "gulp-if";

const browserSync = require("browser-sync").create();

import yargs from 'yargs';
const argv = yargs.argv;
const production = !!argv.production;


function html() {
    return src(path.src.html)
        .pipe(plumber())
        .pipe(nunjucks.compile({
            path: [srcPath + "views/**/*.html"]
        }))
        .pipe(gulpif(production, webphtml()))
        .pipe(prettify({
            indent_size: 2,
            preserve_newlines: false,
            end_with_newline: true,
            wrap_attributes: 'auto'
        }))
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream());
}

exports.html = html;