const functions = require("firebase-functions");
const xlsx = require('xlsx');
const admin = require("firebase-admin");
// From https://stackoverflow.com/questions/42755131/enabling-cors-in-cloud-functions-for-firebase
const cors = require('cors')({ origin: true });
const { DateTime } = require("luxon");

admin.initializeApp();
var db = admin.firestore();

exports.seedRouteRecords = functions.https.onRequest(async (req, res) => {
  const testRecord = {
    "startTime": new Date(),
    "endTime": new Date(),
    "properties": {
      "key1": "value1",
      "key2": "value2",
      "key3": "value3",
    },
    "stops": [
      {
        "title": "title_here",
        "properties": {
          "key1": "value1",
          "key2": "value2",
          "key3": "value3",
        }
      }
    ],
    "saves": [
      {
        "saveTime": new Date(),
        "stops": ["stop1", "stop2"]
      }
    ],
    "modelId": "modelId_here",
    "modelTitle": "modelTitle1",
  };
  const testRecord2 = {
    "startTime": new Date(),
    "endTime": new Date(),
    "properties": {
      "key1": "value1_2",
      "key2": "value2_2",
      "key3": "value3_2",
    },
    "stops": [
      {
        "title": "title_here_2",
        "properties": {
          "key1": "value1_2",
          "key2": "value2_2",
          "key3": "value3_2",
        }
      }
    ],
    "saves": [
      {
        "saveTime": new Date(),
        "stops": ["stop1", "stop2"] 
      },
      {
        "saveTime": new Date(),
        "stops": ["stop3", "stop4"]
      },
      {
        "saveTime": new Date(),
        "stops": ["stop5", "stop6"]
      },
      {
        "saveTime": new Date(),
        "stops": ["stop7", "stop8"]
      }
    ],
    "modelId": "modelId_here_2",
    "modelTitle": "modelTitle2_2",
  }
  const testRecord2Modified = {
    "startTime": new Date(),
    "endTime": new Date(),
    "properties": {
      "key1": "value1_2",
      "key2": "value2_2",
      "key3": "value3_2",
    },
    "stops": [
      {
        "title": "title_here_2",
        "properties": {
          "key1": "value1_2",
          "key2": "value2_2",
          "key3": "value3_2",
        }
      },
      {
        "title": "title_here_2_2",
        "properties": {
          "key1_2": "value1_2_2",
        }
      }
    ],
    "saves": [
      {
        "saveTime": new Date(),
        "stops": ["stop1", "stop2"]
      },
      {
        "saveTime": new Date(),
        "stops": ["stop3", "stop4"]
      },
      {
        "saveTime": new Date(),
        "stops": ["stop5", "stop6"]
      },
      {
        "saveTime": new Date(),
        "stops": ["stop7", "stop8"]
      }
    ],
    "modelId": "modelId_here_2",
    "modelTitle": "modelTitle2_2",
  }

  const writeResults = await Promise.all([
    admin.firestore().collection("route_records").add(testRecord),
    admin.firestore().collection("route_records").add(testRecord),
    admin.firestore().collection("route_records").add(testRecord),
    admin.firestore().collection("route_records").add(testRecord2),
    admin.firestore().collection("route_records").add(testRecord2),
    admin.firestore().collection("route_records").add(testRecord2),
    admin.firestore().collection("route_records").add(testRecord2Modified),
    admin.firestore().collection("route_records").add(testRecord2Modified),
  ]);
  
  res.json({ result: `Added route records with IDs ${writeResults.map(x => x.id).toString()}.` });
})

exports.seedCheckinRecords = functions.https.onRequest(async (req, res) => {

  const testRecord = {
    "checkoutTime": new Date(),
    "checkinTime": new Date(),
    "properties": {
      "key1": "value1",
      "key2": "value2",
      "key3": "value3",
    },
    "modelId": "modelId_here",
    "modelTitle": "modelTitle1",
  };
  const testRecord2 = {
    "checkoutTime": new Date(),
    "checkinTime": new Date(),
    "properties": {
      "key1": "value1",
      "key2": "value2",
      "key3": "value3",
    },
    "modelId": "modelId_here",
    "modelTitle": "modelTitle2",
  }

  const writeResults = await Promise.all([
    admin.firestore().collection("checkin_records").add(testRecord),
    admin.firestore().collection("checkin_records").add(testRecord),
    admin.firestore().collection("checkin_records").add(testRecord),
    admin.firestore().collection("checkin_records").add(testRecord2),
    admin.firestore().collection("checkin_records").add(testRecord2),
    admin.firestore().collection("checkin_records").add(testRecord2),
  ]);

  res.json({ result: `Added checkin records with IDs ${writeResults.map(x => x.id).toString()}.` });
})

