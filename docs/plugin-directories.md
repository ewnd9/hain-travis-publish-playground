# Plugin Directories

There are two plugin directories for Hain:

`MAIN_PLUGIN_REPO`: "`${process.env.LOCALAPPDATA}/hain/plugins`"  
`DEV_PLUGIN_REPO`: "`${process.env.LOCALAPPDATA}/hain/devplugins`"  

(e.g. C:\\Users\\John\\AppData\\Local\\hain\\...)

`MAIN_PLUGIN_REPO` is managed by hpm(hain-package-manager). so it's not safe to develop plugins.  
so, you should place your plugins to `DEV_PLUGIN_REPO` for the development.