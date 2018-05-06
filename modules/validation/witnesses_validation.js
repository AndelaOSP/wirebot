const isWitnessValid = entered_witnesses => {
  let entered_witnesses_array = entered_witnesses.split(' ');

  let regex_test_result_array = [];

  entered_witnesses_array.forEach(entered_witness => {
    entered_witness = entered_witness.trim();

    regex_test_result_array.push(/^<@[A-Z0-9]*>$/.test(entered_witness));
  });

  if (regex_test_result_array.includes(false) === true) {
    return false;
  } else {
    return true;
  }
};

module.exports = {
  isWitnessValid
};
