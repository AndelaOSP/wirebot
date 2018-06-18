const incidentHandlerVerification = (incidentLocation) => {
  const incidentCountry = incidentLocation.split(',')[2].trim().toUpperCase();

  if (incidentCountry === 'USA') {
    return 'New York'; 
  } else if (incidentCountry === 'KENYA') {
    return 'Nairobi';
  } else if (incidentCountry === 'NIGERIA') {
    return 'Lagos';
  } else {
    return 'Kampala';
  }
};

module.exports = {
  incidentHandlerVerification
};
