# Admin Website

Management and data viewing portal for recycling department administrators.

This is part of a suite of apps made for Georgia Tech's [OSWM&R](http://www.recycle.gatech.edu/), which also includes:
* [route-recorder](https://github.com/dscgt/route_recorder): Buddy app for recycling department crewmembers working recycling routes
* [recycling-checkin](https://github.com/dscgt/recycling_checkin): Daily check-out/check-in for recycling department crewmembers needing GT property

## For Developers

### Prerequisites

* latest stable version of [Node](https://nodejs.org/en/)
* latest stable version of NPM (usually included with the Node installation)
* the [Firebase CLI](https://firebase.google.com/docs/cli)
* the [Angular CLI](https://cli.angular.io/)
* access to our Firebase console
* read/write access to this Github repo
* read/write access to our [private Github repo](https://github.gatech.edu/dscgt/recycling_website_dist)
* credentials (see below)

### Getting your credentials

Until you add credentials, the project will not run, and there will be an error about missing imports. Credentials are required for both development and deployment.

1. Go to our [Firebase console settings](https://console.firebase.google.com/u/0/project/gt-recycling/settings/general/)
1. Retrieve the code for the Firebase config object (Your Apps -> Web apps -> Admin website -> Firebase SDK Snippet -> Config)
1. Make a new file called `firebase.ts` and place it in the `src/environments` directory, and export the Firebase config object as `default`
   1. A template, `src/environments/firebase-template.ts`, is provided as a reference for this step. This file doesn't do anything else.

It is [not necessary to secure Firebase API keys](https://firebase.google.com/docs/projects/api-keys) like this, but we do so as an extra layer of security. 

### Running this code

This project uses Firebase services: Authentication, Firestore, and Functions. 

To run locally for development:

1. In a CLI, install dependencies with `npm i`
   1. Also navigate to the `functions` folder to install Firebase functions dependencies: `cd functions`, `npm i`
1. Go back to the project root directory and run `npm start`
   1. This will start a local development instance. In a web browser, navigate to http://localhost:4200/ to view
   1. This also starts the [Firebase emulators](https://firebase.google.com/docs/emulator-suite). The website mostly uses emulated resources during development instead of production data.
      1. Firestore and Functions are emulated. Authentication uses production auth data, and is not emulated due to lack of need. 
      1. Firestore Rules are not emulated, so be mindful when testing new changes.
      1. If you need the emulated database to contain record data, there are two Functions endpoints (`seedRouteRecords` and `seedCheckinRecords`) to help you by seeding some data.
      2. A Firebase Hosting version of our website is emulated, at http://localhost:5000/. It may behave unexpectedly, so use the 4200 website instead. For some reason, this can't be shut this off, but we can just ignore it.

### Deploying this code

#### To deploy the website

This uses [Angular's Github Pages deploy](https://npmjs.org/package/angular-cli-ghpages) tool, and deploys built files to a private Github Pages instance.

1. Run `ng deploy --base-href=/pages/dscgt/recycling_website_dist/ --repo=https://github.gatech.edu/dscgt/recycling_website_dist.git --branch=master --name="your_gatech_display_name_here" --email="your_gatech_email_here"`
1. View our deploy [here](https://github.gatech.edu/pages/dscgt/recycling_website_dist/).

There is no need to build beforehand, this is done automatically.

#### To deploy Firebase functions
```
firebase deploy --only functions:functionname1,functions:functionname2
```

For example, `firebase deploy --only functions:generateExcelSheet` will deploy only the generateExcelSheet() endpoint. 

More information: \
https://firebase.google.com/docs/functions/manage-functions#deploy_functions \
https://firebase.google.com/docs/cli#deploy_specific_functions

### Building this code

You shouldn't have to do this that often (or at all), since both running for development and deploying to production build automatically.

Building for production:

```
npm run build-prod
```

Building for development:
```
npm run build
```

Built files are placed in a `/dist` directory.

## About

Made by the [Developer Student Club at Georgia Tech](https://dscgt.club/). 
