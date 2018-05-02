const isDescriptionAdequate = entered_description => {
  return entered_description.split(' ').length > 3;
};

module.exports = {
  isDescriptionAdequate
};
