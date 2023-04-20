const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../../app');

chai.use(chaiHttp);

chai.should();

describe('Profile', () => {
    it('TC-203-1 Ongeldig token', done => {
        chai
            .request(app)
            .get('/api/user/profile')
            .set({"Authorization": `Bearer a`})
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('401');
                res.body.should.have.property('message').eql('Unauthorized');
                res.body.should.have.property('data');
                done();
            });

    });
    it('TC-203-2 Gebruiker is ingelogd met geldig token.', done => {
        chai
            .request(app)
            .get('/api/user/profile')
            .set({"Authorization": `Bearer testtoken1`})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('200');
                res.body.should.have.property('message').eql('Success, user profile found');
                res.body.should.have.property('data');
                res.body.data.should.have.property('token').eql('testtoken1');
                res.body.data.should.have.property('id').eql(1);
                res.body.data.should.have.property('firstName').eql('John');
                res.body.data.should.have.property('lastName').eql('Doe');
                res.body.data.should.have.property('email').eql('john@avans.nl');
                res.body.data.should.have.property('street').eql('Main Street 1');
                res.body.data.should.have.property('city').eql('New York');
                res.body.data.should.have.property('isActive').eql(true);
                res.body.data.should.have.property('password').eql('1234');
                res.body.data.should.have.property('phoneNumber').eql('0612345678');
                done();
            });
    });
});