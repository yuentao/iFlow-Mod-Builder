@echo off
echo Testing environment...
echo.
echo Node version:
node --version
echo.
echo npm version:
npm --version
echo.
echo Rust version:
rustc --version
echo.
echo Cargo version:
cargo --version
echo.
echo Tauri CLI version:
npx @tauri-apps/cli --version
echo.
echo Current directory:
cd
echo.
echo Project files:
dir
