"use strict";

import { src, dest } from "gulp";
import gulp from "gulp";

import fs from "fs";
import RevAll from "gulp-rev-all";
import revRewrite from "gulp-rev-rewrite";
import revDistClean from "gulp-rev-dist-clean";

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

const hashes = gulp.series(revision, rewrite, reclean);

exports.hashes = hashes;