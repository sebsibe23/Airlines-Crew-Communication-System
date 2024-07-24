const https = require('https');
const axios = require('axios');
const xml2js = require('xml2js');
const { format, addDays } = require('date-fns');



async function GetCrewRoster( empID,  intstartDT) {
    console.log('GetCrewRoster' + empID + + intstartDT); 
const baseURL = 'https://bus.eu-west-1.flightservices.cae.com/';

let EmployeeRoster = '';
const today = new Date();
const EndDate = addDays(today, intstartDT);
const formattedStartDate = format(today, 'yyyy-MM-dd');
const formattedEndeDate = format(EndDate, 'yyyy-MM-dd');
console.log(formattedStartDate + ' ' + formattedEndeDate);
    const headers = {
        'Content-Type': 'text/xml',
        'User-Agent': 'HTTPie'
    };
    const requestData = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
        <s:Header>
        <ns6:SabreHeader xmlns:ns6="http://services.sabre.com/STL_Header/v02_02" xmlns:ns9="http://schemas.xmlsoap.org/ws/2002/12/secext">
            <ns6:Service operation="GetCrewSchedule" ttl="100" version="10.0.0">CrewRosterService</ns6:Service>
           <ns6:Identification>
            <ns6:CustomerID>ET</ns6:CustomerID>
            <ns6:CustomerAppID>SWS1:CAE-CrMgrPD:23a7c712f9</ns6:CustomerAppID>
            <ns6:ConversationID>387240111199990982345</ns6:ConversationID>
            <ns6:MessageID>387240111199990982345</ns6:MessageID>
            <ns6:TimeStamp>2022-10-18T17:00:00.000Z</ns6:TimeStamp>
         </ns6:Identification>
      </ns6:SabreHeader>
      <ns9:Security xmlns:ns6="http://services.sabre.com/STL_Header/v02_01" xmlns:ns9="http://schemas.xmlsoap.org/ws/2002/12/secext"/>
      <wsse:Security>
         <wsse:UsernameToken>
            <wsse:Username>V1:cmxetpd:CAE Products:ET</wsse:Username>
            <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">950SWhFX</wsse:Password>
         </wsse:UsernameToken>
      </wsse:Security>
    </s:Header>
    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
        <GetCrewScheduleRQ xmlns="http://stl.sabre.com/AirCrews/CrewManager10/CrewRosterService/v10">
            <CrewRosterDataSelection rosteredAttributesInd="false" activityStatisticsInd="false" accommodationInd="false" transportInd="false" breakTimeInd="false" rulesFdcInd="false" 
			restExtensionInd="false" xmlns="http://stl.sabre.com/AirCrews/CrewManager10/CommonDataTypes/v10" />
         <PairingDataSelection customAttributesInd="false" xmlns="http://stl.sabre.com/AirCrews/CrewManager10/CommonDataTypes/v10">
                <DutyDataSelection customAttributesInd="false">
                    <ActivityDataSelection fleetCodesInd="false" />
                </DutyDataSelection>
            </PairingDataSelection>
           
            <StaffNumbers xmlns="http://stl.sabre.com/AirCrews/CrewManager10/CommonDataTypes/v10">
               <StaffNumber>${empID}</StaffNumber>
            </StaffNumbers>
	  <RosterFilter rosterType="BOTH" rangeStrategy="STARTS_WITHIN">
        <DateTimeRange xmlns="http://stl.sabre.com/AirCrews/CrewManager10/CommonDataTypes/v10" endDate="${formattedEndeDate}T23:59:00.000Z" startDate="${formattedStartDate}T00:00:00.000Z"/>
      </RosterFilter>
         
        </GetCrewScheduleRQ>
    </s:Body>
</s:Envelope>`;

//console.log(requestData);
const response = await axios.post(baseURL + 'streaming', requestData, { headers });
const responseData = response.data;

xml2js.parseString(responseData, { explicitArray: false, mergeAttrs: true }, (err, result) => {
  if (err) throw err;

  // Function to find a nested object by its key, irrespective of namespace
  const findNestedObjectByKey = (obj, keyToFind) => {
    if (!obj || typeof obj !== 'object') {
      return null;
    }
    for (const key in obj) {
      if (key.includes(keyToFind)) {
        return obj[key];
      }
      const nestedObj = findNestedObjectByKey(obj[key], keyToFind);
      if (nestedObj) {
        return nestedObj;
      }
    }
    return null;
  };

  try {
    const envelope = findNestedObjectByKey(result, 'Envelope');
    if (!envelope) throw new Error('Envelope not found');

    const body = findNestedObjectByKey(envelope, 'Body');
    if (!body) throw new Error('Body not found');

    const getCrewScheduleRS = findNestedObjectByKey(body, 'GetCrewScheduleRS');
    if (!getCrewScheduleRS) throw new Error('GetCrewScheduleRS not found');

    const pairings = findNestedObjectByKey(getCrewScheduleRS, 'Pairings');
    if (!pairings) throw new Error('Pairings not found');

    const pairingList = pairings['ns11:Pairing'] || pairings['Pairing'];
    if (!pairingList) throw new Error('Pairing list not found');

    const flightLegs = getCrewScheduleRS['ns11:FlightLegs'] || getCrewScheduleRS['FlightLegs'];
    const flightLegList = flightLegs ? (flightLegs['ns11:FlightLeg'] || flightLegs['FlightLeg']) : [];

    // Extract FlightLeg and NonOperationalActivity data
    const flightLegData = [];
    const nonOperationalActivityData = [];

    pairingList.forEach(pairing => {
      const duties = pairing['ns11:Duties'] || pairing['Duties'];
      if (duties) {
        const dutyList = duties['ns11:Duty'] || duties['Duty'];
        if (dutyList) {
          const activities = dutyList['ns11:Activities'] || dutyList['Activities'];
          if (activities) {
            const activityAccumulator = activities['ns11:ActivityAccumulator'] || activities['ActivityAccumulator'];
            if (Array.isArray(activityAccumulator)) {
              activityAccumulator.forEach(activity => {
                if (activity['ns11:NonOperationalActivity']) {
                  nonOperationalActivityData.push(activity['ns11:NonOperationalActivity']);
                }
                if (activity['ns11:FlyingActivity']) {
                  flightLegData.push(activity['ns11:FlyingActivity']);
                }
              });
            }
          }
        }
      }
    });



    // Format and display data
    const formattedFlightLegData = flightLegList.length ? formatFlightLegData(flightLegList.sort((a, b) => {
      const dateA = new Date((a['ns11:FlightKey'] && a['ns11:FlightKey'].flightDate) || '9999-12-31');
      const dateB = new Date((b['ns11:FlightKey'] && b['ns11:FlightKey'].flightDate) || '9999-12-31');
      return dateA - dateB;
    })) : 'No FlightLeg data available.';

    const formattedNonOperationalActivityData = nonOperationalActivityData.length ? formatNonOperationalActivityData(nonOperationalActivityData) : 'No NonOperationalActivity data available.';


EmployeeRoster += 'FlightLeg Data:\n' + formattedFlightLegData;
EmployeeRoster += '\n---------------------------------------------------------------\n';
EmployeeRoster += 'Non Operational Activity:\n' + formattedNonOperationalActivityData;


  } catch (error) {
   EmployeeRoster = 'You have no assigned tasks for the day. Please feel free to relax and enjoy your day!\n\nThe New Spirit of Africa\nwww.ethiopianairlines.com';
  }
});


console.log(EmployeeRoster);
return EmployeeRoster;

}

    // Function to format FlightLeg data
    const formatFlightLegData = (data) => {
      return data.map(item => {
        const flightKey = item['ns11:FlightKey'] || {};
        return `
        ---------------------------------------------------------------
          Flight Number:         ${flightKey.flightNumber ?? "N/A"}
          Flight Date:           ${flightKey.flightDate ?? "N/A"}
          Departure Airport:     ${item.departureAirportCode ?? "N/A"}
          Arrival Airport:       ${item.arrivalAirportCode ?? "N/A"}
          Block Time:            ${item.blockTime ?? "N/A"}
        `.trim();
      }).join('\n\n');
    };

    // Function to format NonOperationalActivity data
    const formatNonOperationalActivityData = (data) => {
      return data.map(item => {
        return `
        ---------------------------------------------------------------
          Activity Type:         ${item.activityTypeCode ?? "N/A"}
          Activity Code:         ${item.activityId ?? "N/A"}
          Description:           ${item.type ?? "N/A"}
          Start Time:            ${formatDateString(item.actualStartTimeLoc ?? "N/A")}
          End Time:              ${formatDateString(item.actualEndTimeLoc ?? "N/A")}
          Location:              ${item.startAirportCode ?? "N/A"}
        `.trim();
      }).join('\n\n');
    };

    

const formatDateString = (dateString) => {
  if (dateString === "N/A") {
    return dateString;
  }
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


//GetCrewRoster('00013682','10');


module.exports = { GetCrewRoster };