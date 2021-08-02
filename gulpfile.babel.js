"use strict"

const {src, dest} = require("gulp");

const gulp = require("gulp");

const environments = require('gulp-environments');
const development = environments.development;
const production = environments.production;

const fs = require("fs");
const browserSync = require("browser-sync").create();
const plumber = require("gulp-plumber");
const fileinclude = require("gulp-file-include");

const RevAll = require("gulp-rev-all");
const revRewrite = require('gulp-rev-rewrite');
const revDistClean = require('gulp-rev-dist-clean');

// const webphtml = require("gulp-webp-in-html");
const webp = require("imagemin-webp");

// const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
// const autoprefixer = require("autoprefixer");
// const sourcemaps = require("gulp-sourcemaps");
const cssnano = require("cssnano");
const concatCss = require('gulp-concat-css');

const rename = require("gulp-rename");
const del = require("del");
const newer = require("gulp-newer");
const imagemin = require("gulp-imagemin");

const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const fonter = require("gulp-fonter");

const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const webpackConfig = require("./webpack.config.js");

/* Paths */

const srcPath = "#src/";
const distPath = "dist/";

const path = {
    build: {
        html:          distPath,
        js:            distPath + "assets/js/",
        css:           distPath + "assets/css/",
        images:        distPath + "assets/images/",
        fonts:         distPath + "assets/fonts/",
        favicons:      distPath + "assets/images/favicons/",
    },
    src: {
        html:         [srcPath + "views/**/*.html", "!" + srcPath + "/views/**/_*.html"],
        js:            srcPath + "assets/js/**/*.js",
        css:           srcPath + "assets/scss/*.scss",
        images:       [srcPath + "assets/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}", "!" + srcPath + "assets/images/favicon/*.{jpg,jpeg,png,gif}"],
        fonts:         srcPath + "assets/fonts/*.ttf",
        vendorStyles:  srcPath + "assets/vendor/*.css",
        favicons:      srcPath + "assets/images/favicon/*.{jpg,jpeg,png,gif}",
    },
    watch: {
        html:          srcPath + "**/*.html",
        js:            srcPath + "assets/js/**/*.js",
        css:           srcPath + "assets/scss/**/*.scss",
        images:        srcPath + "assets/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
        vendorStyles:  srcPath + "assets/vendor/*.css",
    },
    clean: "./" + distPath
};

export { path };

/* Tasks */

import server from "./gulp-tasks/server";
import html from "./gulp-tasks/html";
import styles from "./gulp-tasks/styles";
import vendorStyles from "./gulp-tasks/styles";
import favicon from "./gulp-tasks/favicons";

function js() {
    return src(path.src.js, {base: srcPath + "assets/js/"})
        .pipe(plumber())
        .pipe(webpackStream(webpackConfig, webpack))
        .pipe(dest(path.build.js))
        .pipe(browserSync.stream())
}

function images () {
    return src(path.src.images)
        .pipe(production(newer(path.build.images)))
        .pipe(production(imagemin([
            webp({
                quality: 75
            })
        ])))
        .pipe(production(rename({
            extname: ".webp"
        })))
        .pipe(production(dest(path.build.images)))
        .pipe(production(src(path.src.images)))
        .pipe(production(newer(path.build.images)))
        .pipe(production(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 95, progressive: true}),
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

function fonts () {
    src(path.src.fonts)
        .pipe(plumber())
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts))
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.stream())
}

function fonts_otf () {
    return src("./" + srcPath + "assets/fonts/*.otf")
        .pipe(plumber())
        .pipe(fonter({
            formats: ["ttf"]
        }))
        .pipe(dest("./" + srcPath + "/assets/fonts/"))
}

function fontstyle(cb) {
	let file_content = fs.readFileSync(srcPath + "assets/scss/main/fonts.scss");
	if (file_content == "") {
		fs.writeFile(srcPath + "assets/scss/main/fonts.scss", "", cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split(".");
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(srcPath + "assets/scss/main/fonts.scss", '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
    cb()
}

function clean() {
    return del(path.clean);
}

function revision() {
    return src('dist/assets/**/*.{css,js}')
      .pipe(RevAll.revision())
      .pipe(dest('dist/assets'))
      .pipe(RevAll.manifestFile())
      .pipe(dest('dist/assets'))
}

function rewrite() {
    const manifest = fs.readFileSync('dist/assets/rev-manifest.json');
  
    return src('dist/**/*.html')
      .pipe(revRewrite({ manifest }))
      .pipe(dest('dist'))
}

function reclean() {
    return src('dist/assets/**/*.{css,js}', {read: false})
      .pipe(revDistClean('dist/assets/rev-manifest.json', {keepOriginalFiles: false}))
}

function watchFiles() {
    gulp.watch([path.watch.html], html.html);
    gulp.watch([path.watch.css], styles.styles);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.vendorStyles], vendorStyles.vendorStyles);
}

const fontsBuild = gulp.series(fonts_otf, fonts, fontstyle);
const hashes = gulp.series(revision, rewrite, reclean);
const prod = gulp.series(clean, fontsBuild, vendorStyles.vendorStyles, gulp.parallel(html.html, styles.styles, js, images, favicon.favicon), hashes);
const dev = gulp.parallel(gulp.series(clean, fontsBuild, vendorStyles.vendorStyles, gulp.parallel(html.html, styles.styles, js, images, favicon.favicon)), watchFiles, server.server);

/* Export Tasks */
// exports.html = html;
// exports.css = css;
exports.js = js;
exports.fonts_otf = fonts_otf;
exports.fontstyle = fontstyle;
// exports.vendorCSS = vendorCSS;
exports.revision = revision;
exports.rewrite = rewrite;
exports.reclean = reclean;
exports.fonts = fonts;
exports.images = images;
exports.clean = clean;
exports.default = dev;
exports.dev = dev;
exports.prod = prod;
exports.hashes = hashes;