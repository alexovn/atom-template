"use strict";

import { path, srcPath } from "../gulpfile.babel.js";
import { src, dest } from "gulp";

import plumber from "gulp-plumber";
// import svgSprite from "gulp-svg-sprite";

import svgmin from 'gulp-svgmin';
import svgStore from 'gulp-svgstore';
import rename from 'gulp-rename';
import cheerio from 'cheerio';
import gulpcheerio from 'gulp-cheerio';
import through2 from 'through2';
import consolidate from 'gulp-consolidate';


const browserSync = require("browser-sync").create();

function sprites() {
    return src(path.src.sprites)
        .pipe(
        gulpcheerio({
          run: function($, file) {
    
            $('[fill]:not([fill="currentColor"])').removeAttr('fill');
            $('[stroke]').removeAttr('stroke');
            let w,h,size;
            if($('svg').attr('height')){
                w = $('svg').attr('width').replace(/\D/g,'');
                h = $('svg').attr('height').replace(/\D/g,'');
            } else {
                size = $('svg').attr('viewbox').split(' ').splice(2);
                w = size[0];
                h = size[1];
                $('svg').attr('width', parseInt(w));
                $('svg').attr('height', parseInt(h));
            }
            $('svg').attr('viewBox', '0 0 ' + parseInt(w) + ' ' + parseInt(h));
          },
          parserOptions: { xmlMode: true }
        }))
        .pipe(plumber())
        .pipe(svgmin({
            js2svg: {
                pretty: true
            },
            plugins: [{
                removeDesc: true
            }, {
                cleanupIDs: true
            }, {
                removeViewBox: false
            }, {
                mergePaths: false
            }]
        }))
        .pipe(rename({ prefix: 'icon-' }))
        .pipe(svgStore({ inlineSvg: false }))
        .pipe(through2.obj(function (file, encoding, cb) {
            let $ = cheerio.load(file.contents.toString(), {xmlMode: true});
            let data   = $('svg > symbol').map(function() {
            let $this  = $(this);
            let size   = $this.attr('viewBox').split(' ').splice(2);
            let name   = $this.attr('id');
            let ratio  = size[0] / size[1]; // symbol width / symbol height
            let fill    = $this.find('[fill]:not([fill="currentColor"])').attr('fill');
            let stroke = $this.find('[stroke]').attr('stroke');

            return {
                name: name,
                ratio: +ratio.toFixed(2),
                fill: fill || 'initial',
                stroke: stroke || 'initial'
            };
            }).get();
        this.push(file);
        src(srcPath + 'assets/styles/main/helpers/_sprite-svg.scss')
        .pipe(consolidate('lodash', {
            symbols: data
        }))
            .pipe(dest(path.src.spritesStylesGen));
        cb();
        }))
        .pipe(rename({ basename: 'sprite' }))
        .pipe(dest(path.build.sprites))
        .pipe(browserSync.stream())
}

//-------- NEW method, but need review before to go -----------

// function sprites() {
//     return src(path.src.sprites)
//         .pipe(plumber())
//         .pipe(svgSprite({
//             mode: {
//                 symbol: {
//                     sprite: "../sprite.svg",
//                 }
//             },
//             shape: {
//                 id: {
//                     generator: "icon-%s"
//                 },
//                 transform:[
//                     {
//                         svgo: {
//                             plugins: [
//                                 {
//                                     removeAttrs: {
//                                         attrs: ['class', 'data-name', 'fill', 'stroke.*'],
//                                     },
//                                 },
//                             ],
//                         },
//                     },
//                 ],
//             },
//         }))
//         .pipe(dest(path.build.sprites))
//         .pipe(browserSync.stream())
// }

//-------- NEW method, but need review before to go -----------

exports.sprites = sprites;