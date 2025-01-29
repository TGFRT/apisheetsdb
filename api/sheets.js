import { google } from "googleapis";

export default async function handler(req, res) {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const { action, sheetId, range, values } = req.body;

  try {
    if (action === "get") {
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range,
      });
      return res.status(200).json(result.data.values);
    }

    if (action === "append") {
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range,
        valueInputOption: "RAW",
        requestBody: { values },
      });
      return res.status(200).json({ message: "Data appended successfully" });
    }

    if (action === "update") {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range,
        valueInputOption: "RAW",
        requestBody: { values },
      });
      return res.status(200).json({ message: "Data updated successfully" });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
