export interface Version {
  readonly version: string | null

  readonly branch: string | null

  readonly commit: string | null

  readonly buildTime: string | null
}

export const VERSION: Version = {
  version: process.env['APP_VERSION'] ? process.env['APP_VERSION'] : null,

  branch: process.env['APP_SOURCE_BRANCH'] ? process.env['APP_SOURCE_BRANCH'] : null,

  commit: process.env['APP_SOURCE_COMMIT'] ? process.env['APP_SOURCE_COMMIT'] : null,

  buildTime: process.env['APP_BUILD_TIME'] ? process.env['APP_BUILD_TIME'] : null
}

export function versionInfo(): string {
  const { version, branch, commit, buildTime }: Version = VERSION
  let buildInfo: string = branch || commit || buildTime ? 'built ' : ''
  if (branch || commit) {
    buildInfo = `from ${branch ?? 'commit'} ${commit ? `(${commit})` : ''}`
  }
  if (buildTime) {
    buildInfo += `at ${buildTime}`
  }
  return `Running version: ${version ?? '<unknown>'} ${buildInfo}`.trim()
}
