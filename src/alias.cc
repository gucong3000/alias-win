#include <windows.h>
#include <node_api.h>
#include <assert.h>

/**
 * Convert UTF-8 string to Windows UNICODE (UCS-2 LE).
 *
 * Caller must free() the returned string.
 */

static WCHAR* UTF8toWCHAR(
	const char* inputString /** UTF-8 string. */
)
{
	int outputSize;
	WCHAR* outputString;

	// https://docs.microsoft.com/windows/desktop/api/stringapiset/nf-stringapiset-multibytetowidechar
	outputSize = MultiByteToWideChar(CP_UTF8, 0, inputString, -1, NULL, 0);

	if (outputSize == 0) {
		return NULL;
	}

	outputString = (WCHAR*) malloc(outputSize * sizeof(WCHAR));

	if (outputString == NULL) {
		SetLastError(ERROR_OUTOFMEMORY);
		return NULL;
	}

	if (MultiByteToWideChar(CP_UTF8, 0, inputString, -1, outputString, outputSize) != outputSize) {
		free(outputString);
		return NULL;
	}

	return outputString;
}

static WCHAR* VALUEtoWCHAR(
	napi_env env,
	napi_value arg
) {
	napi_status status;

	// Extract the length of the first string.
	size_t exeNameLength;
	status = napi_get_value_string_utf8(env, arg, nullptr, 0, &exeNameLength);
	assert(status == napi_ok);

	char* exeName = new char[exeNameLength + 1];

	// Extract the value of the first string
	status = napi_get_value_string_utf8(env, arg, exeName, exeNameLength + 1, 0);
	assert(status == napi_ok);

	return UTF8toWCHAR(exeName);
}

napi_value Get(
	napi_env env,
	napi_callback_info info
) {
	napi_status status;
	size_t argc = 1;
	napi_value argv[1];

	status = napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);
	assert(status == napi_ok);

	if (argc < 1) {
		napi_throw_type_error(env, nullptr, "Wrong number of arguments");
		return nullptr;
	}

	WCHAR* exeName = VALUEtoWCHAR(env, argv[0]);

	// https://docs.microsoft.com/windows/console/getconsolealiaseslength
	int buffer_size = GetConsoleAliasesLengthW(exeName);

	WCHAR* wAliases = (WCHAR*) malloc(buffer_size);

	// https://docs.microsoft.com/windows/console/getconsolealiases
	if (GetConsoleAliasesW(wAliases, buffer_size, exeName) == 0) {
		return nullptr;
	}

	napi_value aliases;
	status = napi_create_string_utf16(env, (const char16_t *) wAliases, (buffer_size / sizeof(WCHAR)), &aliases);
	assert(status == napi_ok);

	return aliases;
}

napi_value SetAlias(
	napi_env env,
	napi_callback_info info
) {
	napi_status status;
	size_t argc = 3;
	napi_value argv[3];

	status = napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);
	assert(status == napi_ok);

	if (argc < 3) {
		napi_throw_type_error(env, nullptr, "Wrong number of arguments");
		return nullptr;
	}

	napi_valuetype valuetype;
	status = napi_typeof(env, argv[1], &valuetype);
	assert(status == napi_ok);

	// https://docs.microsoft.com/windows/console/addconsolealias
	bool result = AddConsoleAliasW(
		VALUEtoWCHAR(env, argv[0]),
		(valuetype == napi_null || valuetype == napi_undefined) ? nullptr : VALUEtoWCHAR(env, argv[1]),
		VALUEtoWCHAR(env, argv[2])
	);

	napi_value napiResult;
	status = napi_get_boolean(env, result, &napiResult);
	assert(status == napi_ok);
	return napiResult;
}

#define DECLARE_NAPI_METHOD(name, func)	{ name, 0, func, 0, 0, 0, (napi_property_attributes) (napi_configurable | napi_enumerable | napi_writable), 0 }

napi_value Init(napi_env env, napi_value exports) {
	napi_status status;
	napi_property_descriptor properties[] = {
		DECLARE_NAPI_METHOD("get", Get),
		DECLARE_NAPI_METHOD("setAlias", SetAlias),
	};
	status = napi_define_properties(env, exports, 2, properties);
	assert(status == napi_ok);
	return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
