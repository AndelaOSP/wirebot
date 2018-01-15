const isDateValid = entered_date => {
  return /((0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-(\d\d))/.test(entered_date);
};

const isDateFuture = entered_date => {
  entered_date_as_array = entered_date.split("-");

  date_starting_with_month =
    entered_date_as_array[1] +
    "-" +
    entered_date_as_array[0] +
    "-" +
    entered_date_as_array[2];

  formatted_entered_date = new Date(date_starting_with_month);

  date_today = new Date();

  if (formatted_entered_date > date_today) {
    return true;
  } else {
    return false;
  }
};

module.exports = {
  isDateValid,
  isDateFuture
};
