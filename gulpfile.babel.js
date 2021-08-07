"use strict"

import gulp from 'gulp';

import yargs from 'yargs';
import color from 'ansi-colors';

const argv = yargs.argv;
const production = !!argv.production;

if (production) {
  console.log(color.green.bold.underline('🚚 Production mode'));
} else {
  console.log(color.yellow.bold.underline('🔧 Development mode'));
}

/* Paths */
const srcPath = "#src/";
const distPath = "dist/";
/* Paths */

const path = {
    build: {
        html:          distPath,
        scripts:       distPath + "assets/js/",
        css:           distPath + "assets/css/",
        images:        distPath + "assets/images/",
        fonts:         distPath + "assets/fonts/",
        favicons:      distPath + "assets/images/favicons/",
    },
    src: {
        html:         [srcPath + "views/**/*.html", "!" + srcPath + "/views/**/_*.html"],
        scripts:       srcPath + "assets/js/**/*.js",
        css:           srcPath + "assets/scss/*.scss",
        images:       [srcPath + "assets/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}", "!" + srcPath + "assets/images/favicon/*.{jpg,jpeg,png,gif}"],
        fonts:         srcPath + "assets/fonts/*.ttf",
        vendorStyles:  srcPath + "assets/scss/libs/*.css",
        favicons:      srcPath + "assets/images/favicon/*.{jpg,jpeg,png,gif}",
    },
    watch: {
        html:          srcPath + "**/*.html",
        scripts:       srcPath + "assets/js/**/*.js",
        css:           srcPath + "assets/scss/**/*.scss",
        images:        srcPath + "assets/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
        vendorStyles:  srcPath + "assets/scss/libs/*.css",
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

const prod = gulp.series(clean.clean, fontsBundle.fontsBundle, gulp.parallel(html.html, stylesBundle.stylesBundle, scripts.scripts, images.images, favicon.favicon), hashes.hashes);

const dev = gulp.parallel(gulp.series(clean.clean, fontsBundle.fontsBundle, gulp.parallel(html.html, stylesBundle.stylesBundle, scripts.scripts, images.images, favicon.favicon)), server.server);

/* Export Tasks */

exports.default = dev;
exports.dev = dev;
exports.prod = prod;