const axios = require('axios');
const xml2js = require('xml2js');
const express = require('express');
const router = express.Router();



router.get('/', async (req, res) => {
  const { STRempID } = req.body;

  if (!STRempID) {
    return res.status(400).send('Missing required parameter: STRempID');
  }

  try {
    const emailInfo = await getCrewPhone(STRempID);
    res.send(emailInfo);
  } catch (error) {
    console.error("Error fetching employee email info:", error);
    res.status(500).send('Internal Server Error');
  }
});
async function getCrewPhone(STRempID) {
  const baseURL = "https://bus.eu-west-1.flightservices.cae.com/";
  const requestData = `
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <soap:Header>
        <ns6:SabreHeader xmlns:ns6="http://services.sabre.com/STL_Header/v02_02" xmlns:ns9="http://schemas.xmlsoap.org/ws/2002/12/secext">
          <ns6:Service operation="GetCrews" ttl="100" version="10.0.0">CrewService</ns6:Service>
          <ns6:Identification>
            <ns6:CustomerID>ET</ns6:CustomerID>
            <ns6:CustomerAppID>SWS1:CAE-CrMgrCTB:8c121e9b86</ns6:CustomerAppID>
            <ns6:ConversationID>3872401111999909811111</ns6:ConversationID>
            <ns6:MessageID>3872401111999909811</ns6:MessageID>
            <ns6:TimeStamp>2022-10-18T17:00:00.000Z</ns6:TimeStamp>
          </ns6:Identification>
        </ns6:SabreHeader>
        <ns9:Security xmlns:ns6="http://services.sabre.com/STL_Header/v02_01" xmlns:ns9="http://schemas.xmlsoap.org/ws/2002/12/secext"/>
        <wsse:Security>
          <wsse:UsernameToken>
            <wsse:Username>V1:cmxetctbot:CAE Products:ET</wsse:Username>
            <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">YZE7fZh4</wsse:Password>
          </wsse:UsernameToken>
        </wsse:Security>
      </soap:Header>
      <soap:Body>
        <cmxcs:GetCrewsRQ version="1" xsi:schemaLocation="http://stl.sabre.com/AirCrews/CrewManager10/CrewService/v10 CrewService-10.0.0.xsd " xmlns:cmx="http://stl.sabre.com/AirCrews/CrewManager10/CommonDataTypes/v10" xmlns:cmxcs="http://stl.sabre.com/AirCrews/CrewManager10/CrewService/v10" xmlns:p="http://services.sabre.com/sp/cmm/types/v01_00" xmlns:p1="http://services.sabre.com/STL_Payload/v02_02" xmlns:p2="http://services.sabre.com/STL_MessageCommon/v02_02" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <cmx:CrewDataSelection crewAttributesInd="false" crewBirthInformationInd="false" crewCompanyAssignmentsInd="false" crewEmailsInd="false" crewEmergencyContactsInd="false" crewEmploymentInfoInd="false" crewEntitlementInd="false" crewFamilyMembersInd="false" crewFlyCountriesInd="false" crewFlyTogetherInd="false" crewNoFlyTogetherInd="false" crewPersonalInfoInd="true" crewProfileInd="false" crewSeniorityInd="false" rosterPeriodPublishedInd="false">
            <cmx:CrewPhonesInd>true</cmx:CrewPhonesInd>
          </cmx:CrewDataSelection>
          <cmx:StaffNumbers>
            <cmx:StaffNumber>${STRempID}</cmx:StaffNumber>
          </cmx:StaffNumbers>
        </cmxcs:GetCrewsRQ>
      </soap:Body>
    </soap:Envelope>`;
//console.log(requestData);
  try {
    const response = await axios.post(baseURL + 'streaming', requestData, {
      headers: {
        'Content-Type': 'text/xml',
        'User-Agent': 'HTTPie'
      }
    });

    const parsedResult = await xml2js.parseStringPromise(response.data);

    const soapBody = parsedResult['ns10:Envelope']['ns10:Body'][0];
    const crewList = soapBody['ns13:GetCrewsRS'][0]['ns11:CrewList'][0]['ns11:Crew'] || [];

    let SendMSG = '';
    crewList.forEach((crewDataD) => {
      const crewPersonalInfo = crewDataD['ns11:CrewPersonalInfo'][0];
      if (crewPersonalInfo) {
        SendMSG += `||NAME: ${crewPersonalInfo.$.firstName}`;
      }
      const crewPhones = crewDataD['ns11:CrewPhones'][0]['ns11:CrewPhone'] || [];
      const mobilePhone = crewPhones.find((phone) => phone.$.phoneType === 'MOBILE');
      if (mobilePhone) {
        SendMSG += `||Phone number: ${mobilePhone._}`;
      }
    });

    SendMSG = SendMSG.replace(/\|\|/g, '\r\n');
     console.log("Response Data:", SendMSG);
    return SendMSG;
  } catch (error) {
    console.error('Error fetching employee phone:', error);
    throw new Error('Unable to fetch employee phone data');
  }
}


module.exports = router;
module.exports.getCrewPhone = getCrewPhone;