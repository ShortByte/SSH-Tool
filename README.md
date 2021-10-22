# SSH-Tool 
[![Github All Releases](https://img.shields.io/github/downloads/ShortByte/SSH-Tool/total.svg?style=for-the-badge&logo=appveyor)]() [![Github Release Version](https://img.shields.io/github/v/release/ShortByte/SSH-Tool?style=for-the-badge&logo=appveyor)]()
<a href="https://www.buymeacoffee.com/ShortByte" title="Donate to this project using Buy Me A Coffee"><img src="https://img.shields.io/badge/buy%20me%20a%20coffee-donate-orange.svg?style=for-the-badge" alt="Buy Me A Coffee donate button" /></a>


<a href="https://twitter.com/ShortByteYT" title="My Twitter"><img src="https://img.shields.io/twitter/follow/ShortByteYT?style=for-the-badge" alt="My Twitter" /></a>
<a href="https://twitch.tv/ShortByte" title="My Twitch"><img src="https://img.shields.io/twitch/status/ShortByte?style=for-the-badge" alt="My Twitch" /></a>
<a href="https://discord.gg/Kc7m3Ug" title="My Discord Server"><img src="https://img.shields.io/discord/325738511363866626?label=Discord&style=for-the-badge" alt="My Discord Server" /></a>

# Introduction

This tool is a small program to open SSH connections in the Windows terminal with a single click.

# Development

Bootstrap and package your project with Angular 10 and Electron 9 (Typescript + SASS + Hot Reload) for creating Desktop applications.

Currently runs with:

- Angular v10.0.14
- Electron v9.3.0
- Electron Builder v22.8.0

/!\ Hot reload only pertains to the renderer process. The main electron process is not able to be hot reloaded, only restarted.

/!\ Angular 10.x CLI needs Node 10.13 or later to work correctly.

## Getting Started

Clone this repository locally :

``` bash
git clone https://github.com/ShortByte/SSH-Tool.git
```

Install dependencies with npm :

``` bash
npm install
```

There is an issue with `yarn` and `node_modules` when the application is built by the packager. Please use `npm` as dependencies manager.


If you want to generate Angular components with Angular-cli , you **MUST** install `@angular/cli` in npm global context.
Please follow [Angular-cli documentation](https://github.com/angular/angular-cli) if you had installed a previous version of `angular-cli`.

``` bash
npm install -g @angular/cli
```

## To build for development

- **in a terminal window** -> npm start
lorem

The application code is managed by `main.ts`. In this sample, the app runs with a simple Angular App (http://localhost:4200) and an Electron window.
The Angular component contains an example of Electron and NodeJS native lib import.
You can disable "Developer Tools" by commenting `win.webContents.openDevTools();` in `main.ts`.

## Use Electron / NodeJS / 3rd party libraries

As see in previous chapter, this sample project runs on both mode (web and electron). To make this happens, **you have to import your dependencies the right way**. Please check `providers/electron.service.ts` to watch how conditional import of libraries has to be done when using electron / NodeJS / 3rd party librairies in renderer context (ie. Angular).

## Browser mode

Maybe you only want to execute the application in the browser with hot reload ? Just run `npm run ng:serve:web`.

## Included Commands

|Command|Description|
|--|--|
|`npm run ng:serve`| Execute the app in the browser |
|`npm run build`| Build the app. Your built files are in the /dist folder. |
|`npm run build:prod`| Build the app with Angular aot. Your built files are in the /dist folder. |
|`npm run electron:local`| Builds your application and start electron
|`npm run electron:build`| Builds your application and creates an app consumable based on your operating system |

**Your application is optimised. Only /dist folder and node dependencies are included in the executable.**

## You want to use a specific lib (like rxjs) in electron main thread ?

YES! You can do it! Just by importing your library in npm dependencies section (not **devDependencies**) with `npm install --save`. It will be loaded by electron during build phase and added to your final package. Then use your library by importing it in `main.ts` file. Quite simple, isn't it ?

## E2E Testing

E2E Test scripts can be found in `e2e` folder.

|Command|Description|
|--|--|
|`npm run e2e`| Execute end to end tests |

Note: To make it work behind a proxy, you can add this proxy exception in your terminal  
`export {no_proxy,NO_PROXY}="127.0.0.1,localhost"`

## 📷 Images
![Dashboard](https://i.imgur.com/Qd3NdQv.png)


## 👀 Download?
You want to download it? Click [here](https://github.com/ShortByte/SSH-Tool/releases/latest) for the latest release!


## 🤝 Contributing

Contributions, issues and feature requests are welcome.<br />
Feel free to check [issues page](https://github.com/ShortByte/SSH-Tool/issues) if you want to contribute.<br />


## 🙏 Support

<p><a href="https://www.buymeacoffee.com/ShortByte"> <img  src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="50" width="210" alt="ShortByte" /></a></p>

## 📝 License

Copyright © 2021 [Leon Enneken](https://github.com/ShortByte).<br />
This project is GPL-2.0 licensed.

---

Developed with ❤️ by Enneken Solutions in Cologne!
