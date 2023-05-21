process.env.DB_DATABASE =
    process.env.DB_DATABASE || 'testshareameal' || 'shareameal';


const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = require('assert');

const app = require('../../app');
const db = require("../../utils/mysql-db");

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB =
    CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;
const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "j.doe@server.com", "Secret1234!", "street", "city") ' // 1

chai.use(chaiHttp);

chai.should();
describe('UC-201 Registreren als nieuwe user', () => {
    beforeEach(done => {
        db.query(CLEAR_DB, [], (err) => {
            assert(err === null);
            db.query(INSERT_USER, [], (err) => {
                assert(err === null);
                done();
            });
        });
    });
    it('TC-201-1 Verplicht veld ontbreekt', done => {
        chai
            .request(app)
            .post('/api/user')
            .send({
                firstName: null,
                lastName: "test",
                street: "test",
                city: "test",
                emailAdress: "t.test@test.tst",
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
                emailAdress: "test",
                password: "Abcdefgh1!",
                phoneNumber: "0612345678"
            })
            .end((err, res) =>  {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('400');
                message.should.be.a('string').that.equal('emailAdress is not valid, registration failed');
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
                emailAdress: "t.test@test.tst",
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
                emailAdress: "j.doe@server.com",
                password: "Abcdefgh1!",
                phoneNumber: "0612345678"
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('403');
                message.should.be.a('string').that.equal('User with that emailAdress already exists, registration failed');
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
                emailAdress: "t.test@test.tst",
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
                data.emailAdress.should.be.a('string').that.equal('t.test@test.tst');
                data.password.should.be.a('string').that.equal('Abcdefgh1!');
                data.phoneNumber.should.be.a('string').that.equal('0612345678');

                done();
            });
    });
});
