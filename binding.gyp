{
	# NOTE: 'module_name' and 'module_path' come from the 'binary' property in package.json
	# node-pre-gyp handles passing them down to node-gyp when you build from source
	"defines": [
		"NAPI_VERSION=<(napi_build_version)"
	],
	"targets": [
		{
			"target_name": "<(module_name)",
			"sources": [
				"src/alias.cc"
			],
			"product_dir": "<(module_path)",
		}
	]
}
