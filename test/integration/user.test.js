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
    '(1, "first", "last", "name@server.nl", "Secret1234!", "street", "city") ' + // 1
    ',(2, "first", "last", "name2@servern.nl", "Secret1234!", "street", "city") ' // 2

chai.use(chaiHttp);

chai.should();
    describe('2.2 User', () => {
        beforeEach(done => {
            db.query(CLEAR_DB, [], (err) => {
                assert(err === null);
                db.query(INSERT_USER, [], (err) => {
                    assert(err === null);
                    done();
                });
            });
        });
        it('TC-202-1 Toon alle gebruikers (minimaal 2)', done => {
            chai
                .request(app)
                .get('/api/user')
                .end((err, res) => {
                    assert(err === null);

                    res.body.should.be.a('object');
                    let { status, message, data } = res.body;
                    status.should.equal('200');
                    message.should.be.a('string').that.equal('Users retrieved successfully');
                    data.should.be.a('array');
                    data.length.should.be.greaterThan(1);
                    data[0].should.not.have.property('password');

                    done();
                });
        });
        it('TC-202-2 Toon gebruikers met zoekterm op niet-bestaande velden.', done => {
            chai
                .request(app)
                .get('/api/user?test=test')
                .end((err, res) => {
                    assert(err === null);

                    res.body.should.be.a('object');
                    let { status, message, data } = res.body;
                    status.should.equal('200');
                    message.should.be.a('string').that.equal('Users retrieved successfully');
                    data.should.be.empty;

                    done();
                });
        });
        it('TC-202-3 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=false', done => {
            chai
                .request(app)
                .get('/api/user?isActive=false')
                .end((err, res) => {
                    assert(err === null);

                    res.body.should.be.a('object');
                    let { status, message, data } = res.body;
                    status.should.equal('200');
                    message.should.be.a('string').that.equal('Users retrieved successfully');
                    data.should.be.a('array').that.is.empty;

                    done();
                });
        });
        it('TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=true', done => {
            chai
                .request(app)
                .get('/api/user?isActive=true')
                .end((err, res) => {
                    assert(err === null);

                    res.body.should.be.a('object');
                    let { status, message, data } = res.body;
                    status.should.equal('200');
                    message.should.be.a('string').that.equal('Users retrieved successfully');
                    data.should.be.a('array');
                    data[0].should.not.have.property('password');
                    data[0].should.have.property('isActive').that.equal(true);

                    done();
                });
        });
        it('TC-202-5 Toon gebruikers met zoektermen op bestaande velden (max op 2 velden filteren)', done => {
            chai
                .request(app)
                .get('/api/user?firstName=first&lastName=last')
                .end((err, res) => {
                    assert(err === null);

                    res.body.should.be.a('object');
                    let { status, message, data } = res.body;
                    status.should.equal('200');
                    message.should.be.a('string').that.equal('Users retrieved successfully');
                    data.should.be.a('array');
                    data[0].should.not.have.property('password');

                    done();
                });
        });
    });