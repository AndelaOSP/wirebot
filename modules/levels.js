const levelId = entered_level => {
  if (entered_level === 'red') {
    return 1;
  } else if (entered_level === 'yellow') {
    return 2;
  } else {
    return 3;
  }
};

module.exports = {
  levelId
};
