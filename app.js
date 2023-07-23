const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Config data will be assigned to this variable
let appConfigs;

// Middleware to parse incoming JSON data
app.use(express.json());

// Handling Cors error in browser
app.use(
  cors(
    {
      origin: "http://127.0.0.1:5500"
    }
  )
)

// Route to handle GET requests to /appconfigs
app.get('/appconfigs', (req, res) => {
  // Sending the list of appConfigs as a JSON response
  fs.readFile('EKSdetUseCase.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      appConfigs = JSON.parse(data);
      return res.json(appConfigs);
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
});

// Route to handle GET requests to /appconfigs/:id
app.get('/appconfigs/:id', (req, res) => {
    const appConfigId = parseInt(req.params.id);

    // Sending the list of appConfigs as a JSON response
  fs.readFile('EKSdetUseCase.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      appConfigs = JSON.parse(data);
        // Find the appConfig with the given ID
      const appConfig = appConfigs.find((appConfig) => appConfig.id === appConfigId);

          if (!appConfig) {
          // If appConfig with the given ID is not found, return a 404 status code
          return res.status(404).json({ message: 'appConfig not found' });
        }

        // Sending the appConfig details as a JSON response
      res.json(appConfig);
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });




});

// Route to handle POST requests to /appConfigs
app.post('/appconfigs', (req, res) => {
  const { appName } = req.body;
  const { appData } = req.body;

  if (!appName) {
    // If the request does not include a appName field, return a 400 status code
    return res.status(400).json({ message: 'Name is required' });
  }

 // Read the existing data from the JSON file
  const dataPath = path.join(__dirname, 'EKSdetUseCase.json');
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      const appConfigs = JSON.parse(data);

      // Generate a new unique appConfig ID
      const lastAppConfigId = appConfigs.length > 0 ? appConfigs[appConfigs.length - 1].id : 0;
      const newAppConfigId = lastAppConfigId + 1;

      // Create a new appConfig object
      const newAppConfig = { id: newAppConfigId, appName, appData};

      // Add the new appConfig to the appConfigs array
      appConfigs.push(newAppConfig);

      // Write the updated data back to the JSON file
      fs.writeFile(dataPath, JSON.stringify(appConfigs), 'utf8', (err) => {
        if (err) {
          console.error('Error writing to the file:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        // Respond with the newly created appConfig
        res.status(201).json(newAppConfig);
      });
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
});

app.put('/appconfigs/:id', (req, res) => {
  const appConfigId = parseInt(req.params.id);
  const { appName } = req.body;
  const { appData } = req.body;

  if (!appData) {
    return res.status(400).json({ message: 'appData is required' });
  }

  // Read the existing data from the JSON file
  const dataPath = path.join(__dirname, 'EKSdetUseCase.json');
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      let appConfigs = JSON.parse(data);

      // Find the index of the appConfig to update
      const appConfigIndex = appConfigs.findIndex((appConfig) => appConfig.id === appConfigId);

      if (appConfigIndex === -1) {
        return res.status(404).json({ message: 'appConfig not found' });
      }

      // Update the appConfig's name
      appConfigs[appConfigIndex].appData.appOwner = appData.appOwner;
      appConfigs[appConfigIndex].appData.isValid = appData.isValid;

      // Write the updated data back to the JSON file
      fs.writeFile(dataPath, JSON.stringify(appConfigs), 'utf8', (err) => {
        if (err) {
          console.error('Error writing to the file:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        // Respond with the updated appConfig
        res.json(appConfigs[appConfigIndex]);
      });
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
});

app.delete('/appconfigs/:id', (req, res) => {
  const appConfigId = parseInt(req.params.id);

  // Read the existing data from the JSON file
  const dataPath = path.join(__dirname, 'EKSdetUseCase.json');
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      let appConfigs = JSON.parse(data);

      // Find the index of the appConfig to delete
      const appConfigIndex = appConfigs.findIndex((appConfig) => appConfig.id === appConfigId);

      if (appConfigIndex === -1) {
        return res.status(404).json({ message: 'appConfig not found' });
      }

      // Remove the appConfig from the array
      appConfigs.splice(appConfigIndex, 1);

      // Write the updated data back to the JSON file
      fs.writeFile(dataPath, JSON.stringify(appConfigs), 'utf8', (err) => {
        if (err) {
          console.error('Error writing to the file:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        // Respond with a success message
        res.json({ message: 'appConfig deleted successfully' });
      });
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
