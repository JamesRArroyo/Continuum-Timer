# Continuum Timer

## Supported 3rd Parties

* Gitlab (public or self-hosted)

## Update Settings
  * Firebase Deployement
    * Update Project Name in `.firebaserc`
  * Firebase / API
    * Update the env files in `src/environments/`

## Prerequisites
* Install Node.js® and npm if they are not already on your machine.

* NPM Global Installs
  * Angular/cli - `npm install -g @angular/cli`
  * electron-packager - `npm install -g electron-packager` (I think this needs to be installed globally to generate electron builds)


## Development server

Run `ng serve --port=4300` for a dev server. Navigate to `http://localhost:4300/`. The app will automatically reload if you change any of the source files.

## Run Natively (Electron)

`npm run electron-build`

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

* Angular - Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.
* Native Builds
  * MacOS - `electron-packager . --platform=darwin`
  * Windows - `electron-packager . --platform=win32`

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
