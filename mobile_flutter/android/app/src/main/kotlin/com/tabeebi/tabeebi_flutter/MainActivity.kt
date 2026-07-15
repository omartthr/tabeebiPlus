package com.tabeebi.tabeebi_flutter

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            "tabeebi/session_store"
        ).setMethodCallHandler { call, result ->
            val preferences = getSharedPreferences("tabeebi_session", MODE_PRIVATE)
            val key = call.argument<String>("key")

            if (key.isNullOrBlank()) {
                result.error("missing_key", "Session key is required.", null)
                return@setMethodCallHandler
            }

            when (call.method) {
                "getString" -> result.success(preferences.getString(key, null))
                "setString" -> {
                    val value = call.argument<String>("value")
                    if (value == null) {
                        result.error("missing_value", "Session value is required.", null)
                        return@setMethodCallHandler
                    }
                    preferences.edit().putString(key, value).apply()
                    result.success(null)
                }
                "remove" -> {
                    preferences.edit().remove(key).apply()
                    result.success(null)
                }
                else -> result.notImplemented()
            }
        }
    }
}
