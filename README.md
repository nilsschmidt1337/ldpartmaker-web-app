# LDPartMaker Web-Application

![](https://github.com/nilsschmidt1337/ldpartmaker-web-app/workflows/Node.js%20CI/badge.svg?branch=master)

This project uses [Angular CLI](https://github.com/angular/angular-cli) version 16.1.0. 
Upgrade history : 9.1.7 -> 10.1.2 -> 11.2.19 -> 12.2.18 -> 13.3.10 -> 14.2.12 -> 15.0.2 -> 16.1.0

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.
Run `ng build --configuration production --base-href ./` for a production build.
You can run the production build artifact with *Python 3* by simply doing a `cd ./dist/ldpartmaker-web-app/` and `python -m http.server 4200`.

Or else run `sh build.sh`. It will create a build artifact which can be directly opened in a browser without CORS issues.
`./dist/ldpartmaker-web-app/index.html`

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
