const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = require('assert');
const app = require('../../app');
const jwt = require('jsonwebtoken');
const jwtSecret = "NeverGonnaGiveYouUp"
const jwtWrongSecret = "NeverGonnaLetYouDown"


const getWrongToken = (id) => {
    return jwt.sign({
        id: id}, jwtWrongSecret);
}

const getValidToken = (id) => {
    return jwt.sign({
        id: id}, jwtSecret);
}

chai.use(chaiHttp);

chai.should();

describe('Profile', () => {

    it('TC-203-1 Ongeldig token', done => {
        chai
            .request(app)
            .get('/api/user/profile')
            .set({"Authorization": "Bearer " + getWrongToken(1)})
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('401');
                message.should.be.a('string').that.equal('Unauthorized');
                data.should.be.a('object').that.is.empty;

                done();
            });

    });
    it('TC-203-2 Gebruiker is ingelogd met geldig token.', done => {
        chai
            .request(app)
            .get('/api/user/profile')
            .set({"Authorization": "Bearer " + getValidToken(1)})
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('200');
                message.should.be.a('string').that.equal('Success');
                data.should.be.a('object');
                data.should.have.property('id').eql(1);
                data.should.have.property('firstName').eql('John');
                data.should.have.property('lastName').eql('Doe');
                data.should.have.property('street').eql('Main Street 1');
                data.should.have.property('city').eql('New York');
                data.should.have.property('isActive').eql(true);
                data.should.have.property('email').eql('john@avans.nl');
                data.should.have.property('password').eql('1234');
                data.should.have.property('phoneNumber').eql('0612345678');

                done();
            });
    });
});