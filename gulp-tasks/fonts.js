"use strict";

import { path, srcPath } from "../gulpfile.babel.js";
import { src, dest } from "gulp";
import gulp from "gulp";

import fs from "fs";
import plumber from "gulp-plumber";
const browserSync = require("browser-sync").create();

import ttf2woff from "gulp-ttf2woff";
import ttf2woff2 from "gulp-ttf2woff2";
import fonter from "gulp-fonter";

function fonts() {
	src(path.src.fonts)
		.pipe(plumber())
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts))
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts))
		.pipe(browserSync.stream())
}

function fonts_otf() {
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
			if (err) {
				throw err
			} else if (items) {
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

const fontsBundle = gulp.series(fonts_otf, fonts, fontstyle);

exports.fontsBundle = fontsBundle;