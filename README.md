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

## About
Made by the [Developer Student Club at Georgia Tech](https://dscgt.club/). 

---

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.3.

## Commands

Send to Firebase Hosting:

```
ng run recycling-frontend:deploy
```

Start emulators (Functions, Firestore, Hosting).
Due to how the project is set up, the emulated website (Hosting) will use the production Firestore instance, but emulated Functions will use the emulated Firestore instance.
```
firebase emulators:start
```
