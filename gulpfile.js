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

const webphtml = require("gulp-webp-in-html");
const webp = require("imagemin-webp");

const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
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
    },
    src: {
        html:          srcPath + "*.html",
        js:            srcPath + "assets/js/**/*.js",
        css:           srcPath + "assets/scss/*.scss",
        images:        srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts:         srcPath + "assets/fonts/*.ttf",
        vendor_styles: srcPath + "assets/vendor_styles/*.css",
    },
    watch: {
        html:          srcPath + "**/*.html",
        js:            srcPath + "assets/js/**/*.js",
        css:           srcPath + "assets/scss/**/*.scss",
        images:        srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp}",
        vendor_styles: srcPath + "assets/vendor_styles/*.css",
    },
    clean: "./" + distPath
};

/* Tasks */

function browsersync() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath,
            index: 'index.html',
        },
        notify: false,
        port: 5000,
        open: false,
    });
}

function html() {
    return src(path.src.html, {base: srcPath})
        .pipe(plumber())
        .pipe(fileinclude())
        .pipe(production(webphtml()))
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream());
}

function css() {
    return src(path.src.css, {base: srcPath + "assets/scss/"})
        .pipe(plumber())
        .pipe(development(sourcemaps.init()))
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: "expanded"
        }))
        .on("error", catchErr)
        .pipe(production(postcss([autoprefixer()])))
        .pipe(production(dest(path.build.css)))
        .pipe(production(postcss([autoprefixer()])))
        .pipe(postcss([cssnano()]))
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(development(sourcemaps.write(".")))
        .pipe(dest(path.build.css))
        .pipe(browserSync.stream())
}

function catchErr(e) {
    console.log(e);
    this.emit('end');
}

function vendorCSS() {
    return src(path.src.vendor_styles, {base: srcPath + "assets/vendor_styles/"})
        .pipe(plumber())
        .pipe(concatCss("vendor.bundle.css"))
        .pipe(postcss([cssnano()]))
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
}

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
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.vendor_styles], vendorCSS);
}

const hashes = gulp.series(revision, rewrite, reclean);
const prod = gulp.series(clean, fonts_otf, vendorCSS, gulp.parallel(html, css, js, images), hashes, fonts, fontstyle);
const dev = gulp.parallel(gulp.series(clean, fonts_otf, vendorCSS, gulp.parallel(html, css, js, images), fonts, fontstyle), watchFiles, browsersync);

/* Export Tasks */
exports.html = html;
exports.css = css;
exports.js = js;
exports.fonts_otf = fonts_otf;
exports.fontstyle = fontstyle;
exports.vendorCSS = vendorCSS;
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