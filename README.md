# vscode-react-ui-demo

A simple demo for developing vscode extension UI with webview powered by React.

## Requirements

- Nodejs >= 10.19
- Yarn >= 1.20
- Visual Studio Code >= 1.50

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

# The following is optional
yarn watch:types    # Using `tsc` to check typing and watch file changes.
cd src/react-ui     # In UI sub-project folder,
yarn watch:types    # also used `tsc` to check typing and watch file changes.
```

Then press `F5` in `vscode`, and you will see the demo UI in a new `vscode` window. Edit source code in UI sub-project and see changes!

> Note that sometimes the UI failed to reload correctly. You can reload the webview UI manually by executing vscode command `vscode-react-ui-demo.reload`.

## TODO

- Better CSS support
- Better communication API
- Fix issue of reload

**Enjoy!**
