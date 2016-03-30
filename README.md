# Hain
[![Build status](https://ci.appveyor.com/api/projects/status/l4p8r613wckaiqm6?svg=true)](https://ci.appveyor.com/project/appetizermonster/hain)
[![Join the chat at https://gitter.im/appetizermonster/hain](https://badges.gitter.im/appetizermonster/hain.svg)](https://gitter.im/appetizermonster/hain?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

An `alt+space` launcher for Windows, built with Electron.

I always dreamed an alternative to Alfred on Windows, that is made with JavaScript.
so, I made it.

<p align="center">
  <img src="docs/demo.gif" width="700"/>
</p>

## Features

* Searching Executable files very fast with Fuzzy Matching
* Plugins in Pure JavaScript

## Downloads

Go to [Releases](https://github.com/appetizermonster/Hain/releases), then you can download prebuilt binaries.

Alternatively, you can install Hain from the command prompt via [Chocolatey](https://chocolatey.org/packages/Hain):

```ps
cinst Hain -pre
```

## Usage
Run and press `alt+space` anywhere

## How to make Plugins

See [Plugin Documentation](docs/plugin-docs.md)

## Install/Build from source

```shell
# Clone this repo
git clone https://github.com/appetizermonster/hain.git
# Go into the repo
cd hain
# Install dependencies
npm install
npm install -g --arch=ia32 electron-prebuilt
```

>**Note:** this project uses Electron 32bit version

### Run from source

```shell
npm run dev
```

### Build from source

```shell
npm run build
```

## Contributing
Feel free to send any pull request to `develop` branch!

## Credits
The name "Hain" is named by Hyunseop Lee, it means "a Servant" in Korean.  
The app icon & gif are designed by Yunsung Lee.  
It uses [npmsearch.com](https://github.com/solids/npmsearch) for searching modules for now  

## License
MIT
