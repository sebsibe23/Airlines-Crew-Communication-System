const axios = require('axios');
const xml2js = require('xml2js');
const { format } = require('date-fns');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const { flightNumber, startDT, departureAirport } = req.body;

    if (!flightNumber || !startDT || !departureAirport) {
        return res.status(400).send('Missing required parameters');
    }

    try {
        const crewList = await getCrewOnBoard(flightNumber, startDT, departureAirport);
        res.send(crewList);
    } catch (error) {
        console.error("Error fetching crew list:", error);
        res.status(500).send('Internal Server Error');
    }
});

async function getCrewOnBoard(flightNumber, startDT, departureAirport) {
    const departureTime = format(new Date(startDT), 'ddMMMyyyy').toUpperCase();
    const baseURL = 'https://bus.eu-west-1.flightservices.cae.com/';
    let crewd = '';

    const requestData = `
    <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
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
                    <GenericSearch>Leg(flightNumber;equals;${flightNumber}):Leg(departureAirport;is;${departureAirport}):Leg(flightDate;equals;${departureTime})</GenericSearch>
                </GenericQuery>
            </GetCrewOnFlightRQ>
        </s:Body>
    </s:Envelope>`;

   // console.log("Request Payload:", requestData); // Debugging the request payload

    try {
        const response = await axios.post(`${baseURL}streaming`, requestData, {
            headers: {
                'Content-Type': 'text/xml',
                'User-Agent': 'HTTPie'
            }
        });

        //console.log("Response Data:", response.data); // Log the full response data

        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(response.data);

       // console.log("Parsed Response:", result); // Log the parsed response

        const ns11 = 'http://stl.sabre.com/AirCrews/CrewManager10/CommonDataTypes/v10';
        const ns17 = 'http://stl.sabre.com/AirCrews/CrewManager10/CrewRosterService/v10';

        const crewOB = result['ns10:Envelope']['ns10:Body'][0]['ns17:GetCrewOnFlightRS'][0]['ns11:CrewList'][0]['ns11:Crew'];
        let varFlightData = [];

        crewOB.forEach(crew => {
            const staffNumber = crew.$.staffNumber;
            const firstName = crew['ns11:CrewPersonalInfo'][0].$.firstName;
            const crewOnFlight = result['ns10:Envelope']['ns10:Body'][0]['ns17:GetCrewOnFlightRS'][0]['ns17:CrewOnFlightList'][0]['ns17:CrewOnFlight'].find(x => x.$.staffNumber === staffNumber);
            const rank = crewOnFlight.$.actingPositionCode;

            varFlightData.push({ CrewID: staffNumber, FirstName: firstName, CrewCat: rank });
        });

        varFlightData.sort((a, b) => a.CrewID.localeCompare(b.CrewID));

        varFlightData.forEach(item => {
            crewd += `||${item.CrewID} ${item.FirstName} ${item.CrewCat}=------------------------------------`;
        });

        crewd = crewd.replace(/\|\|/g, '\r\n').replace(/=/g, '\r\n');
        return crewd;
    } catch (error) {
        console.error("Error:", error);
        return 'Sorry no Crew list found';
    }
}


module.exports = router;
module.exports.getCrewOnBoard = getCrewOnBoard;