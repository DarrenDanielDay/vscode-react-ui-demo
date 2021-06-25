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

In the opened `vscode` window, open the integrated terminal and run the following to build and develop the react UI:

```sh
# In the integrated terminal of vscode window
yarn                # Install all dependencies for extension (as well as dependencies of UI sub-project).

# The following is optional for development
yarn watch:types    # Using `tsc` to check typing and watch file changes.
cd src/react-ui     # In UI sub-project folder,
yarn watch:types    # also used `tsc` to check typing and watch file changes.
```

Then press `F5` in `vscode`, and you will see the demo UI in a new `vscode` window. It may a little bit slow for the first time, but fast from then on.

You can edit source code in UI sub-project and see changes!

> Note that sometimes the UI failed to reload correctly. You can reload the webview UI manually by executing vscode command `vscode-react-ui-demo.reload`.

## Build vsix

Just one command in the root folder to make a production build:

```sh
yarn bundle
```

> To minify the bundle, this command includes `git clean -xdf` to remove files excluded by `.gitignore`. **TAKE CARE** to run this command if you have **UNTRACKED FILES**!!!

## How it works

Used [`esbuild`](https://esbuild.github.io/) for compiling [`typescript`](https://www.typescriptlang.org/) extension source code.

Picked [`react`](https://reactjs.org/) as the main idea for webview UI.

Picked [`material-ui`](https://material-ui.com/) as the UI library for demo.

Used [`snowpack`](https://www.snowpack.dev/) and its `react-refresh` plugin for better development experience.

## TODO

- Fix issue of reload: possibly an issue of `react-refresh`.

**Enjoy!**
