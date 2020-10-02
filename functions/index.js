const functions = require("firebase-functions");
const xlsx = require('xlsx');
const FileSaver = require('file-saver');
const admin = require("firebase-admin");
// From https://stackoverflow.com/questions/42755131/enabling-cors-in-cloud-functions-for-firebase
const cors = require('cors')({ origin: true }); 

admin.initializeApp();
var db = admin.firestore();

exports.seedRouteRecords = functions.https.onRequest(async (req, res) => {
  const testRecord = {
    "startTime": "startTime_here",
    "endTime": "endTime_here",
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
    "modelId": "modelId_here",
    "modelTitle": "modelTitle1",
  };
  const testRecord2 = {
    "startTime": "startTime_here",
    "endTime": "endTime_here",
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
    "modelId": "modelId_here",
    "modelTitle": "modelTitle2",
  }

  const writeResults = await Promise.all([
    admin.firestore().collection("route_records").add(testRecord),
    admin.firestore().collection("route_records").add(testRecord),
    admin.firestore().collection("route_records").add(testRecord),
    admin.firestore().collection("route_records").add(testRecord2),
    admin.firestore().collection("route_records").add(testRecord2),
    admin.firestore().collection("route_records").add(testRecord2),
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

/*
Format of the sheet: 
title	startime	endtime	property1	property2	property3	stop0	stop0_property1	stop0_property2	stop0property3	stop1title	stop1property1	stop1property2
*/

const emptyCellValue = "N/A";
const propertyStringFormat = (key, value) => `${key}: ${value}`;
const propertiesListFormatter = (obj, length) => {
  let ret = Object.entries(obj).map((entry) => propertyStringFormat(entry[0], entry[1]));
  const missingEntries = length - Object.keys(obj).length
  for (let i = 0; i < missingEntries; i++) {
    ret.push(emptyCellValue);
  }
  return ret;
}

const convertDate = (timestampJSON) => new Date(timestampJSON._seconds * 1000);

// since sheet names cannot contain: \ / ? * [ ] 
const cleanSheetName = (name) => name.replace(/[/\\?*[\]]/g, '');

/**
 * Function that generates an excel sheet for the records databases
 * Query params:
 * filename - the filename of the file to download
 * sheetTitle - the title of the Excel sheet
 * recordType - name of the firebase collection of records. 
 */
exports.generateExcelSheet = functions.https.onRequest(async (req, res) => {
  // initialize sheet
  // sauce: https://redstapler.co/sheetjs-tutorial-create-xlsx/
  const workbookTitle = req.query.filename;
  const sheetTitle = req.query.sheetTitle;
  const collectionName = `${req.query.recordType.toLowerCase()}_records`
  const wb = xlsx.utils.book_new();
  wb.Props = {
    Title: workbookTitle
  }
  wb.SheetNames.push(sheetTitle);

  // read data from Fiyerrrbaaaaaaasssse
  let data;
  try {
    let snapshot = await db.collection(collectionName).get();
    data = snapshot.docs.map(doc => doc.data());
  } catch (e) {
    console.log('ERROR');
    console.log(e);
  }

  /* 
  The objective here is to flatten the data, and to that we need to give each nested property a name
  We will do this by assigning it as follows: property0, property1, property2, ...
  The approach is as follows:
    1) Preprocess the data to find out the properties for all records and for each stop
    2) Populate the data table
  
  */

  let ws_data = [];

  // preprocessing - find the maximum number of properties for all records and for each stop
  let maxGeneralProperties = 0;
  let maxStopProperties = [];

  data.forEach((record) => {
    // Add in all of the properties for the record
    maxGeneralProperties = Math.max(maxGeneralProperties, Object.keys(record.properties).length);
    // Add in all properties for the particular stop numbers
    if (record.stops) {
      for (let i = 0; i < record.stops.length; i++) {
        if (i >= maxStopProperties.length) {
          maxStopProperties.push(Object.keys(record.stops[i].properties).length);
        } else {
          maxStopProperties[i] = Object.keys(record.stops[i].properties).length;
        }
      }
    }
  })

  // Add in headers
  const headers = ["Title", "Start Time", "End Time"];
  for (let i = 0; i < maxGeneralProperties; i++) {
    headers.push(`Property ${i}`);
  }
  maxStopProperties.forEach((maxStopProps, index) => {
    headers.push(`Stop ${index}`);
    for (let i = 0; i < maxStopProps; i++) {
      headers.push(`Stop ${index}: Property ${i}`);
    }
  })
  ws_data.push(headers);

  // Add in the rows of data
  data.forEach((record) => {
    const properties = propertiesListFormatter(record.properties, maxGeneralProperties);
    let stops = []
    if (record.stops) {
      for (let i = 0; i < record.stops.length; i++) {
        stops.push(record.stops[i].title);
        stops = stops.concat(propertiesListFormatter(record.stops[i].properties, maxStopProperties[i]));
      }
    }
    let row = [
      record.modelTitle,
      record.startTime ? convertDate(record.startTime) : convertDate(record.checkoutTime),
      record.endTime ? convertDate(record.endTime) : convertDate(record.checkinTime),
    ];
    row = row.concat(properties);
    row = row.concat(stops);
    ws_data.push(row);
  });

  // Convert array of array (aoa) to excel sheet and full senddddddd
  let ws = xlsx.utils.aoa_to_sheet(ws_data);
  wb.Sheets[sheetTitle] = ws;

  let wbout = xlsx.write(wb, {bookType: 'xlsx', type: 'buffer'});
  res.type('blob');
  cors(req, res, () => {
    res.status(200).send(wbout);
  })
})

/**
 * Function that generates an excel sheet for checkout records.
 * 
 * A blob will be sent back, which can be turned into a file download on the client. Here is an example:
 * https://stackoverflow.com/questions/19327749/javascript-blob-filename-without-link
 * Note that this Firebase Function does not handle file name; this should be set on the client.
 */
exports.generateCheckoutRecordsExcelSheet = functions.https.onRequest(async (req, res) => {
  // sheet initialization from https://redstapler.co/sheetjs-tutorial-create-xlsx/

  // uncomment for future restrictions, such as controlled by query parameters
  // const foo = req.query.foo;

  const wb = xlsx.utils.book_new();

  // read data from Firebase
  let data;
  try {
    let snapshot = await db.collection('checkin_records').get();
    data = snapshot.docs.map(doc => doc.data());
  } catch (e) {
    console.log('ERROR');
    console.log(e);
    res.sendStatus(500);
    return;
  }

  /* 
  The objective here is to separate data by model name; data points will be separated into Excel sheets as determined by the model name.
  */

  // preprocess all records to separate them by model title, and do null checks
  // modelTitles is a map of model name to array of data points
  const modelTitles = new Map();
  data.forEach((record) => {
    // null checks
    if (record.modelTitle === null || record.checkoutTime === null || record.checkinTime === null) {
      console.log(`record is missing vital modelTitle, checkoutTime, and/or checkinTime, aborting`);
      res.sendStatus(500);
      return;
    }
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
    let headers = new Set();
    for (let record of records) {
      const allProperties = Object.keys(record.properties);
      for (let property of allProperties) {
        headers.add(property);
      }
    }
    headers = Array.from(headers);

    // add header row
    const headerRow = ['Start Time', 'End Time'].concat(headers);
    ws_data.push(headerRow);
    
    // add the rest of the rows
    for (let record of records) {
      const thisRow = [
        convertDate(record.checkoutTime),
        convertDate(record.checkinTime)
      ];
      for (let header of headers) {
        // eslint-disable-next-line
        thisRow.push(record.properties[header] != null
            ? record.properties[header]
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
