import gitmeta from './.git-meta.json' with { type: 'json' }
import { dirname } from './deps/path.ts'

/**
 * Determine the version of the currently running script.
 *
 * The version is determined by the following rules:
 *
 * 1. Search for a hard-coded version populated by git-archive or the build.
 * 2. If the script is running from a local file, the version is determined by
 *    the output of `git describe --tags --always` in the script's directory.
 * 3. If the script is running from a remote URL, the version is determined by
 *    the path of the URL. In case of GitHub, the version can be any git ref.
 *    In the case of deno.land, the tag name should be available and will be parsed.
 *
 * If no version can be determined, the URL of the script is returned.
 *
 * @returns The version of the script.
 *
 */
export async function getVersion(): Promise<string> {
  // Hard-coded JSON wins
  let version = getArchiveVersion()
  if (version) { return version }

  const url = new URL(Deno.mainModule)
  if (url.protocol === 'file:') {
    version = await getLocalVersion(dirname(url.pathname))
    if (version) { return version }
  } else if (url.protocol === 'https:' || url.protocol === 'http:') {
    version = getRemoteVersion(url)
    if (version) { return version }
  }
  return url.href
}

async function getLocalVersion(path: string): Promise<string> {
  const p = Deno.run({
    // safe.directory setting so we could still operate from another user
    cmd: ['git', '-C', path, '-c', 'safe.directory=*', 'describe', '--tags', '--always'],
    stdout: 'piped',
  })
  const description = new TextDecoder().decode(await p.output()).trim()
  p.close()
  return description
}

function getRemoteVersion(url: URL): string | undefined {
  if (url.hostname === 'deno.land') {
    // https://deno.land/x/bids-validator@<ver>/bids-validator.ts
    return url.pathname.split('@')[1].split('/')[0]
  } else if (url.hostname === 'raw.githubusercontent.com') {
    // https://raw.githubusercontent.com/<org>/bids-validator/<ver>/bids-validator/src/bids-validator.ts
    return url.pathname.split('/bids-validator/')[1]
  }
  return undefined
}

function getArchiveVersion(): string | undefined {
  if (!gitmeta.description.startsWith('$Format:')) {
    return gitmeta.description
  }
  return undefined
}
