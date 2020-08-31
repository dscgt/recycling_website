const functions = require("firebase-functions");
const xlsx = require('xlsx');
const FileSaver = require('file-saver');

const admin = require("firebase-admin");
admin.initializeApp();

var db = admin.firestore();

exports.seedRouteData = functions.https.onRequest(async (req, res) => {
  const writeResult = await admin
    .firestore()
    .collection("route_records")
    .add({
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
      "modelTitle": "modelTitle numero dos",
    });

    res.json({ result: `Message with ID: ${writeResult.id} added.` });
})

exports.testDBRead = functions.https.onRequest(async (req, res) => {
  try {
    let snapshot = await db.collection("route_records").get();
    console.log(snapshot);
    res.send(snapshot.docs.map(doc => doc.data()));
  } catch (e) {
    console.log('ERROR');
    console.log(e);
  }
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
    for (let i = 0; i < record.stops.length; i++) {
      if (i >= maxStopProperties.length) {
        maxStopProperties.push(Object.keys(record.stops[i].properties).length);
      } else {
        maxStopProperties[i] = Object.keys(record.stops[i].properties).length;
      }
    }
  })

  // Add in headers
  const headers = ["Title", "Checkout Time", "Checkin Time"];
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
    for (let i = 0; i < record.stops.length; i++) {
      stops.push(record.stops[i].title);
      stops = stops.concat(propertiesListFormatter(record.stops[i].properties, maxStopProperties[i]));
    }
    let row = [
      record.modelTitle,
      record.startTime,
      record.endTime,
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
  res.status(200).send(wbout);
})
