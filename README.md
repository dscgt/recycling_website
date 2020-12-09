# RecyclingFrontend

Management and data viewing portal for recycling department administrators.

This is part of a suite of apps made for Georgia Tech's [OSWM&R](http://www.recycle.gatech.edu/), which also includes:
* [route-recorder](https://github.com/dscgt/route_recorder): Buddy app for recycling department crewmembers working recycling routes
* [recycling-checkin](https://github.com/dscgt/recycling_checkin): Daily check-out/check-in for recycling department crewmembers needing GT property

## Running this code

For development, this code can be run locally:

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

---

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
