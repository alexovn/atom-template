"use strict";

import { path } from "../gulpfile.babel.js";
import { src, dest } from "gulp";
import newer from "gulp-newer";
import imagemin from "gulp-imagemin";
import rename from "gulp-rename";
import webp from "imagemin-webp";
import gulpif from "gulp-if";

import yargs from 'yargs';
const argv = yargs.argv;
const production = !!argv.production;

function images () {
    return src(path.src.images)
        .pipe(newer(path.build.images))
        .pipe(gulpif(production, imagemin([
            webp({
                lossless: false,
                quality: 75,
                alphaQuality: 100
            })
        ])))
        .pipe(gulpif(production, rename({
            extname: ".webp"
        })))
        .pipe(gulpif(production, dest(path.build.images)))
        .pipe(gulpif(production, src(path.src.images)))
        .pipe(gulpif(production, newer(path.build.images)))
        .pipe(gulpif(production, imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 70, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ])))
        .pipe(dest(path.build.images))
}

exports.images = images;