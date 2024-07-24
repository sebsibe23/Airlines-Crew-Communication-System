const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { addDays, parse, format } = require('date-fns');
const xml2js = require('xml2js');
const axios = require('axios');
const https = require('https');
const router = express.Router();

const token = '6887434002:AAEaPPWU1wfdn8fBC7hRkjkjwdo_KPQ_61o';
const bot = new TelegramBot(token, { polling: true });

const isNumber = (str) => {
  const objNotNumberPattern = /[^0-9.-]/;
  const objTwoDotPattern = /[0-9]*[.][0-9]*[.][0-9]*/;
  const objTwoMinusPattern = /[0-9]*[-][0-9]*[-][0-9]*/;
  const strValidRealPattern = "^([-]|[.]|[-.]|[0-9])[0-9]*[.]*[0-9]+$";
  const strValidIntegerPattern = "^([-]|[0-9])[0-9]*$";
  const objNumberPattern = new RegExp(`(${strValidRealPattern})|(${strValidIntegerPattern})`);

  return !objNotNumberPattern.test(str) && !objTwoDotPattern.test(str) && !objTwoMinusPattern.test(str) && objNumberPattern.test(str);
};

const getCrewOnBoard = async (flightnumber, startDT, departureairport) => {
    let response;
    try {
        const baseURL = "https://bus.eu-west-1.flightservices.cae.com/";

        const flightDate = parse(format(startDT, 'yyyy-MM-dd'), 'yyyy-MM-dd', new Date());
        const departureTime = format(flightDate, 'ddMMMyyyy').toUpperCase();

        const headers = {
            "Content-Type": "text/xml",
            "User-Agent": "HTTPie"
        };

        const payload = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
            <s:Header>
                <ns6:SabreHeader xmlns:ns6="http://services.sabre.com/STL_Header/v02_02" xmlns:ns9="http://schemas.xmlsoap.org/ws/2002/12/secext">
                    <ns6:Service operation="GetCrewOnFlight" ttl="100" version="10.0.0">CrewRosterService</ns6:Service>
                    <ns6:Identification>
                        <ns6:CustomerID>ET</ns6:CustomerID>
                        <ns6:CustomerAppID>SWS1:CAE-CrMgrCTB:8c121e9b86</ns6:CustomerAppID>
                        <ns6:ConversationID>3872401111999909823</ns6:ConversationID>
                        <ns6:MessageID>3872401111999909823</ns6:MessageID>
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
            </s:Header>
            <s:Body>
                <GetCrewOnFlightRQ operator="ALL" ancillaryCrewInd="true" version="10.0.0" xmlns="http://stl.sabre.com/AirCrews/CrewManager10/CrewRosterService/v10">
                    <CrewDataSelection crewPersonalInfoInd="true" crewEmploymentInfoInd="false" crewSeniorityInd="false" crewEmergencyContactsInd="false" 
                    crewBirthInformationInd="false" crewAttributesInd="false" crewFlyCountriesInd="false" crewEmailsInd="false" crewFlyTogetherInd="false" 
                    crewNoFlyTogetherInd="false" crewEntitlementInd="false" crewCompanyAssignmentsInd="false" crewFamilyMembersInd="false" crewProfileInd="false" 
                    xmlns="http://stl.sabre.com/AirCrews/CrewManager10/CommonDataTypes/v10">
                    </CrewDataSelection>
                    <FlightLegDataSelection legTimesInd="true" complementsInd="false" customAttributesInd="false" onwardFlightInd="false" additionalAttributesInd="false" 
                    qualRequirementsInd="false" flightTrainingCodesInd="false" flightRecencyQualsInd="false" equipmentInd="false" serviceInfoInd="false" paxLoadInd="false" 
                    maintenanceTimeInd="false" xmlns="http://stl.sabre.com/AirCrews/CrewManager10/CommonDataTypes/v10" />
                    <GenericQuery startDateTimeRange="2010-04-25T01:01:01Z" endDateTimeRange="2050-04-27T23:59:59Z" 
                    xmlns="http://stl.sabre.com/AirCrews/CrewManager10/CommonDataTypes/v10">
                        <GenericSearch> Leg(flightNumber;equals;${flightnumber}):Leg(departureAirport;is;${departureairport}):Leg(flightDate;equals;${departureTime})</GenericSearch>
                    </GenericQuery>
                </GetCrewOnFlightRQ>
            </s:Body>
        </s:Envelope>`;

        const axiosConfig = {
            headers,
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        };

        response = await axios.post(`${baseURL}/streaming`, payload, axiosConfig);

        const result = await xml2js.parseStringPromise(response.data, { explicitArray: false });

        // Debugging response structure
        console.log('Response structure:', JSON.stringify(result, null, 2));
        
        const envelope = result['s:Envelope'];
        if (!envelope || !envelope['s:Body']) {
            throw new Error('Invalid SOAP response structure');
        }

        let crewData = envelope['s:Body']['GetCrewOnFlightRS']['Crew'];
        let crewd = "";
        
        if (Array.isArray(crewData)) {
            crewData.forEach(crew => {
                const staffNumber = crew.$.staffNumber;
                const firstName = crew.CrewPersonalInfo.$.firstName;
                const rank = crew['ns15:CrewOnFlight'].$.actingPositionCode;
                crewd += `||${staffNumber} ${firstName} ${rank}=------------------------------------`;
            });
        } else if (crewData) {
            const staffNumber = crewData.$.staffNumber;
            const firstName = crewData.CrewPersonalInfo.$.firstName;
            const rank = crewData['ns15:CrewOnFlight'].$.actingPositionCode;
            crewd += `||${staffNumber} ${firstName} ${rank}=------------------------------------`;
        } else {
            throw new Error('Crew data not found in response');
        }
        
        crewd = crewd.replace(/\|\|/g, '\r\n').replace(/=/g, '\r\n');
        
        return crewd;
    } catch (error) {
        console.error('Error in getCrewOnBoard:', error.message);
        return { error: error.message };
    }
};

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text.trim().toLowerCase();

  if (messageText === '/start') {
    bot.sendMessage(chatId, 'Welcome to the bot!');
  } else if (messageText.startsWith('co')) {
    try {
      let Cc = "";
      let SendMSG = "";
      let fltno = messageText.substring(2).trim();
      const chekmsg = isNumber(fltno);

      if (fltno && !fltno.includes(',') && chekmsg) {
        Cc = await getCrewOnBoard(fltno, new Date(), 'your_departure_airport_code'); // Ensure you pass the correct departure airport code
      }

      if (typeof Cc === 'string' && (Cc.includes("M/M") || Cc.includes("Mr/") || Cc.includes("MR/") || Cc.includes("Mstr") || Cc.includes("Mrs/") || Cc.includes("MS/"))) {
        SendMSG = `FLIGHT: ET0${fltno}\r\nSTATUS: Departed\r\n\r\nCrew Onboard${Cc}`;
      } else if (!SendMSG) {
        SendMSG = 'No crew information available or flight details incorrect.';
      }

      bot.sendMessage(chatId, SendMSG);
    } catch (error) {
      console.error('Error handling message:', error);
      bot.sendMessage(chatId, 'An error occurred while processing your request.');
    }
  } else {
    bot.sendMessage(chatId, 'Invalid command. Please start your message with "co" followed by the flight number.');
  }
});

module.exports = router;
