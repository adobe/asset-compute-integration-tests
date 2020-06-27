/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

'use strict';

const assert = require("assert");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");

function shell(command, dir) {
    command = command
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .filter(line => !line.startsWith("#"))
        .join(";");
    execSync(command, {cwd: dir, stdio: 'inherit'});
}

// create dir (if doesn't exist yet) and change into it
function cd(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    process.chdir(dir);
}

describe("integration tests", function() {

    const BUILD_DIR = path.resolve("build"); // absolute paths required beloow

    beforeEach(function() {
        this.timeout(30000);

        // make npm global installations go into a specific directory
        // to avoid messing with a user's actual global npm installations
        process.env.NPM_CONFIG_PREFIX=`${BUILD_DIR}/npm`;
        process.env.PATH=`${process.env.NPM_CONFIG_PREFIX}/bin:${process.env.PATH}`;

        // reset/clear build dir entirely before each run
        rimraf.sync(BUILD_DIR);

        cd(BUILD_DIR);
    });

    it("should install tools and run developer experience", async function() {
        shell(`
            npm install -g @adobe/aio-cli
            aio update --no-confirm
        `);

        cd("project");

        // TODO: get default -y selection to include asset compute worker OR interactive input

        shell(`
            aio app init --no-login -y --asset-compute -i ../../test/console.json
        `);

        assert(fs.existsSync(path.join("actions", "generic", "index.js")));

        // TODO: validate asset compute worker created once available
        // assert(fs.existsSync(path.join("actions", "worker", "index.js")));

        shell(`
            aio app test
        `);
    }).timeout(300000);
});