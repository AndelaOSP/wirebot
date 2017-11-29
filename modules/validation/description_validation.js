const isDescriptionAdequate = entered_description => {
  entered_description = entered_description.split(" ");

  if (entered_description.length < 10) {
    return false;
  } else {
    return true;
  }
};

module.exports = {
  isDescriptionAdequate
};
