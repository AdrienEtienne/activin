'use strict';

var app = require('../..');
import request from 'supertest';

var newMySport;

describe('MySport API:', function() {

  describe('GET /api/mySports', function() {
    var mySports;

    beforeEach(function(done) {
      request(app)
        .get('/api/mySports')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          mySports = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      mySports.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/mySports', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/mySports')
        .send({
          name: 'New MySport',
          info: 'This is the brand new mySport!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newMySport = res.body;
          done();
        });
    });

    it('should respond with the newly created mySport', function() {
      newMySport.name.should.equal('New MySport');
      newMySport.info.should.equal('This is the brand new mySport!!!');
    });

  });

  describe('GET /api/mySports/:id', function() {
    var mySport;

    beforeEach(function(done) {
      request(app)
        .get('/api/mySports/' + newMySport._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          mySport = res.body;
          done();
        });
    });

    afterEach(function() {
      mySport = {};
    });

    it('should respond with the requested mySport', function() {
      mySport.name.should.equal('New MySport');
      mySport.info.should.equal('This is the brand new mySport!!!');
    });

  });

  describe('PUT /api/mySports/:id', function() {
    var updatedMySport;

    beforeEach(function(done) {
      request(app)
        .put('/api/mySports/' + newMySport._id)
        .send({
          name: 'Updated MySport',
          info: 'This is the updated mySport!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedMySport = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedMySport = {};
    });

    it('should respond with the updated mySport', function() {
      updatedMySport.name.should.equal('Updated MySport');
      updatedMySport.info.should.equal('This is the updated mySport!!!');
    });

  });

  describe('DELETE /api/mySports/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/mySports/' + newMySport._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when mySport does not exist', function(done) {
      request(app)
        .delete('/api/mySports/' + newMySport._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
