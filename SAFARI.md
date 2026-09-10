# Safari version

Speedadmin Plus uses standard WebExtension files and can be packaged for Safari without changing the extension features.

## Requirements

- A Mac running macOS with Safari and Xcode installed
- An Apple Developer account for App Store distribution
- The source from this repository

## Generate the Safari project

From Terminal on macOS, run the Apple Safari Web Extension packager from the repository root:

```sh
xcrun safari-web-extension-packager . \
  --project-location ./safari-project \
  --app-name "Speedadmin Plus" \
  --bundle-identifier "com.madsenmads.speedadminplus" \
  --macos-only \
  --copy-resources \
  --no-open
```

The packager creates an Xcode project containing a Safari Web Extension and a small containing app. Open the generated `.xcodeproj` in Xcode, select the development team, build, and run it to test in Safari.

## Safari testing

1. Open the generated project in Xcode.
2. Select the containing macOS app scheme.
3. Choose a signing team in the target's **Signing & Capabilities** settings.
4. Build and run the app.
5. Enable **Speedadmin Plus** in Safari's **Settings > Extensions**.
6. Open a SpeedAdmin page and verify week numbers, minute conversion, and the popup enable/disable checkbox.

The Safari packager reports manifest keys that are unsupported by the installed Safari version. Review and test each warning before distribution.

## Distribution

For public distribution, archive the containing app in Xcode and submit it through App Store Connect. Safari web extensions are distributed as part of a macOS or iOS app, not as a standalone Chrome-style ZIP. Apple signing and App Store review are required for public distribution.

The extension's privacy policy is available at:

https://madsenmads.github.io/speedadmin-plus/
