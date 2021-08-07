"use strict";

import { path, config, srcPath } from "../gulpfile.babel.js";
import { src, dest } from "gulp";

import plumber from "gulp-plumber";
import webpack from "webpack"; 
import webpackStream from "webpack-stream";
import webpackConfig from "../webpack.config.js";
import rename from "gulp-rename";
import yargs from "yargs";
import gulpif from "gulp-if";

const browserSync = require("browser-sync").create();

const argv = yargs.argv;
const production = !!argv.production;

function scripts() {

  webpackConfig.mode = config.production ? 'production' : 'development';
  webpackConfig.devtool = config.production ? false : 'source-map';
    
    return src(path.src.scripts, {base: srcPath + "assets/js/"})
        .pipe(plumber())
        .pipe(webpackStream(webpackConfig, webpack))
        .pipe(gulpif(production, rename({
            suffix: ".min"
        })))
        .pipe(dest(path.build.scripts))
        .pipe(browserSync.stream())
}
exports.scripts = scripts;