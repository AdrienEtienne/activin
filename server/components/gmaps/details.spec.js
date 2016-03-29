'use strict';

import Details from './details';

describe('Components: Gmaps.Details', function () {
  var details;

  beforeEach(function () {
    details = new Details('id', 'name', 1, 2);
  })

  describe('getId()', function () {
    it('should return the placeid', function () {
      details.getId().should.equal(details.placeid);
    })
  });

  describe('getName()', function () {
    it('should return the name', function () {
      details.getName().should.equal(details.name);
    })
  });

  describe('getLocation()', function () {
    it('should return the location', function () {
      details.getLocation().should.deep.equal([1, 2]);
    })
  });
});
