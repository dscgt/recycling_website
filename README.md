# Admin Website

Management and data viewing portal for recycling department administrators.

This is part of a suite of apps made for Georgia Tech's [OSWM&R](http://www.recycle.gatech.edu/), which also includes:
* [route-recorder](https://github.com/dscgt/route_recorder): Buddy app for recycling department crewmembers working recycling routes
* [recycling-checkin](https://github.com/dscgt/recycling_checkin): Daily check-out/check-in for recycling department crewmembers needing GT property

## Prerequisites for developers

* latest stable version of [Node](https://nodejs.org/en/)
* latest stable version of NPM (usually included with the Node installation)
* the [Firebase CLI](https://firebase.google.com/docs/cli)
* the [Angular CLI](https://cli.angular.io/)
* access to our Firebase console
* read/write access to this Github repo
* read/write access to our [private Github repo](https://github.gatech.edu/dscgt/recycling_website_dist)

## Getting your credentials

Until you add credentials, the project will not run, and there will be an error about missing imports. Credentials are required for both development and deployment.

1. Go to our [Firebase console](https://console.firebase.google.com/u/0/project/gt-recycling/settings/general/)
1. Retrieve the code for the Firebase config object (Your Apps -> Web apps -> Admin website -> Firebase SDK Snippet -> Config)
1. Make a new file called `firebase.ts` and place it in the `src/environments` directory, and export this object as default
   1. A template, `src/environments/firebase-template.ts`, is provided as a reference for this step.

It is [not necessary](https://firebase.google.com/docs/projects/api-keys) to secure Firebase API keys like this, but we do so as an extra layer of security. 

## Running this code

After getting your credentials (see section above), this code can be run locally for development:

1. In a CLI, install dependencies with `npm i`
1. Start a local instance with `npm start`
1. In a web browser, navigate to `localhost:4200` to browse the local instance

## Deploying this code

### To deploy to private instance:

This uses [Angular's Github Pages deploy](https://npmjs.org/package/angular-cli-ghpages) tool.

1. Run `ng deploy --base-href=/pages/dscgt/recycling_website_dist/ --repo=https://github.gatech.edu/dscgt/recycling_website_dist.git --branch=master --name="your_gatech_display_name_here" --email="your_gatech_email_here"`
  1. Build is part of deploy process; no need to build beforehand.
1. View our deploy [here](https://github.gatech.edu/pages/dscgt/recycling_website_dist/).

### To deploy to public website (LEGACY):

We use `@angular/fire`'s [deploy process](https://github.com/angular/angularfire/blob/HEAD/docs/deploy/getting-started.md).

1. In `angular.json`, replace the line `"builder": "@angular/fire:deploy",` with `"builder": "angular-cli-ghpages:deploy",`
1. If you haven't already, log in to your Firebase account with the Firebase CLI: `firebase login`
1. Select the `gt-recycling` project
1. Deploy the app with `ng run recycling-frontend:deploy`
  1. Build is part of deploy process; no need to build beforehand.

## About
Made by the [Developer Student Club at Georgia Tech](https://dscgt.club/). 

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.3.

## Other Commands

### Deploy Firebase functions
```
firebase deploy --only functions:functionname1,functions:functionname2
```

For example, `firebase deploy --only functions:generateExcelSheet` will deploy only the generateExcelSheet() function. 

More information:
https://firebase.google.com/docs/functions/manage-functions#deploy_functions
https://firebase.google.com/docs/cli#deploy_specific_functions

### Start Firebase emulators (Functions, Firestore, Hosting).
Due to how the project is set up, the emulated website (Hosting) will use the production Firestore instance, but emulated Functions will use the emulated Firestore instance.

1. If you haven't already, log in to your Firebase account with the Firebase CLI: `firebase login`
2. `firebase emulators:start`

More information:
https://firebase.google.com/docs/emulator-suite

### Build the webapp
```
npm run build
```
Built files will be placed in a `/dist` directory.
If building for production, use the `--prod` flag:
```
npm run build --prod
```
