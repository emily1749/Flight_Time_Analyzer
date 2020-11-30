const chai = require('chai');
const chaiHttp = require('chai-http');

var { describe, it } = require('mocha');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Testing the server', () => {
  it('Tests the base route and returns status', done => {
    chai
      .request('http://localhost:5000')
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

describe('Testing the Wait Times endpoint', () => {
  it('Tests the Wait Times and returns status', done => {
    // this.timeout(0);
    chai
      .request('http://localhost:5000/waitTimes')
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        expect(res.body.message).to.equals('On the Wait Times page');
        done();
      });
  });

  it("Test to get an airport's security wait times data", done => {
    chai
      .request('http://localhost:5000/waitTimes')
      .get('/sfo')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        done();
      });
  }).timeout(0);

  it('Tests the status for invalid airport input', done => {
    chai
      .request('http://localhost:5000/waitTimes')
      .get('/test')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});
