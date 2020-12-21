# Admin Website

Management and data viewing portal for recycling department administrators.

This is part of a suite of apps made for Georgia Tech's [OSWM&R](http://www.recycle.gatech.edu/), which also includes:
* [route-recorder](https://github.com/dscgt/route_recorder): Buddy app for recycling department crewmembers working recycling routes
* [recycling-checkin](https://github.com/dscgt/recycling_checkin): Daily check-out/check-in for recycling department crewmembers needing GT property

## Getting your credentials

Until you add credentials, the project will not run, and there will be an error about missing imports. Credentials are required for both development and deployment.

1. Go to our [Firebase console](https://console.firebase.google.com/u/0/project/gt-recycling/settings/general/)
1. Retrieve the code for the Firebase config object (Your Apps -> Web apps -> Admin website -> Firebase SDK Snippet -> Config)
1. Make a new file called `firebase.ts` and place it in the `src/environments` directory, and export this object as default
  1. A template, `src/environments/firebase-template.ts`, is provided as a reference for this step

It is [not necessary](https://firebase.google.com/docs/projects/api-keys) to secure Firebase API keys like this, but we do so as an extra layer of security. 

## Running this code

After getting your credentials (see section above), this code can be run locally for development:

1. Fork this branch and clone your fork to your local machine
1. In a CLI, navigate to the project and install dependencies with `npm i`
1. Start a local instance with `npm start`
1. In a web browser, navigate to `localhost:4200` to browse the local instance

## Deploying this code

1. Log in to your Firebase account with the Firebase CLI: `firebase login`
1. Deploy the app with `ng run recycling-frontend:deploy`

Build is part of deploy process; no need to build beforehand.

## About
Made by the [Developer Student Club at Georgia Tech](https://dscgt.club/). 

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.3.

## Other Commands

Start emulators (Functions, Firestore, Hosting).
Due to how the project is set up, the emulated website (Hosting) will use the production Firestore instance, but emulated Functions will use the emulated Firestore instance.
```
firebase emulators:start
```

Build the webapp
```
npm run build
```

Deploy Firebase functions
```
firebase deploy --only functions:functionname1,functions:functionname2
```

For example, `firebase deploy --only functions:generateExcelSheet` will deploy only the generateExcelSheet() function. 

More information:
https://firebase.google.com/docs/functions/manage-functions#deploy_functions
https://firebase.google.com/docs/cli#deploy_specific_functions
