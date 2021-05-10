"use strict"

const {src, dest} = require("gulp");
const gulp = require("gulp");
const fs = require("fs");
const browserSync = require("browser-sync").create();
const plumber = require("gulp-plumber");
const fileinclude = require("gulp-file-include");
const webphtml = require("gulp-webp-in-html");
const webpcss = require("gulp-webpcss");
const webp = require("imagemin-webp");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const cssnano = require("cssnano");
const rename = require("gulp-rename");
const del = require("del");
const uglify = require("gulp-uglify-es").default;
const newer = require("gulp-newer");
const imagemin = require("gulp-imagemin");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const fonter = require("gulp-fonter");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const webpackConfig = require("./webpack.config.js");

sass.compiler = require("node-sass")

/* Paths */

const srcPath = "src/";
const distPath = "dist/";

const path = {
    build: {
        html:   distPath,
        js:     distPath + "assets/js/",
        css:    distPath + "assets/css/",
        images: distPath + "assets/images/",
        fonts:  distPath + "assets/fonts/"
    },
    src: {
        html:   srcPath + "*.html",
        js:     srcPath + "assets/js/**/*.js",
        css:    srcPath + "assets/scss/*.scss",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts:  srcPath + "assets/fonts/*.ttf"
    },
    watch: {
        html:   srcPath + "**/*.html",
        js:     srcPath + "assets/js/**/*.js",
        css:    srcPath + "assets/scss/**/*.scss",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    clean: "./" + distPath
};

/* Tasks */

function browsersync() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        },
        notify: false,
        port: 5000,
    });
}

function html() {
    return src(path.src.html, {base: srcPath})
        .pipe(plumber())
        .pipe(fileinclude())
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream());
}

function css() {
    return src(path.src.css, {base: srcPath + "assets/scss/"})
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: "expanded"
        }))
        .pipe(postcss([autoprefixer]))
        .pipe(webpcss({
            webpClass: "webp",
            noWebpClass: ".no-webp"
        }))
        .pipe(dest(path.build.css))
        .pipe(postcss([cssnano]))
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(sourcemaps.write("."))
        .pipe(dest(path.build.css))
        .pipe(browserSync.stream());
}

function js() {
    return src(path.src.js, {base: srcPath + "assets/js/"})
        .pipe(plumber())
        .pipe(webpackStream(webpackConfig), webpack)
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.stream())
}

function images () {
    return src(path.src.images)
        .pipe(newer(path.build.images))
        .pipe(imagemin([
            webp({
                quality: 75
            })
        ]))
        .pipe(rename({
            extname: ".webp"
        }))
        .pipe(dest(path.build.images))
        .pipe(src(path.src.images))
        .pipe(newer(path.build.images))
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 95, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
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

function fontstyle() {
	let file_content = fs.readFileSync(srcPath + "assets/scss/main/_fonts.scss");
	if (file_content == "") {
		fs.writeFile(srcPath + "assets/scss/main/_fonts.scss", "", cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split(".");
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(srcPath + "assets/scss/main/_fonts.scss", '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
}
function cb() { }

function clean() {
    return del(path.clean);
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
}

const build = gulp.series(clean, fonts_otf, gulp.parallel(html, css, js, images), fonts, gulp.parallel(fontstyle));
const watch = gulp.parallel(build, watchFiles, browsersync);

/* Export Tasks */
exports.html = html;
exports.css = css;
exports.js = js;
exports.fonts_otf = fonts_otf;
exports.fontstyle = fontstyle;
exports.fonts = fonts;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;