const convertDate = (timestampJSON) => new Date(timestampJSON._seconds * 1000);

// since sheet names cannot contain: \ / ? * [ ]. Removes these things.
const cleanSheetName = (name) => name.replace(/[/\\?*[\]]/g, '');

/**
 * Function that generates an excel sheet for the records databases
 * sheet initialization from https://redstapler.co/sheetjs-tutorial-create-xlsx/
 * 
 * If neither rangeStart nor rangeEnd are provided, this function will retrieve records only from the current time to seven days prior. If one is not provided, this function will retrieve records towards the unprovided direction to a seven-day range. 
 * If the date range is invalid (ex. rangeStart comes after rangeEnd), the result returned will not contain any data.
 * 
 * Query params:
 * recordType - name of the firebase collection of records. Either 'checkin' or 'recorder'. Defaults to 'recorder'
 * rangeStart - UNIX time number, in seconds. the beginning of the date range from which to retrieve records. Is day-inclusive; will retrieve records starting from the beginning (00:00) of the day. All done in EST.
 * rangeEnd - UNIX time number, in seconds. the end of the date range from which to retrieve records. Is day-inclusive; will retrieve records until the end (23:59) of the day. All done in EST.
 * 
 * A blob will be sent back, which can be turned into a file download on the client. Here is an example:
 * https://stackoverflow.com/questions/19327749/javascript-blob-filename-without-link
 * Note that this Firebase Function does not handle file name; this should be set on the client.
 */
