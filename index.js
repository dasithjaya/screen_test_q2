const express = require("express");
const { google } = require("googleapis");

const app = express();
app.use(express.json());
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.SECRET_ID,
  process.env.REDIRECT
);

app.get("/", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: "https://www.googleapis.com/auth/calendar.readonly",
  });
  res.redirect(url);
});

app.get("/redirect", async (req, res) => {
  try {
    const code = req.query.code;
    const token = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(token);
    res.status(200).json({
      status: "success",
      message: "Successfully logged in",
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Cannot get token",
    });
  }
});

app.get("/freeBusy", async (req, res) => {
  try {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const startDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 2);

    const freeBusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate,
        timeMax: endDate.toISOString(),
        items: [{ id: "primary" }],
      },
    });
    res.status(200).json({
      status: "success",
      data: freeBusy.data,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Cannot found",
    });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
