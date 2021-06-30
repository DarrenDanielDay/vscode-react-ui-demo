# vscode-react-ui-demo

A simple demo for developing vscode extension UI with webview powered by React.

## Requirements

- [`Nodejs`](https://nodejs.org/) >= 14.15, higher versions are recommended.
- [`Yarn`](https://yarnpkg.org) >= 1.20, < 2.0
- [`Visual Studio Code`](https://code.visualstudio.com) >= 1.55, older versions may have issue of icons.

## Quick Start

Suppose you have added command `code` to your `PATH` environment variables.

If you have not added it, you can follow this guide: <https://code.visualstudio.com/docs/editor/command-line#_common-questions>

First, clone this project and open this folder with `vscode`:

```sh
git clone https://github.com/DarrenDanielDay/vscode-react-ui-demo.git
code vscode-react-ui-demo           # This command opens a `vscode` window.
```

If you want to see the minimum example, you can switch to branch [`minimum-example`](https://github.com/DarrenDanielDay/vscode-react-ui-demo/tree/minimum-example).

In the opened `vscode` window, press `F5`. Just one click for all, and you will see the demo UI in a new `vscode` window. It may a little bit slow for the first time, but fast from then on.

You can edit source code in UI sub-project and see changes!

> Note that sometimes the UI failed to reload correctly. You can reload the webview UI manually by executing vscode command `vscode-react-ui-demo.reload`.

## Build vsix

Just one command in the root folder to make a production build:

```sh
yarn bundle
```

## How it works

Used [`esbuild`](https://esbuild.github.io/) for compiling [`typescript`](https://www.typescriptlang.org/) extension source code.

Picked [`react`](https://reactjs.org/) as the main idea for webview UI.

Picked [`material-ui`](https://material-ui.com/) as the UI library for demo.

Used [`snowpack`](https://www.snowpack.dev/) and its `react-refresh` plugin for better development experience.

## TODO

- Fix issue of reload: possibly an issue of `react-refresh`.

**Enjoy!**
