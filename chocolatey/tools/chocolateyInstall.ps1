$packageName = 'Hain'
$installerType = 'exe' # Squirell Installer / Updater
$url32 = 'https://github.com/appetizermonster/hain/releases/download/v0.0.2-rc4/HainSetup-ia32.exe'
$url64 = $url32 # At the moment there is no dedicated 64-bit version
$silentArgs = "" # The installation is silent by default
 
Install-ChocolateyPackage "$packageName" "$installerType" "$silentArgs" "$url32" "$url64"