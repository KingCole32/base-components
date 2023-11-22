# base-components

This project was created in response to a requirement that a separate project use MD-like components _without_ using Vuetify or MD, then later exported to a separate git repository for personal use. It contains generic, reusable core components (dialog boxes, text fields, buttons, etc.), as well as a fairly comprehensive set of css shortcut styles to allow for quicker project start-up. 

The project itself was not intended to be added as a module as there is some assumption that stylings and defaults will be customized per project, though it can be cloned and launched locally in order to have a playground for editing, customizing, and expanding on the base components as needed. This could change in the future, but likely not in the near future.

**Note-**

While the repository is public and free for public use, credit would be appreciated if any or all of the components are used in a different project. Any comments, bugs, or suggestions are also welcome, as I realize there are still a swath of things to improve and fix.

## Contents

**BaseBox**

Simple content container that provides consistent styling.

**BaseButton**

Button component that accounts for a large variety of common button styling.

**BaseDialog**

Floating container that allows for custom positioning and handles basic dialog behaviors, like hiding the dialog when the background is clicked, or making the dialog persistent.

**BaseIcon**

Shortcut for rendering svg icons and/or applying stylings to allow text characters to be used in the same context that an icon would be, without needing to adjust sizing etc. on a case-by-case basis.

**BaseTable**

One of the most comprehensive components in the project, base table handles any configuration of data, with varying levels of customization, from only passing data to be displayed, to making custom, interactable fields in every field, per data entry. It also contains some basic sorting and search functionality, though the second is especially limited at the moment.

**BaseTextArea**

Text input component specficially focused on accommodating multi-line text input, as well as common stylers for the field itself.

**BaseTextField**

Text input component that supports the common text input types, complete with common stylers for the field itself. Some types, specifically the "date" type, are target for additional custom handling, as the HTML defaults leave much to be desired. 


## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
