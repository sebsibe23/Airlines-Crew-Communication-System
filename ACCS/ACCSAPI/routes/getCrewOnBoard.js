const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const router = express.Router();

// URL of the web service
const serviceUrl = 'http://svhqccapp01/rmi_ws/rmiservice.asmx';

// Function to call the GetCrewOnBoard method
async function getCrewOnBoard(userId, layout, resultRows, msgRows) {
  const soapRequest = `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <GetCrewOnBoard_x0028_string_x0020_UserId_x002C_DataSet_x0020_Layout_x002C_ref_x0020_DataSet_x0020_ResultRows_x002C__x0020_ref_x0020_DataSet_x0020_MsgRows_x0029_ xmlns="http://www.rmrocade.com/RMI/">
          <UserId>${userId}</UserId>
          <layout>${layout}</layout>
          <ResultRows>
            <xsd:schema>${resultRows}</xsd:schema>
          </ResultRows>
          <MsgRows>${msgRows}</MsgRows>
        </GetCrewOnBoard_x0028_string_x0020_UserId_x002C_DataSet_x0020_Layout_x002C_ref_x0020_DataSet_x0020_ResultRows_x002C__x0020_ref_x0020_DataSet_x0020_MsgRows_x0029_>
      </soap:Body>
    </soap:Envelope>
  `;

  try {
    const response = await axios.post(serviceUrl, soapRequest, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://www.rmrocade.com/RMI/GetCrewOnBoard(string UserId,DataSet Layout,ref DataSet ResultRows, ref DataSet MsgRows)'
      },
    });

    // Log the raw response data for debugging
    console.log('SOAP Response:', response.data);

    // Parse the XML response
    const result = await xml2js.parseStringPromise(response.data, {
      explicitArray: false,
      ignoreAttrs: true,
      tagNameProcessors: [xml2js.processors.stripPrefix] // This helps to handle namespace prefixes
    });

    // Extract the relevant data from the response
    const crewData = result.Envelope.Body.GetCrewOnBoard_x0028_string_x0020_UserId_x002C_DataSet_x0020_Layout_x002C_ref_x0020_DataSet_x0020_ResultRows_x002C__x0020_ref_x0020_DataSet_x0020_MsgRows_x0029_Response;

    return crewData;
  } catch (error) {
    console.error('Error calling GetCrewOnBoard:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    throw error;
  }
}

// Route to get crew on board
router.get('/', async (req, res) => {
  const { userId, layout, resultRows, msgRows } = req.query;

  if (!userId || !layout || !resultRows || !msgRows) {
    return res.status(400).json({ error: 'Missing required query parameters: userId, layout, resultRows, msgRows' });
  }

  try {
    const crewData = await getCrewOnBoard(userId, layout, resultRows, msgRows);
    res.json({ crewData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch crew data pro' });
  }
});

module.exports = router;
