const isLocationValid = entered_location => {
  entered_location = entered_location.split(',');

  if (entered_location.length !== 3) {
    return false;
  }

  entered_location.forEach(location => {
    location = location.trim();

    return /^[\w'\-]*/.test(location); // eslint-disable-line no-useless-escape
  });
};

module.exports = {
  isLocationValid
};
