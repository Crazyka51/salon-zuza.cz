// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require("expo/metro-config")

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

// Some legacy packages (e.g. react-native's internal `rn-get-polyfills` used for
// web builds) don't declare a compliant `exports` field, which trips up Metro's
// newer package.json `exports` resolution and fails web bundling.
config.resolver.unstable_enablePackageExports = false

module.exports = config
