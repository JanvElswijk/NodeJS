const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../../app');
const {users} = require("../../user");
const assert = require('assert');

const jwt = require('jsonwebtoken');
const jwtSecret = 'NeverGonnaGiveYouUp'
const jwtWrongSecret = 'NeverGonnaLetYouDown'

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

describe('Userid', () => {
    it('TC-204-1 Ongeldig token', done => {
        //TODO Change to new way of testing
        chai
            .request(app)
            .get('/api/user/1')
            .set({"Authorization": `Bearer` + getWrongToken(1)})
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('401');
                res.body.should.have.property('message').eql('Unauthorized, invalid token');
                res.body.should.have.property('data');
                res.body.data.should.be.empty;
                done();
            });

    });
    it('TC-204-2 Gebruiker-ID bestaat niet', done => {
        chai
            .request(app)
            .get('/api/user/999999999999999999999999')
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('404');
                message.should.be.a('string').that.equal('User not found, no user with that id');
                data.should.be.a('object').that.is.empty;

                done();
            });
    });
    it('TC-204-3 Gebruiker-ID bestaat', done => {
        const user = users.find(user => user.id === 1)
        chai
            .request(app)
            .get('/api/user/1')
            .set({"Authorization": `Bearer ` + getValidToken(1)})
            .end((err, res) => {
                assert(err === null);

                //TODO Token check?

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('200');
                message.should.be.a('string').that.equal('Success, user with that id found');
                data.should.be.a('object');
                data.id.should.be.a('number').that.equal(user.id);
                data.firstName.should.be.a('string').that.equal(user.firstName);
                data.lastName.should.be.a('string').that.equal(user.lastName);
                data.street.should.be.a('string').that.equal(user.street);
                data.city.should.be.a('string').that.equal(user.city);
                data.isActive.should.be.a('boolean').that.equal(user.isActive);
                data.email.should.be.a('string').that.equal(user.email);
                data.phoneNumber.should.be.a('string').that.equal(user.phoneNumber);
                data.should.not.have.property('password');
                done();
            });
    });
    it('TC-205-1 Verplicht veld “emailAddress” ontbreekt', done => {
        chai
            .request(app)
            .put('/api/user/1')
            .set({"Authorization": "Bearer " + getValidToken(1)})
            .send({
                "firstName": "Test",
                "lastName": "Test",
                "password": "Test",
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('400');
                message.should.be.a('string').that.equal('Missing required field, email, edit failed');
                data.should.be.a('object').that.is.empty;

                done();
            });
    });
    it('TC-205-2 De gebruiker is niet de eigenaar van de data', done => {
        //TODO Rewrite

        chai
            .request(app)
            .put('/api/user/1')
            .set({"Authorization": "Bearer " + getValidToken(2)})
            .send({
                "firstName": "Test",
                "lastName": "Test",
                "password": "Testtest1!",
                "email": "test@test.test",
                "phoneNumber": "0612345678"
            })
            .end((err, res) => {
                res.should.have.status(403);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('403');
                res.body.should.have.property('message').eql('Forbidden');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.be.empty;
                done();
            });
    });
    it('TC-205-3 Niet-valide telefoonnummer', done => {
        chai
            .request(app)
            .put('/api/user/1')
            .set({"Authorization": "Bearer " + getValidToken(1)})
            .send({
                "firstName": "Test",
                "lastName": "Test",
                "password": "Testtest1!",
                "email": "test@test.test",
                "phoneNumber": "061234567"
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('400');
                message.should.be.a('string').that.equal('Phone number is not valid, edit failed');
                data.should.be.a('object').that.is.empty;

                done();
            });
    });
    it('TC-205-4 Gebruiker bestaat niet', done => {
        chai
            .request(app)
            .put('/api/user/999999999999999999999999')
            .send({
                "firstName": "Test",
                "lastName": "Test",
                "password": "Test",
                "email": "test@test.test",
                "phoneNumber": "0612345678"
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('404');
                message.should.be.a('string').that.equal('User not found, edit failed');
                data.should.be.a('object').that.is.empty;

                done();
            });
    });
    it('TC-205-5 Niet ingelogd', done => {
        //TODO Rewrite
        chai
            .request(app)
            .put('/api/user/1')
            .send({
                "firstName": "Test",
                "lastName": "Test",
                "password": "Testtest1!",
                "email": "test@test.test",
                "phoneNumber": "0612345678"
            })
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('401');
                res.body.should.have.property('message').eql('Unauthorized');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.be.empty;
                done();
            });
    });
    it('TC-205-6 Gebruiker succesvol gewijzigd', done => {
        chai
            .request(app)
            .put('/api/user/1')
            .set({"Authorization": "Bearer " + getValidToken(1)})
            .send({
                "firstName": "Test",
                "lastName": "Test",
                "password": "Testtest1!",
                "email": "test@test.test",
                "phoneNumber": "0612345678"
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('200');
                message.should.be.a('string').that.equal('User successfully edited');
                data.should.be.a('object');
                data.should.have.property('id').that.is.a('number').that.equal(1);
                data.should.have.property('firstName').that.is.a('string').that.equal('Test');
                data.should.have.property('lastName').that.is.a('string').that.equal('Test');
                data.should.have.property('email').that.is.a('string').that.equal('test@test.test');
                data.should.have.property('phoneNumber').that.is.a('string').that.equal('0612345678');
                done();
            });
    });
    it('TC-206-1 Gebruiker bestaat niet', done => {
        chai
            .request(app)
            .delete('/api/user/999999999999999999999999')
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('404');
                message.should.be.a('string').that.equal('User not found, delete failed');
                data.should.be.a('object').that.is.empty;

                done();
            });
    });
    it('TC-206-2 Gebruiker is niet ingelogd', done => {
        //TODO Rewrite
        chai
            .request(app)
            .delete('/api/user/1')
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('401');
                res.body.should.have.property('message').eql('Unauthorized');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.be.empty;
                done();
            });
    });
    it('TC-206-3 Gebruiker is niet de eigenaar van de data', done => {
        //TODO Rewrite
        chai
            .request(app)
            .delete('/api/user/1')
            .set({"Authorization": "Bearer " + getValidToken(2)})
            .end((err, res) => {
                res.should.have.status(403);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('403');
                res.body.should.have.property('message').eql('Forbidden');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.be.empty;
                done();
            });
    });
    it('TC-206-4 Gebruiker succesvol verwijderd', done => {
        chai
            .request(app)
            .delete('/api/user/1')
            .set({"Authorization": "Bearer " + getValidToken(1)})
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('200');
                message.should.be.a('string').that.equal('User successfully deleted');
                data.should.be.a('object');
                data.should.have.property('id').that.equal(1);

                done();
            });
    });
});