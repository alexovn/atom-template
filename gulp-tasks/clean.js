"use strict";
import { path } from "../gulpfile.babel.js";

import del from "del"

function clean() {
    return del(path.clean);
}

exports.clean = clean;