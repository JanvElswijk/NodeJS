const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../../app');

chai.use(chaiHttp);

chai.should();
describe('Register', () => {
    it('TC-201-1 Verplicht veld ontbreekt', done => {
        chai
            .request(app)
            .post('/api/register')
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
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('400');
                res.body.should.have.property('message').eql('Missing required fields for registration');
                res.body.should.have.property('data');
                done();
            });
    });
    it('TC-201-2 Niet-valide emailadres', done => {
        chai
            .request(app)
            .post('/api/register')
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
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('400');
                res.body.should.have.property('message').eql('Email is not valid, registration failed');
                res.body.should.have.property('data');
                done();
            });
    });
    it('TC-201-3 Niet-valide wachtwoord', done => {
        chai
            .request(app)
            .post('/api/register')
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
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('400');
                res.body.should.have.property('message').eql('Password is not valid, registration failed');
                res.body.should.have.property('data');
                done();
            });

    });
    it('TC-201-4 Gebruiker bestaat al', done => {
        chai
            .request(app)
            .post('/api/register')
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
                res.should.have.status(403);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('403');
                res.body.should.have.property('message').eql('Email already exists, registration failed');
                res.body.should.have.property('data');
                done();
            });
    });
    it('TC-201-5 Gebruiker succesvol geregistreerd', done => {
        chai
            .request(app)
            .post('/api/register')
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
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('201');
                res.body.should.have.property('message').eql('New user registered');
                res.body.should.have.property('data');
                // res.body.data.should.have.property('token');
                res.body.data.should.have.property('id');
                res.body.data.should.have.property('firstName').eql('test');
                res.body.data.should.have.property('lastName').eql('test');
                res.body.data.should.have.property('street').eql('test');
                res.body.data.should.have.property('city').eql('test');
                res.body.data.should.have.property('email').eql('test2@test.test');
                res.body.data.should.have.property('phoneNumber').eql('0612345678');
                done();
            });
    });
});
