const functions = require("firebase-functions");
const xlsx = require('xlsx');
const FileSaver = require('file-saver');
// const Blob = require('blob');

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
      "modelTitle": "modelTitle_here",
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

// sauce: https://redstapler.co/sheetjs-tutorial-create-xlsx/
exports.generateExcelSheet = functions.https.onRequest(async (req, res) => {
  // initialize sheet
  const workbookTitle = req.query.filename;
  const sheetTitle = req.query.sheetTitle;
  const wb = xlsx.utils.book_new();
  wb.Props = {
    Title: workbookTitle
  }
  wb.SheetNames.push(sheetTitle);

  // read data from Fiyerrrbaaaaaaasssse
  let data;
  try {
    let snapshot = await db.collection("route_records").get();
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
  let generalProperties = new Set();
  let stopProperties = [];

  data.map((record) => {
    record.properties.forEach((value) => generalProperties.add(value));
    for (let i = 0; i < record.stops.length; i++) {
      let stopPropertiesLength = Object.values(record.stops[i].properties).length;
      if (i >= maxStopProperties.length) {
        maxStopProperties.push(stopPropertiesLength);
      } else {
        maxStopProperties[i] = max(maxStopProperties[i], stopPropertiesLength);
      }
    }
  })

  generalProperties = Array.from(generalProperties);

  const headers = [];
  ws_data.push(headers);

  data.map((record) => {
    const properties = Object.values(record.properties)
    let stops = []
    for (let i = 0; i < record.stops.length; i++) {
      let stops[i] =
    }
    let row = [
      record.modelTitle,
      record.startTime,
      record.endTime,
    ];
    row.concat(properties);
    ws_data.push();
  });

  let ws = xlsx.utils.aoa_to_sheet(ws_data);
  wb.Sheets[sheetTitle] = ws;

  let wbout = xlsx.write(wb, {bookType: 'xlsx', type: 'buffer'});
  res.status(200).send(wbout);
})

function s2ab(s) {
  let buf = new ArrayBuffer(s.length);
  let view = new Uint8Array(buf);
  for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
  return buf;
}