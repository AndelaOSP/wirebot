const slackUserLocation = timezone => {
  let city = timezone.split('\/')[1]; // eslint-disable-line no-useless-escape

  switch(city) {
  case 'New_York':
    return {
      name: 'Office',
      centre: 'New York',
      country: 'USA'
    };
  case 'Algiers':
    return {
      name: 'Office',
      centre: 'EPIC Tower',
      country: 'Nigeria'
    };
  case 'Nairobi':
    return {
      name: 'Office',
      centre: 'St. Catherines',
      country: 'Kenya'
    };
  }
};

module.exports = {
  slackUserLocation
};
