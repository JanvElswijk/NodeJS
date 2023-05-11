process.env.DB_DATABASE =
    process.env.DB_DATABASE || 'testshareameal' || 'shareameal';


const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = require('assert');
const jwt = require('jsonwebtoken');

const app = require('../../app');
const jwtConfig = require('../../configs/jwt.config.js');
const db = require("../../utils/mysql-db");

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB =
    CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;
const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "j.doe@server.com", "Secret1234!", "street", "city") ' // 1

const getWrongToken = (userId) => {
    return jwt.sign({
        userId: userId}, jwtConfig.wrongSecret);
}

const getValidToken = (userId) => {
    return jwt.sign({
        userId: userId}, jwtConfig.secret);
}

chai.use(chaiHttp);

chai.should();

describe('2.3 Profile', () => {
    beforeEach(done => {
        db.query(CLEAR_DB, [], (err) => {
            assert(err === null);
            db.query(INSERT_USER, [], (err) => {
                assert(err === null);
                done();
            });
        });
    });
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
                data.should.have.property('firstName'). eql('first');
                data.should.have.property('lastName').eql('last');
                data.should.have.property('street').eql('street');
                data.should.have.property('city').eql('city');
                data.should.have.property('isActive').eql(true);
                data.should.have.property('emailAdress').eql('j.doe@server.com');
                data.should.have.property('password').eql('Secret1234!');
                // data.should.have.property('phoneNumber').eql('0612345678');

                done();
            });
    });
});