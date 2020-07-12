# RecyclingFrontend

Management and data viewing portal for recycling department administrators.

This is part of a suite of apps made for Georgia Tech's [OSWM&R](http://www.recycle.gatech.edu/), which also includes:
* [route-recorder](https://github.com/dscgt/route_recorder): Buddy app for recycling department crewmembers working recycling routes
* [recycling-checkin](https://github.com/dscgt/recycling_checkin): Daily check-out/check-in for recycling department crewmembers needing GT property

## Running this code

This code's master is currently deployed [here](https://route-recorder-de136.web.app/). For development, this code can be run locally:

1. Fork this branch and clone your fork to your local machine
1. In a CLI, navigate to the project and install dependencies with `npm i`
1. Start a local instance with `npm run serve`
1. In a web browser, navigate to `localhost:4200` to browse the local instance

## About
Made by the [Developer Student Club at Georgia Tech](https://dsc.gt/). 

---

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.3.

## VSCode Extensions

- Angular Snippets (Version 9)
- EditorConfig for VS Code
- Font Switcher
  - used to switch to Source Code Pro
- Jasmine code snippets
- One Dark Pro
- Vim
  - disable CTRL keys
- vscode-icons

## Commands

Send to Firebase Hosting:

```
ng run recycling-frontend:deploy
```

## Temporary developer notes
- within src/app/: app.routes.ts lazy-loads routes that correspond to route recorder (modules/routes/routes.module.ts) and routes that correspond to recycling checkin (modules/routes/checkin.routes.ts). Seems to be a nesting thing ex. all the route recorder routes happen under /routes, which is defined in app.routes.ts
- src/app/core handles the modules: home page, 404 page, the sidebar ('navigation'), and top-level UI (components/app). Meanwhile src/app/modules handles everything else; a mix of frontend modules and backend services
- actually, navigation in src/app/core seems to handle the navigation view, but it gets its information from modules/navigation which seems to act as its "backend"
- module pages (ex. src/app/modules/routes/pages/route-groups/...) access Firebase by calling backend services (ex. src/app/modules/backend/services/interfaces/...). But these are interfaces and abstract classes w/o implementation...these are nevertheless able to return fully implemented versions of themselves with the useFactory property of the @Injectable annotation's param. Something to do with this: https://angular.io/guide/dependency-injection-providers. This way they reference the fully implemented versions located at app/modules/backend/services/implementations/firebase/...
- firebase is initialized in app.module.ts. From here, need to figure out how to initialize 2 apps.
https://github.com/angular/angularfire/blob/master/docs/install-and-setup.md -- initializing one app
https://github.com/angular/angularfire/issues/1240 -- links to initialize 2 apps
- NEW PLAN: rip out "backend-web.service.ts" crap and use implementations directly. Rely completely on the provider method that you saw.