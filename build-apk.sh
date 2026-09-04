#!/usr/bin/env bash
# Jo-Vegi — build a signed Android APK without Gradle (aapt2 + javac + d8 + apksigner)
set -e
cd "$(dirname "$0")"
SDK=$HOME/android-sdk
BT=$SDK/build-tools/34.0.0
PLATFORM=$SDK/platforms/android-34/android.jar
export JAVA_HOME=${JAVA_HOME:-/usr/lib/jvm/java-21-openjdk-amd64}
JAVAC=$JAVA_HOME/bin/javac
KEYTOOL=$JAVA_HOME/bin/keytool

rm -rf build
mkdir -p build/gen build/obj

echo "→ aapt2 compile"
$BT/aapt2 compile --dir android/res -o build/res.zip

echo "→ aapt2 link"
$BT/aapt2 link -o build/base.apk \
  --manifest android/AndroidManifest.xml \
  -I "$PLATFORM" \
  --java build/gen \
  build/res.zip

echo "→ javac"
$JAVAC --release 11 -classpath "$PLATFORM" -d build/obj \
  build/gen/com/jovegi/app/R.java \
  android/src/com/jovegi/app/MainActivity.java

echo "→ d8"
$BT/d8 --min-api 21 --lib "$PLATFORM" --output build/ $(find build/obj -name '*.class')

echo "→ assemble unsigned"
cp build/base.apk build/unsigned.apk
(cd build && zip -q unsigned.apk classes.dex)

echo "→ zipalign"
$BT/zipalign -f 4 build/unsigned.apk build/aligned.apk

echo "→ keystore"
if [ ! -f jovegi.keystore ]; then
  $KEYTOOL -genkeypair -keystore jovegi.keystore -alias jovegi \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass jovegi123 -keypass jovegi123 \
    -dname "CN=Rayan Nashwan, O=Jo-Vegi, C=JO"
fi

echo "→ apksigner"
$BT/apksigner sign --ks jovegi.keystore --ks-pass pass:jovegi123 \
  --key-pass pass:jovegi123 --out jo-vegi.apk build/aligned.apk

echo "→ verify"
$BT/aapt2 dump badging jo-vegi.apk | grep -E "package:|application-label|sdkVersion|targetSdk" | head -6
echo "APK READY: $(ls -la jo-vegi.apk | awk '{print $5}') bytes"
