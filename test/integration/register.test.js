const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../../app');
const assert = require('assert');

chai.use(chaiHttp);

chai.should();
describe('Register', () => {
    it('TC-201-1 Verplicht veld ontbreekt', done => {
        chai
            .request(app)
            .post('/api/user')
            .send({
                firstName: null,
                lastName: "test",
                street: "test",
                city: "test",
                email: "test@test.test",
                password: "Abcdefgh1!",
                phoneNumber: "0612345678"
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('400');
                message.should.be.a('string').that.equal('Missing required fields for registration');
                data.should.be.a('object').that.is.empty;

                done();
            });
    });
    it('TC-201-2 Niet-valide emailadres', done => {
        chai
            .request(app)
            .post('/api/user')
            .send({
                firstName: "test",
                lastName: "test",
                street: "test",
                city: "test",
                email: "test",
                password: "Abcdefgh1!",
                phoneNumber: "0612345678"
            })
            .end((err, res) =>  {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('400');
                message.should.be.a('string').that.equal('Email is not valid, registration failed');
                data.should.be.a('object').that.is.empty;

                done();
            });
    });
    it('TC-201-3 Niet-valide wachtwoord', done => {
        chai
            .request(app)
            .post('/api/user')
            .send({
                firstName: "test",
                lastName: "test",
                street: "test",
                city: "test",
                email: "test2@test.test",
                password: "test",
                phoneNumber: "0612345678"
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('400');
                message.should.be.a('string').that.equal('Password is not valid, registration failed');
                data.should.be.a('object').that.is.empty;

                done();
            });

    });
    it('TC-201-4 Gebruiker bestaat al', done => {
        chai
            .request(app)
            .post('/api/user')
            .send({
                firstName: "test",
                lastName: "test",
                street: "test",
                city: "test",
                email: "john@avans.nl",
                password: "Abcdefgh1!",
                phoneNumber: "0612345678"
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('403');
                message.should.be.a('string').that.equal('User with that email already exists, registration failed');
                data.should.be.a('object').that.is.empty;

                done();
            });
    });
    it('TC-201-5 Gebruiker succesvol geregistreerd', done => {
        chai
            .request(app)
            .post('/api/user')
            .send({
                firstName: "test",
                lastName: "test",
                street: "test",
                city: "test",
                email: "test2@test.test",
                password: "Abcdefgh1!",
                phoneNumber: "0612345678"
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('201');
                message.should.be.a('string').that.equal('New user registered');
                data.should.be.a('object');
                data.id.should.be.a('number');
                data.firstName.should.be.a('string').that.equal('test');
                data.lastName.should.be.a('string').that.equal('test');
                data.street.should.be.a('string').that.equal('test');
                data.city.should.be.a('string').that.equal('test');
                data.email.should.be.a('string').that.equal('test2@test.test');
                data.password.should.be.a('string').that.equal('Abcdefgh1!');
                data.phoneNumber.should.be.a('string').that.equal('0612345678');

                done();
            });
    });
});
