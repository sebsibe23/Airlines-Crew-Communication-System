const axios = require('axios');
const { parseStringPromise } = require('xml2js');
const sql = require('mssql');
const dbConfig = require('../config/database');
const { format, addDays } = require('date-fns');

// This function retrieves crew details and qualifications based on the employee ID
async function CrewNameAndqual(STRempID) {
    const today = new Date();
    const formattedStartDate = format(today, 'yyyy-MM-dd');

    const baseURL = 'https://bus.eu-west-1.flightservices.cae.com/';
    const headers = {
        'Content-Type': 'text/xml',
        'User-Agent': 'HTTPie'
    };

    const requestData = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
   <soap:Header>
      <ns6:SabreHeader xmlns:ns6="http://services.sabre.com/STL_Header/v02_02" xmlns:ns9="http://schemas.xmlsoap.org/ws/2002/12/secext">
         <ns6:Service operation="GetCrews" ttl="100" version="10.0.0">CrewService</ns6:Service>
         <ns6:Identification>
            <ns6:CustomerID>ET</ns6:CustomerID>
            <ns6:CustomerAppID>SWS1:CAE-CrMgrCTB:8c121e9b86</ns6:CustomerAppID>
            <ns6:ConversationID>38724011119999109811111</ns6:ConversationID>
            <ns6:MessageID>38724011119999098111</ns6:MessageID>
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
<cmxcs:GetCrewsRQ version="1" xmlns:cmx="http://stl.sabre.com/AirCrews/CrewManager10/CommonDataTypes/v10" xmlns:cmxcs="http://stl.sabre.com/AirCrews/CrewManager10/CrewService/v10" xmlns:p="http://services.sabre.com/sp/cmm/types/v01_00" xmlns:p1="http://services.sabre.com/STL_Payload/v02_02" xmlns:p2="http://services.sabre.com/STL_MessageCommon/v02_02" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://stl.sabre.com/AirCrews/CrewManager10/CrewService/v10 CrewService-10.0.0.xsd ">
     <cmx:CrewDataSelection crewAttributesInd="false" crewBirthInformationInd="false" crewCompanyAssignmentsInd="false" crewEmailsInd="false" crewEmergencyContactsInd="false" crewEmploymentInfoInd="false" crewEntitlementInd="false" crewFamilyMembersInd="false" crewFlyCountriesInd="false" crewFlyTogetherInd="false" crewNoFlyTogetherInd="false" crewPersonalInfoInd="true" crewProfileInd="false" crewSeniorityInd="false" rosterPeriodPublishedInd="false">
            <cmx:CrewFleetsInd  startDate="${formattedStartDate}T00:00:00">true</cmx:CrewFleetsInd>
    
         </cmx:CrewDataSelection>
           <cmx:StaffNumbers>
            <cmx:StaffNumber>${STRempID}</cmx:StaffNumber>
         </cmx:StaffNumbers>
</cmxcs:GetCrewsRQ>
</soap:Body></soap:Envelope>`;

    //console.log(requestData);

    try {
        const response = await axios.post(baseURL + 'streaming', requestData, { headers });
        const responseData = response.data;

        const parsedData = await parseStringPromise(responseData, { explicitArray: false, ignoreAttrs: false });
       // console.log('Parsed JSON:', JSON.stringify(parsedData, null, 2));

        const crewDetails = extractCrewDetails(parsedData);

        const formattedCrewDetails = formatCrewDetails(crewDetails);
        console.log(formattedCrewDetails);
        return formattedCrewDetails;

    } catch (error) {
        console.error('Error occurred:', error);
        throw error;
    }
}

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

const ensureArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }
    if (value !== undefined && value !== null) {
        return [value];
    }
    return [];
};

const ensureValue = (value) => {
    return value !== undefined && value !== null ? value : "N/A";
};

const extractCrewDetails = (data) => {
   // console.log("Extracting crew details from:", JSON.stringify(data, null, 2));
    
    const crewPath = getDynamicNamespacePath(data, 'Envelope.Body.GetCrewsRS.CrewList.Crew');

    if (!crewPath) {
        console.error("No crew data found.");
        return null;
    }

    const crew = crewPath;

    const firstName = ensureValue(crew["ns11:CrewPersonalInfo"]?.["$"]?.["firstName"]);

    const currentDate = new Date().toISOString();

    const activeRankCodes = ensureArray(crew["ns11:CrewRanks"]?.["ns11:CrewRank"])
        .filter(rank => {
            const effectiveDate = rank["$"]?.["effectiveDate"];
            const expiryDate = rank["$"]?.["expiryDate"];
            return effectiveDate && expiryDate && effectiveDate <= currentDate && expiryDate >= currentDate;
        })
        .map(rank => ensureValue(rank["ns11:RankKey"]?.["$"]?.["rankCode"])) ?? [];

    const activeFleetCodes = ensureArray(crew["ns11:CrewFleets"]?.["ns11:CrewFleet"])
        .filter(fleet => {
            const effectiveDate = fleet["$"]?.["effectiveDate"];
            const expiryDate = fleet["$"]?.["expiryDate"];
            return effectiveDate && expiryDate && effectiveDate <= currentDate && expiryDate >= currentDate;
        })
        .map(fleet => ensureValue(fleet["ns11:FleetKey"]?.["$"]?.["fleetCode"])) ?? [];
        
    return {
        firstName,
        activeRankCodes,
        activeFleetCodes,
    };
};

const formatCrewDetails = (crewDetails) => {
    if (!crewDetails) {
        return "No crew details available.";
    }

    const formattedDetails = `${crewDetails.firstName}| ${crewDetails.activeRankCodes.length > 0 ? crewDetails.activeRankCodes.join(', ') : "N/A"}| ${crewDetails.activeFleetCodes.length > 0 ? crewDetails.activeFleetCodes.join(', ') : "N/A"}`;

    return formattedDetails.trim();
};

//CrewNameAndqual('00029978');

module.exports.CrewNameAndqual = CrewNameAndqual;
