import { createRequire } from "node:module"
import path from "node:path"
import { DEV_API_URL } from "@batchmate/api-client"
import tailwindcss from "@tailwindcss/vite"
import tanstackRouter from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, transformWithEsbuild } from "vite"
import { VitePWA } from "vite-plugin-pwa"

const require = createRequire(import.meta.url)

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		// @rn-primitives ships JSX in .mjs — transform for Rollup builds
		// https://github.com/roninoss/rn-primitives/issues/39
		{
			name: "rn-primitives-jsx",
			async transform(code, id) {
				if (id.includes("@rn-primitives") && /\.m?js$/.test(id)) {
					return transformWithEsbuild(code, id, { loader: "jsx" })
				}
			},
		},
		// Patch react-native-css's web useCssElement to pass className directly
		// instead of using $$css (which RNW doesn't support).
		{
			name: "rnw-css-interop",
			enforce: "pre",
			transform(code, id) {
				if (id.includes("react-native-css") && id.includes("web/api")) {
					return code.replace(
						/export const useCssElement[\s\S]*?return[\s\S]*?createElement\(component, props\);?\s*\};/,
						`export const useCssElement = (component, incomingProps, mapping) => {
  let props = { ...incomingProps };
  let classNames = [];
  for (const [key, value] of Object.entries(mapping)) {
    const source = props[key];
    if (!source) continue;
    delete props[key];
    classNames.push(source);
  }
  if (classNames.length > 0) {
    props.className = classNames.join(" ");
  }
  return createElement(component, props);
};`,
					)
				}
			},
		},
		// Add className to RNW's forwarded props so it passes through to DOM
		{
			name: "rnw-forward-classname",
			enforce: "pre",
			transform(code, id) {
				if (
					id.includes("react-native-web") &&
					id.includes("forwardedProps") &&
					id.endsWith("index.js")
				) {
					return code.replace("style: true", "style: true,\n  className: true")
				}
				// Patch createDOMProps to merge incoming className with generated one
				if (
					id.includes("react-native-web") &&
					id.includes("createDOMProps") &&
					id.endsWith("index.js")
				) {
					return code.replace(
						"if (className) {\n    domProps.className = className;\n  }",
						"if (className || props.className) {\n    domProps.className = [className, props.className].filter(Boolean).join(' ');\n  }",
					)
				}
			},
		},
		tanstackRouter({ quoteStyle: "double" }),
		react({
			babel: {
				plugins: [
					["babel-plugin-react-compiler"],
					// NativeWind v5: rewrite react-native imports to react-native-css/components
					path.join(
						path.dirname(require.resolve("react-native-css/package.json")),
						"dist/commonjs/babel/import-plugin.js",
					),
				],
			},
		}),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.png", "apple-touch-icon.png"],
			manifest: {
				name: "batchmate",
				short_name: "batchmate",
				description: "batchmate",
				theme_color: "#0a0f1c",
				background_color: "#0a0f1c",
				display: "standalone",
				icons: [
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			"react-native": "react-native-web",
			"lucide-react-native": "lucide-react",
			"@": path.resolve(__dirname, "./src"),
		},
	},
	optimizeDeps: {
		exclude: ["react-native-web", "react-native-css"],
		esbuildOptions: {
			loader: { ".mjs": "jsx" },
		},
	},
	server: {
		proxy: {
			"/api/v1": DEV_API_URL,
		},
	},
})
