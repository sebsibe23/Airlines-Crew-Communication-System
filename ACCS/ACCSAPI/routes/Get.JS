const fs = require('fs');
const xml2js = require('xml2js');
const https = require('https');

const url = 'http://svhqccapp01/rmi_ws/RMIService.asmx';
const soapAction = 'http://www.rmrocade.com/RMI/GetCrewOnBoard';
const username = 'RM';
const password = 'CrewControl#123';

function GetCrewOnBoard(flightNumber, date, departure) {
  const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD format

  const xmlData = `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <GetCrewOnBoard xmlns="http://www.rmrocade.com/RMI/">
          <UserId>${username}</UserId>
          <layout>
            <Layout>
              <Row>
                <EMPNO></EMPNO>
                <FLTNBR>${flightNumber}</FLTNBR>
                <STARTTIME>${formattedDate}</STARTTIME>
                <DEP>'${departure}'</DEP>
                <SIGN></SIGN>
                <FIRSTNAME></FIRSTNAME>
                <LASTNAME></LASTNAME>
                <ASGRANK></ASGRANK>
                <DUTYDES></DUTYDES>
                <CREWCAT></CREWCAT>
              </Row>
            </Layout>
          </layout>
          <ResultRows>
            <xsd:schema>schema</xsd:schema>
          </ResultRows>
          <MsgRows></MsgRows>
        </GetCrewOnBoard>
      </soap:Body>
    </soap:Envelope>
  `;

  const authString = Buffer.from(`${username}:${password}`).toString('base64');

  const options = {
    hostname: url.split('://')[1].split('/')[0],
    path: `/${url.split('/')[3]}`,
    port: 80, // Assuming HTTP, change to 443 if HTTPS
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Content-Length': Buffer.byteLength(xmlData, 'utf8'),
      'Authorization': `Basic ${authString}`,
      'SOAPAction': soapAction
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        xml2js.parseString(data, (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          // Parse the response data here
          const crewData = [];
          // ... (logic to parse crew data from response object)

          resolve(crewData);
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(xmlData);
    req.end();
  });
}

GetCrewOnBoard('500', new Date('2024-07-15'), 'ADD')
  .then((crewData) => {
    console.log(crewData);
  })
  .catch((error) => {
    console.error(error);
  });
