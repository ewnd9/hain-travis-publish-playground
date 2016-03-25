$packageName = 'Hain'
$installerType = 'exe'
$url32 = 'https://github.com/appetizermonster/hain/releases/download/v0.0.2-rc4/HainSetup-ia32.exe'
 
Install-ChocolateyPackage "$packageName" "$installerType" "$url32"