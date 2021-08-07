"use strict";

import { path, config, srcPath } from "../gulpfile.babel.js";
import { src, dest } from "gulp";

import plumber from "gulp-plumber";
import webpack from "webpack"; 
import webpackStream from "webpack-stream";
import webpackConfig from "../webpack.config.js";

const browserSync = require("browser-sync").create();

function scripts() {
  webpackConfig.devtool = config.production ? false : 'source-map';
    
    return src(path.src.scripts, {base: srcPath + "assets/js/"})
        .pipe(plumber())
        .pipe(webpackStream(webpackConfig, webpack))
        .pipe(dest(path.build.scripts))
        .pipe(browserSync.stream())
}
exports.scripts = scripts;