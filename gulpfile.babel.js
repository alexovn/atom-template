"use strict"

import gulp, { src } from 'gulp';

import yargs from 'yargs';
import c from 'ansi-colors';

const argv = yargs.argv;
const production = !!argv.production;

if (production) {
    console.log(c.bgRed.black('Production mode'));
} else {
    console.log(c.bgRed.black('Development mode'));
}

/* Paths */
const srcPath = "#src/";
const distPath = "dist/";
/* Paths */

const path = {
    build: {
        html:       distPath,
        scripts:    distPath + "assets/js/",
        styles:     distPath + "assets/styles/",
        images:     distPath + "assets/images/",
        fonts:      distPath + "assets/fonts/",
        favicons:   distPath + "assets/images/favicons/",
        sprites:    distPath + "assets/images/sprites/",
    },
    src: {
        html:           [srcPath + "views/**/*.html", "!" + srcPath + "/views/**/_*.html"],
        scripts:         srcPath + "assets/js/**/*.js",
        styles:         [srcPath + "assets/styles/*.scss", "!" + srcPath + "assets/styles/libs/**/*.{scss,css}"],
        images:         [srcPath + "assets/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}", "!" + srcPath + "assets/images/favicon/*.{jpg,jpeg,png,gif}", "!" + srcPath + "assets/images/sprite/**/*.svg"],
        fonts:           srcPath + "assets/fonts/*.ttf",
        vendorStyles:    srcPath + "assets/styles/libs/*.scss",
        favicons:        srcPath + "assets/images/favicon/*.{jpg,jpeg,png,gif}",
        sprites:         srcPath + "assets/images/sprite/**/*.svg",
        spritesStylesGen:srcPath + "assets/styles/main/dev/generated"
    },
    watch: {
        html:         srcPath + "**/*.html",
        scripts:      srcPath + "assets/js/**/*.js",
        styles:       srcPath + "assets/styles/**/*.scss",
        images:       srcPath + "assets/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
        vendorStyles: srcPath + "assets/styles/libs/*.scss",
        sprites:      srcPath + "assets/images/sprite/**/*.svg",
    },
    clean: "./" + distPath
};

const config = {
    production: production,
};

export { path, config, srcPath, distPath };

/* Tasks */

import html from "./gulp-tasks/html";
import stylesBundle from "./gulp-tasks/styles";
import fontsBundle from "./gulp-tasks/fonts";
import favicon from "./gulp-tasks/favicons";
import scripts from "./gulp-tasks/scripts";
import images from "./gulp-tasks/images";
import server from './gulp-tasks/server';
import clean from './gulp-tasks/clean';
import hashes from './gulp-tasks/hashes';
import sprites from './gulp-tasks/sprites';

const prod = gulp.series(
    clean.clean,
    fontsBundle.fontsBundle,
    gulp.parallel(
        html.html, 
        stylesBundle.stylesBundle,
        scripts.scripts,
        images.images,
        favicon.favicon,
        sprites.sprites
    ), 
    hashes.hashes
);

const dev = gulp.parallel(
    gulp.series(
        clean.clean,
        fontsBundle.fontsBundle,
        gulp.parallel(
            html.html,
            stylesBundle.stylesBundle,
            scripts.scripts,
            images.images,
            favicon.favicon,
            sprites.sprites
        ),
    ),
    server.server
);

/* Export Tasks */

exports.default = dev;
exports.dev = dev;
exports.prod = prod;