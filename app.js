
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");

// Include custom modules
const sheets = require("./modules/sheets.module");

// Create the express app
const app = express();
app.use(bodyParser.json({ extended: false }));

// Get the spreadsheet ids
var course_ids = JSON.parse(fs.readFileSync("course_ids.json"))
console.log(course_ids)
app.get("/", async (req, res) => {
    try {
        console.log("Ready to process")
        // Get the body of the message
        const data = req.query;

        // Validate the input
        if (!data.cid || !(data.question || data.gratitude)) {
            res
              .header("Access-Control-Allow-Origin", "*")
              .header("Access-Control-Allow-Headers", "X-Requested-With")
              .status(500)
              .json({result: "Parameter missing"})
              .end();
        } else {
            // Build an array of values for sheets
            var values = []
            var sheetName = ""
            var ts = new Date();
            var ts_str = ts.toDateString();

            if (data.question){
                values.push([data.question, ts_str]);
                sheetName = "Questions"
            } else {
                values.push([data.gratitude, ts_str]);
                sheetName = "Gratitude"
            }
            // Auth with google
            await sheets.auth();
            // Update spreadsheet
            const spreadsheetId = course_ids[data.cid];
            console.log("Ready to push to spreadsheet")
            await sheets.writeToSheet(spreadsheetId, sheetName, values);
        }
        // Send back a success message
        res
          .header("Access-Control-Allow-Origin", "*")
          .header("Access-Control-Allow-Headers", "X-Requested-With")
          .status(200)
          .json({result: "Accepted"})
          .end();
    } catch (error) {
        // https://thecodebarbarian.com/80-20-guide-to-express-error-handling
        console.log(error)
        res
          .header("Access-Control-Allow-Origin", "*")
          .header("Access-Control-Allow-Headers", "X-Requested-With")
          .status(500)
          .json({result: error.toString()})
          .end();
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});