import {
  describe,
  it,
  expect,
  moment,
  isDateFuture,
  isDateValid,
  isDescriptionAdequate,
  isLocationValid
} from '../helpers';

describe('Validations:', () => {
  describe('Date:', () => {
    describe('isDateValid:', () => {
      it('should check the validity of a date', () => {
        expect(isDateValid('25-01-17')).true;
        expect(isDateValid('25-44-1998')).false;
      });
    });
    describe('isDateFuture:', () => {
      it('should validate that a date is in the future', () => {
        const futureDate = moment().add(1, 'day').format('DD-MM-YY');
        const pastDate = moment().subtract(1, 'day').format('DD-MM-YY');
        expect(isDateFuture(futureDate)).true;
        expect(isDateFuture(pastDate)).false;
      });
    });
  });

  describe('Description:', () => {
    it('should validate that words in description is greater than 3', () => {
      expect(isDescriptionAdequate('A short description')).false;
      expect(isDescriptionAdequate('I had a altercation with Audu today')).true;
    });
  });

  describe('Location:', () => {
    it('should validate location entered', () => {
      expect(isLocationValid('h-ddd-')).false;
    });
  });
});
