require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Axios instance for HubSpot API
const hubspot = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Homepage route
app.get('/', async (req, res) => {
  try {
    const { data } = await hubspot.get(`/crm/v3/objects/p_pets?limit=10&properties=name,bio,type`);
    const records = data.results;
    res.render('homepage', { title: 'Custom Object Form', records });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Error fetching records');
  }
});

// GET: Form to add new record
app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
  });
});

// POST: Add new record
app.post('/update-cobj', async (req, res) => {
  const { name, bio, type } = req.body;

  try {
    await hubspot.post(`/crm/v3/objects/p_pets`, {
      properties: { name, bio, type },
    });

    res.redirect('/');
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Error creating record');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
