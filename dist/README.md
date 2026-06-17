# Trak-iT ReactJS Controls

This library contains ReactJS controls, hooks, and contexts to assist in working with Trak-iT's APIs. Other Trak-iT API libraries are available on GitHub. https://github.com/trakitwireless

### Prerequisites

The `@trakit/objects`, `@trakit/commands` and `@trakit/sync` packages are required since they contain the definitions for all the commands required to manipulate the objects.

In order to build this project, you need to install the ReactJS types, RollupJS, and plugins for TypeScript and Minifying.
```
npm i @types/react rollup rollup-plugin-typescript2 @rollup/plugin-terser
```
After those have been installed, build the project normally.
```
rollup --config rollup.config.js
```

### `useConnection` hook

Used as the main hook for keeping a persistent connection.

### `useSync` hook

Used to synchronize the specified type(s) of objects with the system.  Internally, this hook uses `useConnection`.

## Questions and Feedback

If you have any questions, please start for the project on GitHub
https://github.com/trakitwireless/trakit-ts-react/issues
