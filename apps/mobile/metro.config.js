const path = require("path")
const { getDefaultConfig } = require("expo/metro-config")
const { withNativewind } = require("nativewind/metro")

const config = getDefaultConfig(__dirname)

config.resolver.unstable_enablePackageExports = true

const nativewindConfig = withNativewind(config)

// Fix: react-native-css's resolver intercepts `require("react-native")` and
// redirects to its own wrapped components. Those wrappers import "react-native"
// themselves, with a guard (isFromThisModule) to prevent re-interception.
// With pnpm, multiple instances of react-native-css exist in the store, so the
// guard only recognizes its own instance's paths — files from other instances
// get intercepted again, causing infinite recursion.
// Fix: skip interception for ALL react-native-css files regardless of instance.
const rnCssMarker = `${path.sep}react-native-css${path.sep}`
const rnIndexPath = require.resolve("react-native", { paths: [__dirname] })

const nativewindResolveRequest = nativewindConfig.resolver.resolveRequest
if (nativewindResolveRequest) {
	nativewindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
		if (
			moduleName === "react-native" &&
			context.originModulePath.includes(rnCssMarker)
		) {
			return { type: "sourceFile", filePath: rnIndexPath }
		}
		return nativewindResolveRequest(context, moduleName, platform)
	}
}

module.exports = nativewindConfig
