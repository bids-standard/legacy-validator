#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net --allow-run
/**
 * Build the schema based validator for distribution (web and npm), targets browser compatible ESM
 *
 * If you would like to use this package in a Node.js project, you'll need to use native ESM or a transform system
 */
import * as esbuild from 'https://deno.land/x/esbuild@v0.20.2/mod.js'
import { parse } from 'https://deno.land/std@0.223.0/flags/mod.ts'
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@0.10"
import * as path from "https://deno.land/std@0.223.0/path/mod.ts"
import { getVersion } from './src/version.ts'


function getModuleDir(importMeta: ImportMeta): string {
  return path.resolve(path.dirname(path.fromFileUrl(importMeta.url)));
}

const dir = getModuleDir(import.meta);

const MAIN_ENTRY = path.join(dir, 'src', 'main.ts')
const CLI_ENTRY = path.join(dir, 'src', 'bids-validator.ts')

const flags = parse(Deno.args, {
  boolean: ['minify'],
  default: { minify: false },
})

const version = await getVersion()

let versionPlugin = {
  name: 'version',
  setup(build: esbuild.PluginBuild) {
    build.onResolve({ filter: /\.git-meta\.json/ }, (args) => ({
      path: args.path,
      namespace: 'version-ns',
    }))

    build.onLoad({ filter: /.*/, namespace: 'version-ns' }, () => ({
      contents: JSON.stringify({ description: version }),
      loader: 'json',
    }))
  },
}

const result = await esbuild.build({
  format: 'esm',
  entryPoints: [MAIN_ENTRY, CLI_ENTRY],
  bundle: true,
  outdir: path.join('dist','validator'),
  minify: flags.minify,
  target: ['chrome109', 'firefox109', 'safari16'],
  plugins: [
    versionPlugin,
    ...denoPlugins(),
  ],
  allowOverwrite: true,
  sourcemap: flags.minify ? false : 'inline',
})

if (result.warnings.length > 0) {
  console.warn('Build reported warnings')
  console.dir(result.warnings)
}

if (result.errors.length === 0) {
  Deno.exit(0)
} else {
  console.error(`An issue occurred building '${MAIN_ENTRY}'`)
  console.dir(result.errors)
  Deno.exit(1)
}
