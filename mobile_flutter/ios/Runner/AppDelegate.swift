import Flutter
import UIKit

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)
    registerSessionStoreChannel(engineBridge)
  }

  private func registerSessionStoreChannel(_ engineBridge: FlutterImplicitEngineBridge) {
    let registrar = engineBridge.pluginRegistry.registrar(forPlugin: "TabeebiSessionStore")
    let channel = FlutterMethodChannel(
      name: "tabeebi/session_store",
      binaryMessenger: registrar.messenger()
    )

    channel.setMethodCallHandler { call, result in
      guard
        let args = call.arguments as? [String: Any],
        let key = args["key"] as? String,
        !key.isEmpty
      else {
        result(
          FlutterError(
            code: "missing_key",
            message: "Session key is required.",
            details: nil
          )
        )
        return
      }

      let defaults = UserDefaults.standard
      switch call.method {
      case "getString":
        result(defaults.string(forKey: key))
      case "setString":
        guard let value = args["value"] as? String else {
          result(
            FlutterError(
              code: "missing_value",
              message: "Session value is required.",
              details: nil
            )
          )
          return
        }
        defaults.set(value, forKey: key)
        result(nil)
      case "remove":
        defaults.removeObject(forKey: key)
        result(nil)
      default:
        result(FlutterMethodNotImplemented)
      }
    }
  }
}
