const isLocationValid = entered_location => {
  entered_location = entered_location.split(",");

  if (entered_location.length < 3) {
    return false;
  } else {
    return true;
  }

  entered_location.forEach(location => {
    location = location.trim();

    if (/^[\w'\-]*/.test(location) === false) {
      return false;
    } else {
      return true;
    }
  });
};

module.exports = {
  isLocationValid
};
