process.env.DB_DATABASE =
    process.env.DB_DATABASE || 'testshareameal' || 'shareameal';

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = require('assert');
require('tracer').setLevel('error');


const app = require('../../app');
const db = require("../../utils/mysql-db");

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB =
    CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;
const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "Secret1234!", "street", "city") ' + // 1
    ',(2, "first", "last", "name2@servern.nl", "Secret1234!", "street", "city") ' // 2

chai.use(chaiHttp);

chai.should();

describe('UC-204 Opvragen van usergegevens bij ID', () => {
    beforeEach(done => {
        db.query(CLEAR_DB, [], (err) => {
            assert(err === null);
            db.query(INSERT_USER, [], (err) => {
                assert(err === null);
                done();
            });
        });
    });

    it('TC-204-2 Gebruiker-ID bestaat niet', done => {
        chai
            .request(app)
            .get('/api/user/3')
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
        chai
            .request(app)
            .get('/api/user/1')
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('200');
                message.should.be.a('string').that.equal('Success, user with that id found');
                data.should.be.a('object');
                data.id.should.be.a('number').that.equal(1);
                data.firstName.should.be.a('string').that.equal('first');
                data.lastName.should.be.a('string').that.equal('last');
                data.street.should.be.a('string').that.equal('street');
                data.city.should.be.a('string').that.equal('city');
                data.isActive.should.be.a('boolean').that.equal(true);
                data.emailAdress.should.be.a('string').that.equal('name@server.nl');
                data.password.should.be.a('string').that.equal('Secret1234!');

                done();
            });
    });
});
describe('UC-205 Wijzigen van usergegevens', () => {
    it('TC-205-1 Verplicht veld “emailAddress” ontbreekt', done => {
        chai
            .request(app)
            .put('/api/user/1')
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
                message.should.be.a('string').that.equal('Missing required field, emailAdress, edit failed');
                data.should.be.a('object').that.is.empty;

                done();
            });
    });
    it('TC-205-3 Niet-valide telefoonnummer', done => {
        chai
            .request(app)
            .put('/api/user/1')
            .send({
                "firstName": "Test",
                "lastName": "Test",
                "password": "Testtest1!",
                "emailAdress": "test@test.test",
                "phoneNumber": "061234567"
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('400');
                message.should.be.a('string').that.equal('Invalid phoneNumber format, edit failed');
                data.should.be.a('object').that.is.empty;

                done();
            });
    });
    it('TC-205-4 Gebruiker bestaat niet', done => {
        chai
            .request(app)
            .put('/api/user/3')
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
    it('TC-205-6 Gebruiker succesvol gewijzigd', done => {
        chai
            .request(app)
            .put('/api/user/1')
            .send({
                "firstName": "Test",
                "lastName": "Test",
                "password": "Testtest1!",
                "emailAdress": "test@test.test",
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
                data.should.have.property('emailAdress').that.is.a('string').that.equal('test@test.test');
                data.should.have.property('phoneNumber').that.is.a('string').that.equal('0612345678');
                done();
            });
    });
});
describe('UC-206 Verwijderen van user', () => {
    it('TC-206-1 Gebruiker bestaat niet', done => {
        chai
            .request(app)
            .delete('/api/user/3')
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
    it('TC-206-4 Gebruiker succesvol verwijderd', done => {
        chai
            .request(app)
            .delete('/api/user/1')
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('200');
                message.should.be.a('string').that.equal('User successfully deleted');
                data.should.be.a('object');
                data.should.have.property('deletedUser').that.is.a('object');
                data.deletedUser.should.have.property('id').that.equal(1);

                done();
            });
    });
});