
const { format } = require('date-fns');
const https = require('https');
const { parseStringPromise } = require('xml2js');
const axios = require('axios');
const express = require('express');
const router = express.Router();


async function getFlightSchedule  (flightNumber, startDT, Dep) {
 
//console.log(startDT);
  newstartDT = format(new Date(startDT), 'yyyy-MM-dd').toUpperCase();
 // console.log(newstartDT);
  const departureTime = format(new Date(startDT), 'ddMMMyyyy').toUpperCase();

    const baseURL = 'https://bus.eu-west-1.flightservices.cae.com/';
    const headers = {
        'Content-Type': 'text/xml',
        'User-Agent': 'HTTPie'
    };
  const requestData = `
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <soap:Header>
        <ns6:SabreHeader xmlns:ns6="http://services.sabre.com/STL_Header/v02_02" xmlns:ns9="http://schemas.xmlsoap.org/ws/2002/12/secext">
          <ns6:Service operation="GetFlightSchedule" ttl="100" version="10.0.0">FlightLegService</ns6:Service>
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
      </soap:Header>
      <soap:Body>
        <cmxfls:GetFlightScheduleRQ version="10.0.0" xmlns:cmx="http://stl.sabre.com/AirCrews/CrewManager10/CommonDataTypes/v10" xmlns:cmxfls="http://stl.sabre.com/AirCrews/CrewManager10/FlightLegService/v10" xmlns:p="http://services.sabre.com/sp/cmm/types/v01_00" xmlns:p1="http://services.sabre.com/STL_Payload/v02_02" xmlns:p2="http://services.sabre.com/STL_MessageCommon/v02_02" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://stl.sabre.com/AirCrews/CrewManager10/FlightLegService/v10 FlightLegService-10.0.0.xsd ">
          <cmx:FlightLegDataSelection additionalAttributesInd="true" complementsInd="true" customAttributesInd="true" equipmentInd="true" flightRecencyQualsInd="true" flightTrainingCodesInd="true" legTimesInd="true" maintenanceTimeInd="true" onwardFlightInd="true" paxLoadInd="true" qualRequirementsInd="true" serviceInfoInd="true"/>
          <cmx:GenericQuery endDateTimeRange="${newstartDT}T23:59:00.000Z" startDateTimeRange="${newstartDT}T00:00:00.000Z">
            <cmx:GenericSearch>Leg(flightNumber;equals;${flightNumber}):Leg(departureAirport;is;${Dep}):Leg(departureTime;greater than;${departureTime} 0000):Leg(departureTime;lower than;${departureTime} 2329)</cmx:GenericSearch>
          </cmx:GenericQuery>
        </cmxfls:GetFlightScheduleRQ>
      </soap:Body>
    </soap:Envelope>`;

	  try {
      //const formattedFlightDetails =   fetchAndFormatFlightDetails(baseURL, requestData, headers).then(console.log).catch(console.error);
//console.log(formattedFlightDetails)
    return fetchAndFormatFlightDetails(baseURL, requestData, headers);
  } catch (error) {
    console.error('Error occurred:', error);
    throw error;
  }
};





const getDynamicNamespacePath = (obj, path) => {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (!current) {
      return null;
    }

    const matchingKey = Object.keys(current).find(k => new RegExp(key).test(k));
    current = matchingKey ? current[matchingKey] : null;
  }

  return current;
};

const extractFlightDetails = (data) => {
  const flightLegPath = getDynamicNamespacePath(data, 'Envelope.Body.GetFlightScheduleRS.FlightLegs.FlightLeg');

  if (!flightLegPath) {
    console.error("No flight leg data found.");
    return null;
  }

  const flightLeg = flightLegPath;
  const flightKey = flightLeg["ns11:FlightKey"];
  const flightLegTimes = flightLeg["ns11:FlightLegTimes"];
  const legComplements = flightLeg["ns11:LegComplements"];
  const paxLoad = flightLeg["ns11:PaxLoad"];

  const flightLegId = flightLeg["$"]?.["flightLegId"] ?? "N/A";
  const departureAirportCode = flightLeg["$"]?.["departureAirportCode"] ?? "N/A";
  const arrivalAirportCode = flightLeg["$"]?.["arrivalAirportCode"] ?? "N/A";
  const flightNumber = flightKey["$"]?.["flightNumber"] ?? "N/A";
  const scheduledDepartureTimeUtc =formatDateString( flightLegTimes["$"]?.["scheduledDepartureTimeUtc"] ?? "N/A");
  const scheduledArrivalTimeUtc = formatDateString(   flightLegTimes["$"]?.["scheduledArrivalTimeUtc"] ?? "N/A");

  const minimumFlightDeck = legComplements["$"]?.["minimumFlightDeck"] ?? "N/A";
  const minimumCabin = legComplements["$"]?.["minimumCabin"] ?? "N/A";
  const paxLoadType = paxLoad["$"]?.["type"] ?? "N/A";
  const paxLoadValue = paxLoad["_"] ?? "N/A";

  return {
    flightLegId,
    departureAirportCode,
    arrivalAirportCode,
    flightNumber,
    scheduledDepartureTimeUtc,
    scheduledArrivalTimeUtc,
    minimumFlightDeck,
    minimumCabin,
    paxLoadType,
    paxLoadValue
  };
};

const formatFlightDetails = (flightDetails) => {
  if (!flightDetails) {
    return "No flight details available.";
  }

  const formattedDetails = `
    Flight Number: ${flightDetails.flightNumber}
    Departure: ${flightDetails.departureAirportCode}
    Arrival : ${flightDetails.arrivalAirportCode}
    SDT (UTC): , ${flightDetails.scheduledDepartureTimeUtc}
    SAT (UTC): ${flightDetails.scheduledArrivalTimeUtc}
    Pax Type: ${flightDetails.paxLoadType}
    Pax : ${flightDetails.paxLoadValue}
    Minimum Flight Deck: ${flightDetails.minimumFlightDeck}
    Minimum Cabin: ${flightDetails.minimumCabin}
    
  `;

  return formattedDetails.trim();
};

const fetchAndFormatFlightDetails = async (baseURL, requestData, headers) => {
  try {
    const response = await axios.post(baseURL + 'streaming', requestData, { headers });
    const responseData = response.data;

    const parsedData = await parseStringPromise(responseData, { explicitArray: false, ignoreAttrs: false });
    const flightDetails = extractFlightDetails(parsedData);
console.error(flightDetails + 'flight details');
    const formattedFlightDetails = formatFlightDetails(flightDetails);
    return formattedFlightDetails;

  } catch (error) {
    console.error('Error occurred:', error);
    throw error;
  }
};


const formatDateString = (dateString) => {
  const date = new Date(dateString);
  const options = {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  const formattedDate = date.toLocaleString('en-GB', options);
  const [day, month, year, time] = formattedDate.replace(',', '').split(' ');
  const [hour, minute] = time.split(':');
  
  return `${day}-${month}-${year} ${hour}${minute}`;
};

router.get('/', async (req, res) => {
    const { flightNumber, startDT, Dep } = req.body;

    if (!flightNumber || !startDT || !Dep) {
        return res.status(400).send('Missing required parameters: flightNumber, startDT, or Dep');
    }

    try {
        const flightDetails = await getFlightSchedule(flightNumber, startDT, Dep);
        res.send({ flightDetails });
    } catch (error) {
        console.error("Error fetching flight schedule:", error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
module.exports.getFlightSchedule = getFlightSchedule;