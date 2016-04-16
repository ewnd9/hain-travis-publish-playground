$packageName = 'Hain'
$installerType = 'exe' # Squirrel Installer / Updater
$url64 = 'https://github.com/appetizermonster/hain/releases/download/v0.1.0/HainSetup-x64-v0.1.0.exe'
$url32 = $url64
$silentArgs = "" # The installation is silent by default
 
Install-ChocolateyPackage "$packageName" "$installerType" "$silentArgs" "$url32" "$url64"