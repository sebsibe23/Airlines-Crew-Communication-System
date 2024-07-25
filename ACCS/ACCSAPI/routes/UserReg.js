const axios = require('axios');
const { parseStringPromise } = require('xml2js');
const sql = require('mssql');
const db  = require('../config/database');

async function botReg(STRempID, txtMsg, strchatId, strTEL_USERNAME) {
  let sendMSG = "";
  console.log("bot" ,txtMsg ," " ,strchatId," " ,strTEL_USERNAME	);
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
     <cmx:CrewDataSelection crewAttributesInd="true" crewBirthInformationInd="true" crewCompanyAssignmentsInd="true" crewEmailsInd="true" crewEmergencyContactsInd="true" crewEmploymentInfoInd="true" crewEntitlementInd="true" crewFamilyMembersInd="true" crewFlyCountriesInd="true" crewFlyTogetherInd="true" crewNoFlyTogetherInd="true" crewPersonalInfoInd="true" crewProfileInd="true" crewSeniorityInd="true" rosterPeriodPublishedInd="true">
            <cmx:CrewBasesInd endDate="2022-10-01T23:59:00" startDate="2022-01-01T00:00:00">true</cmx:CrewBasesInd>
            <cmx:CrewFleetsInd endDate="2022-10-01T23:59:00" startDate="2022-01-01T00:00:00">true</cmx:CrewFleetsInd>
            <cmx:CrewRanksInd endDate="2022-10-01T23:59:00" startDate="2022-01-01T00:00:00">true</cmx:CrewRanksInd>
            <cmx:CrewDocumentsInd endDate="2022-10-01T23:59:00" startDate="2022-01-01T00:00:00">true</cmx:CrewDocumentsInd>
            <cmx:CrewQualSelection endDate="2022-10-01T23:59:00" includeProjections="true" includeRecency="true" includeSimProjections="true" includeSimRecency="true" startDate="2022-01-01T00:00:00">true</cmx:CrewQualSelection>
            <cmx:CrewEmploymentStatusesInd endDate="2025-10-01T23:59:00" startDate="2022-01-01T00:00:00">true</cmx:CrewEmploymentStatusesInd>
            <cmx:CrewPhonesInd endDate="2022-10-01T23:59:00" startDate="2022-01-01T00:00:00">true</cmx:CrewPhonesInd>
            <cmx:CrewAddressesInd endDate="2022-10-01T23:59:00" startDate="2022-01-01T00:00:00">true</cmx:CrewAddressesInd>
            <cmx:CrewCountryRestrctnsInd endDate="2022-10-01T23:59:00" startDate="2022-01-01T00:00:00">true</cmx:CrewCountryRestrctnsInd>
            <cmx:CrewPortRestrictionsInd endDate="2022-10-01T23:59:00" startDate="2022-01-01T00:00:00">true</cmx:CrewPortRestrictionsInd>
            <cmx:CrewContractsInd endDate="2022-10-01T23:59:00" startDate="2022-01-01T00:00:00">true</cmx:CrewContractsInd>
            <cmx:CrewFunctionsInd endDate="2022-10-01T23:59:00" startDate="2022-01-01T00:00:00">true</cmx:CrewFunctionsInd>
            <cmx:CrewTeamsInd endDate="2022-10-01T23:59:00" startDate="2022-01-01T00:00:00">true</cmx:CrewTeamsInd>
         </cmx:CrewDataSelection>
         <cmx:GenericQuery endDateTimeRange="2030-01-01T00:00:00" startDateTimeRange="2013-10-01T23:59:00">
            <cmx:GenericSearch>Crew(CREW_MOBILE_NUMBER;is;${STRempID})</cmx:GenericSearch>
         </cmx:GenericQuery>
</cmxcs:GetCrewsRQ>
</soap:Body></soap:Envelope>`;

    try {
        const response = await axios.post(baseURL + 'streaming', requestData, { headers });
        const responseData = response.data;

        const parsedData = await parseStringPromise(responseData, { explicitArray: false, ignoreAttrs: false });
        /*const crewDetails = extractCrewDetails(parsedData);

        const formattedCrewDetails = formatCrewDetails(crewDetails);
        console.log('formattedCrewDetails', formattedCrewDetails); */

          const crewPath = getDynamicNamespacePath(parsedData, 'Envelope.Body.GetCrewsRS.CrewList.Crew');

  if (!crewPath) {
            sendMSG = '\n\nWe inform you that, based on the current data, you are ineligible for the Ethiopian Airlines flying crew telegram bot.';
            sendMSG += '\nKindly send the screenshot and your ID number.';
            sendMSG += '\nFor cockpit crew, please contact the Flight OPS HR team. For Cabin crew, please contact your respective Unit leader.';
            sendMSG += '\nWe apologize for the inconvenience!';
            sendMSG += '\n\nThe New Spirit of Africa\nwww.ethiopianairlines.com';

      
  }else{
  const crew = crewPath;
  const staffNumber = crew["$"]?.["staffNumber"] ?? "N/A";

  const birthDate = crew["ns11:CrewBirthInformation"]?.["$"]?.["birthDate"] ?? "N/A";
  
   const currentDate = new Date().toISOString();

  const rankCodes = crew["ns11:CrewRanks"]?.["ns11:CrewRank"]
    ?.filter(rank => {
      const effectiveDate = rank["$"]?.["effectiveDate"];
      const expiryDate = rank["$"]?.["expiryDate"];
      return effectiveDate && expiryDate && effectiveDate <= currentDate && expiryDate >= currentDate;
    })
    ?.map(rank => rank["ns11:RankKey"]?.["$"]?.["rankCode"]) ?? [];
  
  const crewPhone = crew["ns11:CrewPhones"]?.["ns11:CrewPhone"]?._ ?? "N/A";
   const passports = crew["ns11:CrewDocuments"]?.["ns11:CrewDocument"]
    ?.filter(doc => doc["$"]?.["documentType"] === "Passport")
    ?.map(doc => doc["$"]?.["documentNumber"]) ?? [];
    const firstName = crew["ns11:CrewPersonalInfo"]?.["$"]?.["firstName"] ?? "N/A";
    
     await new Promise((resolve, reject) => {
        db.query('INSERT INTO CrewSchedulingOffice_bot_UserDetail (crewcat, CrewQual, EMPNO, logtime, phone, text, chatId, empsign, RECID, TEL_USERNAME) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
          rankCodes,
          '',
          staffNumber,
          new Date(),
          crewPhone,
          txtMsg,
          strchatId,
          '',
          rankCodes + passports + firstName + birthDate + crewPhone,
          strTEL_USERNAME], (err) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              sendMSG = '\nCongratulations on joining the ACCS Bot as the newest member!';
              resolve();
            }
        });
      });
    }

  } catch (error) {
    console.error('Error occurred:', error);
    sendMSG = "An error occurred while processing your request. Please try again later.";
  }
  return sendMSG;
}
/*
const connection = db;
    db.query('INSERT INTO CrewSchedulingOffice_bot_UserDetail (crewcat, CrewQual,  EMPNO, logtime,  phone, text, chatId,  empsign, RECID,TEL_USERNAME) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    rankCodes,
      '',
      staffNumber,
      new Date(),
      crewPhone,
      txtMsg,
      strchatId,
      '',
      rankCodes + passports + firstName + birthDate + crewPhone,
      strTEL_USERNAME], (err) => {
    if (err) {
      console.error(err);
    }

     sendMSG ='\nCongratulations on joining the ACCS Bot as the newest member!';
  });
}

    } catch (error) {
        console.error('Error occurred:', error);
        throw error;
    }
    return sendMSG;
}


*/
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

const extractCrewDetails = (data) => {
  const crewPath = getDynamicNamespacePath(data, 'Envelope.Body.GetCrewsRS.CrewList.Crew');

  if (!crewPath) {
    console.error("No crew data found.");
    return null;
  }

  const crew = crewPath;

  const firstName = crew["ns11:CrewPersonalInfo"]?.["$"]?.["firstName"] ?? "N/A";
  const lastName = crew["ns11:CrewPersonalInfo"]?.["$"]?.["lastName"] ?? "N/A";
  const birthDate = crew["ns11:CrewBirthInformation"]?.["$"]?.["birthDate"] ?? "N/A";
  
  const rankCodes = crew["ns11:CrewRanks"]?.["ns11:CrewRank"]?.map(rank => rank["ns11:RankKey"]?.["$"]?.["rankCode"]) ?? [];
  
  const crewPhone = crew["ns11:CrewPhones"]?.["ns11:CrewPhone"]?._ ?? "N/A";
  
  const passports = crew["ns11:CrewDocuments"]?.["ns11:CrewDocument"]
    ?.filter(doc => doc["$"]?.["documentType"] === "Passport")
    ?.map(doc => doc["$"]?.["documentNumber"]) ?? [];

  const employmentDate = crew["ns11:CrewEmploymentInfo"]?.["$"]?.["employmentDate"] ?? "N/A";
  const gender = crew["ns11:CrewPersonalInfo"]?.["$"]?.["gender"] ?? "N/A";
  const countryOfResidence = crew["ns11:CrewPersonalInfo"]?.["$"]?.["countryOfResidence"] ?? "N/A";
  const companyCode = crew["ns11:CrewBases"]?.["ns11:CrewBase"]?.["$"]?.["companyCode"] ?? "N/A";
  const seniorityNumber = crew["ns11:CrewSeniority"]?.["$"]?.["seniorityNumber"] ?? "N/A";
  const hireDate = crew["ns11:CrewSeniority"]?.["$"]?.["hireDate"] ?? "N/A";
  
  const crewDocuments = crew["ns11:CrewDocuments"]?.["ns11:CrewDocument"]?.map(doc => {
    const docDetails = doc["$"];
    return {
      documentType: docDetails?.documentType ?? "N/A",
      firstName: docDetails?.firstName ?? "N/A",
      lastName: docDetails?.lastName ?? "N/A",
      documentNumber: docDetails?.documentNumber ?? "N/A",
      issueCountryCode: docDetails?.issueCountryCode ?? "N/A",
      issuePlace: docDetails?.issuePlace ?? "N/A",
      issueDate: docDetails?.issueDate ?? "N/A",
      effectiveDate: docDetails?.effectiveDate ?? "N/A",
      expiryDate: docDetails?.expiryDate ?? "N/A",
      issuingAuthority: docDetails?.issuingAuthority ?? "N/A",
      documentReferenceNumber: docDetails?.documentReferenceNumber ?? "N/A",
      priority: docDetails?.priority ?? "N/A",
      nationality: docDetails?.nationality ?? "N/A"
    };
  }) ?? [];

  return {
    firstName,
    lastName,
    birthDate,
    rankCodes,
    crewPhone,
    passports,
    employmentDate,
    gender,
    countryOfResidence,
    companyCode,
    seniorityNumber,
    hireDate,
    crewDocuments
  };
};

const formatCrewDetails = (crewDetails) => {
  if (!crewDetails) {
    return "No crew details available.";
  }

  const formattedDetails = `
    First Name: ${crewDetails.firstName}
    Last Name: ${crewDetails.lastName}
    Birth Date: ${crewDetails.birthDate}
    Rank Codes: ${crewDetails.rankCodes.join(', ')}
    Crew Phone: ${crewDetails.crewPhone}
    Passports: ${crewDetails.passports.join(', ')}
    Employment Date: ${crewDetails.employmentDate}
    Gender: ${crewDetails.gender}
    Country of Residence: ${crewDetails.countryOfResidence}
    Company Code: ${crewDetails.companyCode}
    Seniority Number: ${crewDetails.seniorityNumber}
    Hire Date: ${crewDetails.hireDate}
    Crew Documents:
      ${crewDetails.crewDocuments.map(doc => `
        Document Type: ${doc.documentType}
        First Name: ${doc.firstName}
        Last Name: ${doc.lastName}
        Document Number: ${doc.documentNumber}
        Issue Country Code: ${doc.issueCountryCode}
        Issue Place: ${doc.issuePlace}
        Issue Date: ${doc.issueDate}
        Effective Date: ${doc.effectiveDate}
        Expiry Date: ${doc.expiryDate}
        Issuing Authority: ${doc.issuingAuthority}
        Document Reference Number: ${doc.documentReferenceNumber ?? "N/A"}
        Priority: ${doc.priority ?? "N/A"}
        Nationality: ${doc.nationality ?? "N/A"}
      `).join('\n')}
  `;

  return formattedDetails.trim();
};

module.exports.botReg = botReg;
