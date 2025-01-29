import { google } from 'googleapis';

// Autenticación con Google
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const sheetId = "1y1PeiMI03LG3LKFiykCpSgAeRQL3mFQme3xbYzVxVso"; // Reemplaza con tu ID de hoja

// Método GET - Leer datos de la hoja
const getSheetData = async (range) => {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: range,
  });
  return response.data.values;
};

// Método POST - Insertar datos en la hoja
const insertData = async (range, values) => {
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: range,
    valueInputOption: 'RAW',
    resource: {
      values: values,
    },
  });
  return response.data;
};

// Método PUT - Actualizar datos en la hoja
const updateData = async (range, values) => {
  const response = await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: range,
    valueInputOption: 'RAW',
    resource: {
      values: values,
    },
  });
  return response.data;
};

// Método DELETE - Eliminar datos (requiere un poco más de trabajo con Google Sheets)
const deleteData = async (range) => {
  const response = await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: range,
  });
  return response.data;
};

// Handler principal de la API
export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Obtener los datos de la hoja
    const { range } = req.query;
    if (!range) {
      return res.status(400).json({ error: 'El parámetro "range" es obligatorio' });
    }

    try {
      const data = await getSheetData(range);
      return res.status(200).json({ data });
    } catch (error) {
      console.error('Error al obtener datos:', error);
      return res.status(500).json({ error: 'Error al obtener datos de la hoja' });
    }

  } else if (req.method === 'POST') {
    // Insertar nuevos datos
    const { range, values } = req.body;
    if (!range || !values) {
      return res.status(400).json({ error: 'Faltan parámetros "range" o "values"' });
    }

    try {
      const result = await insertData(range, values);
      return res.status(200).json({ result });
    } catch (error) {
      console.error('Error al insertar datos:', error);
      return res.status(500).json({ error: 'Error al insertar datos en la hoja' });
    }

  } else if (req.method === 'PUT') {
    // Actualizar datos existentes
    const { range, values } = req.body;
    if (!range || !values) {
      return res.status(400).json({ error: 'Faltan parámetros "range" o "values"' });
    }

    try {
      const result = await updateData(range, values);
      return res.status(200).json({ result });
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      return res.status(500).json({ error: 'Error al actualizar datos en la hoja' });
    }

  } else if (req.method === 'DELETE') {
    // Eliminar datos de la hoja
    const { range } = req.body;
    if (!range) {
      return res.status(400).json({ error: 'El parámetro "range" es obligatorio' });
    }

    try {
      const result = await deleteData(range);
      return res.status(200).json({ result });
    } catch (error) {
      console.error('Error al eliminar datos:', error);
      return res.status(500).json({ error: 'Error al eliminar datos de la hoja' });
    }

  } else {
    return res.status(405).json({ error: 'Método no permitido' });
  }
}