exports.generateExcelSheet = functions.https.onRequest(async (req, res) => {
  // verify ID token
  // Taken from https://stackoverflow.com/a/44500591
  let idToken = (req.get('authorization') || req.get('Authorization'));
  if (idToken) { // handle CORS preflight requests -- no ID token
    idToken = idToken.split('Bearer ')[1];
  } else {
    cors(req, res, () => {
      res.sendStatus(401);
    });
    return;
  }
  try {
    let result = await admin.auth().verifyIdToken(idToken);
  } catch(e) {
    cors(req, res, () => {
      res.status(401).send(e)
    });
    return;
  }

  let rangeStart = req.query.rangeStart;
  let rangeEnd = req.query.rangeEnd;
  try {
    if (!rangeStart && !rangeEnd) {
      const now = DateTime.local().setZone('America/New_York'); // must set timezone to guarantee startOf, endOf work
      rangeStart = now.minus({ weeks: 1 }).startOf('day').toJSDate();
      rangeEnd = now.endOf('day').toJSDate();
    } else if (!rangeStart) {
      const end = DateTime.fromSeconds(parseInt(rangeEnd, 10)).setZone('America/New_York');
      rangeStart = end.minus({ weeks: 1 }).startOf('day').toJSDate();
      rangeEnd = end.endOf('day').toJSDate();
    } else if (!rangeEnd) {
      const start = DateTime.fromSeconds(parseInt(rangeStart, 10)).setZone('America/New_York');
      rangeStart = start.startOf('day').toJSDate();
      rangeEnd = start.plus({ weeks: 1 }).endOf('day').toJSDate();
    } else {
      rangeStart = DateTime.fromSeconds(parseInt(rangeStart, 10)).setZone('America/New_York').startOf('day').toJSDate();
      rangeEnd = DateTime.fromSeconds(parseInt(rangeEnd, 10)).setZone('America/New_York').endOf('day').toJSDate();
    }
  } catch (e) {
    cors(req, res, () => {
      res.status(400).send(e.message);
    });
    return;
  }

  let recordType = req.query.recordType;
  // default to recorder
  if (!recordType || recordType.trim() !== 'checkin' && recordType.trim() !== 'recorder') {
    recordType = 'recorder';
  }

  const wb = xlsx.utils.book_new();

  // read data from Firebase
  let data;
  try {
    let snapshot;
    if (recordType === 'recorder') {
      snapshot = await db.collection('route_records').where('startTime', '>', rangeStart).where('startTime', '<', rangeEnd).get();
    } else { // recordType === 'checkin'
      snapshot = await db.collection('checkin_records').where('checkoutTime', '>', rangeStart).where('checkoutTime', '<', rangeEnd).get();
    }
    data = snapshot.docs.map(doc => doc.data());
  } catch (e) {
    cors(req, res, () => {
      res.sendStatus(500);
    });
    return;
  }

  // handle no records
  if (data.length === 0) {
    // send back empty Excel sheet
    // let ws = xlsx.utils.aoa_to_sheet([[]]);
    wb.SheetNames.push("NO_DATA");
    let wbout = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
    res.type('blob');
    cors(req, res, () => {
      res.status(200).send(wbout);
    })
    return;
    // wb.Sheets[thisSheetName] = ws;
  }

  /* 
  The objective here is to separate data by model name; data points will be separated into Excel sheets as determined by the model name.
  */

  // preprocess all records to separate them by model title, and do null checks
  // modelTitles is a map of model name to array of data points
  const modelTitles = new Map();
  data.forEach((record) => {
    // handle model titles not seen before
    if (!modelTitles.has(record.modelTitle)) {
      modelTitles.set(record.modelTitle, []);
    }
    // push this record under this model title
    modelTitles.get(record.modelTitle).push(record);
  })

  // generate all rows for all sheets.
  for (let [modelTitle, records] of modelTitles) {
    const ws_data = [];

    // preprocess records to determine needed headers
    // for checkout records, properties within "properties" key should be considered for headers
    // for route recorder records, properties within "properties", stop titles combined with stop properties, and save number combined with save object property all count.
    // ex. for a route with property {"Name": "Alice"}, stop { title: "Rec", properties: {"Number of bags": 1, "Comments": ""} }, and saves [ {saveTime: x, stops: [a,b,c] ],
    // the headers would look like: Name, Rec Number of bags, Rec Comments, Save 1 saveTime, Save 1 stops
    
    // this maps a header name to a function which takes a record and retrieves the data for that header
    let headers = new Map();
    if (recordType === 'checkin') {
      // handle "properties" of record
      for (let record of records) {
        const allProperties = Object.keys(record.properties);
        for (let property of allProperties) {
          if (!headers.has(property)) {
            headers.set(property, record => record.properties[property]);
          }
        }
      }
    } else { // recordType === 'property'
      for (let record of records) {
        // handle "properties" of record
        const allProperties = Object.keys(record.properties);
        for (let property of allProperties) {
          if (!headers.has(property)) {
            headers.set(property, record => record.properties[property]);
          }
        }

        // handle "stops" of record
        for (let stop of record.stops) {
          const stopProperties = Object.keys(stop.properties);
          for (let stopProperty of stopProperties) {
            const headerName = `${stop.title} ${stopProperty}`;
            if (!headers.has(headerName)) {
              headers.set(headerName, (record) => {
                // the retriever iterates through all of a record's stops to find the right one
                // this is highly inefficient. Maybe record stops should be preprocessed to be keyed to stop title? sometime before this loop?
                for (let thisStop of record.stops) {
                  if (thisStop.title === stop.title) {
                    return thisStop.properties[stopProperty];
                  }
                }
                return null;
              });
            }
          }
        }
        
        // handle "saves" of record
        // not using for-of loop b/c we want index
        // eslint-disable-next-line no-loop-func
        if (record.saves) {
          record.saves.forEach((save, i) => {
            const saveTimeHeader = `Save ${i + 1} time`;
            if (!headers.has(saveTimeHeader)) {
              headers.set(saveTimeHeader, (record) => {
                // eslint-disable-next-line
                if (record.saves[i] != null) {
                  return convertDate(record.saves[i].saveTime)
                } else {
                  return  null;
                }
              });
            }
            const stopsHeader = `Save ${i + 1} stops`;
            if (!headers.has(stopsHeader)) {
              headers.set(stopsHeader, (record) => {
                // eslint-disable-next-line
                if (record.saves[i] != null) {
                  return record.saves[i].stops.toString();
                } else {
                  return null;
                }
              });
            }
          });
        }
      }
    }

    // add header row, including the two start and end times
    const headerRow = ['Start Time', 'End Time'].concat(Array.from(headers.keys()));
    ws_data.push(headerRow);

    // add the rest of the rows
    for (let record of records) {
      // add the beginning two data points, which are start and end times
      const thisRow = recordType === 'checkin'
        ? [
          convertDate(record.checkoutTime),
          convertDate(record.checkinTime)
        ]
        : [
          convertDate(record.startTime),
          convertDate(record.endTime)
        ];
      for (let [headerName, headerRetriever] of headers) {
        const retrieved = headerRetriever(record);
        // avoid using retrieved || 'N/A' to handle falsy non-null values such as 0
        // eslint-disable-next-line
        thisRow.push(retrieved != null
          ? retrieved
          : 'N/A'
        )
      }
      ws_data.push(thisRow);
    }

    // convert rows to Excel format
    let ws = xlsx.utils.aoa_to_sheet(ws_data);
    const thisSheetName = cleanSheetName(modelTitle);
    wb.SheetNames.push(thisSheetName);
    wb.Sheets[thisSheetName] = ws;
  }

  // send back as blob
  let wbout = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
  res.type('blob');
  cors(req, res, () => {
    res.status(200).send(wbout);
  })
})
