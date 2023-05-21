process.env.DB_DATABASE =
    process.env.DB_DATABASE || 'testshareameal' || 'shareameal';

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = require('assert');

const app = require('../../app');
const db = require('../../utils/mysql-db');

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB =
    CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;
const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "Secret1234!", "street", "city") ' // 1

chai.use(chaiHttp);

chai.should();

describe('UC-101 Inloggen', () => {
    beforeEach(done => {
        db.query(CLEAR_DB, [], (err) => {
            assert(err === null);
            db.query(INSERT_USER, [], (err) => {
                assert(err === null);
                done();
            });
        });
    });
    it('TC-101-1 Verplicht veld ontbreekt', done => {
        chai
            .request(app)
            .post('/api/login')
            .send({
                emailAdress: 'name@server.nl',
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message } = res.body;
                status.should.equal(400);
                message.should.be.a('string').that.equal('Password is required');

                done();
            });
    });
    it('TC-101-2 Niet-valide wachtwoord', done => {
        chai
            .request(app)
            .post('/api/login')
            .send({
                emailAdress: 'name@server.nl',
                password: 'Secret1234',
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal(400);
                message.should.be.a('string').that.equal('Unauthorized, invalid password');
                data.should.be.a('object').that.is.empty;

                done();
            });
    });
    it('TC-101-3 Gebruiker bestaat niet', done => {
        chai
            .request(app)
            .post('/api/login')
            .send({
                emailAdress: 'name1@server.nl',
                password: 'Secret1234!'
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal(404);
                message.should.be.a('string').that.equal('User not found');
                data.should.be.a('object').that.is.empty;

                done();
            });
    });
    it('TC-101-4 Gebruiker succesvol ingelogd', done => {
        chai
            .request(app)
            .post('/api/login')
            .send({
                emailAdress: 'name@server.nl',
                password: 'Secret1234!'
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal(200);
                message.should.be.a('string').that.equal('Login successful');
                data.should.be.a('object');
                data.should.have.property('token');
                data.should.have.property('id').that.equal(1);
                data.should.have.property('firstName').that.equal('first');
                data.should.have.property('lastName').that.equal('last');
                data.should.have.property('emailAdress').that.equal('name@server.nl');
                data.should.have.property('street').that.equal('street');
                data.should.have.property('city').that.equal('city');

                done();
            });
    });
});