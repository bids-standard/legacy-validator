/** Bundle for browsers */
import { join, fromFileUrl, dirname } from '../deps/path.ts'
import * as esbuild from 'https://deno.land/x/esbuild@v0.15.3/mod.js'

const srcPath = dirname(dirname(fromFileUrl(import.meta.url)))
const entryPointPath = join(srcPath, 'main.ts')
const outdirPath = join(dirname(srcPath), 'dist', 'web')

await esbuild.build({
  entryPoints: [entryPointPath],
  target: ['chrome96', 'firefox103', 'safari15'],
  bundle: true,
  sourcemap: true,
  outdir: outdirPath,
  format: 'esm',
})

// Don't wait for changes
esbuild.stop()
