'use strict';

import errors from './index';

describe('Components: Errors', function () {
  var req;
  var res, status, filePath, obj, err, html, sended, result;

  beforeEach(function () {
    req = {};
    res = {
      status: function (state) {
        status = state;
      },
      render: function (_filePath, _obj, cb) {
        filePath = filePath;
        obj = _obj;
        cb(err, html);
      },
      json: function (_result, _status) {
        result = _result;
        status = _status;
      },
      send: function (_sended) {
        sended = _sended;
      }
    }
  });

  it('should send the html', function () {
    html = 'toto';
    errors[404](req, res);
    sended.should.equal(html);
  });

  it('should return an error', function () {
    err = new Error('error');
    errors[404](req, res);
    result.should.deep.equal({
      status: 404
    });
  });

});