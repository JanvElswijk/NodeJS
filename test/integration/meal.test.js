process.env.DB_DATABASE =
    process.env.DB_DATABASE || 'testshareameal' || 'shareameal';

const chai = require('chai');
const chaiHttp = require('chai-http');
require('tracer').setLevel('error');
const assert = require('assert');

const app = require('../../app');
const db = require('../../utils/mysql-db');
const jwt = require("jsonwebtoken");
const jwtConfig = require("../../configs/jwt.config");

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB =
    CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;
const INSERT_USER = 'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "t.test@test.tst", "Secret1234!", "street", "city") ' // 1
const INSERT_MEAL = 'INSERT INTO `meal` (id, cookId, name, description, price, dateTime, maxAmountOfParticipants, imageUrl) VALUES' +
    '(1, 1, "name", "description", 10.00, "2021-06-01 12:00:00", 10, "imageUrl"), ' + // 1
    '(2, 1, "name", "description", 10.00, "2021-06-01 12:00:00", 10, "imageUrl")' // 2

const getValidToken = (userId) => {
    return jwt.sign({
        userId: userId}, jwtConfig.secret);
}

chai.use(chaiHttp);

chai.should();

describe('UC-301 Toevoegen van maaltijden', () => {
    beforeEach(done => {
        db.query(CLEAR_DB, [], (err) => {
            assert(err === null);
            db.query(INSERT_USER, [], (err) => {
                assert(err === null);
                db.query(INSERT_MEAL, [], (err) => {
                    assert(err === null);
                    done();
                });
            });
        });
    })
    it('TC-301-1 Verplicht veld ontbreekt', done => {
        chai
            .request(app)
            .post('/api/meal')
            .set('Authorization', 'Bearer ' + getValidToken(1))
            .send({
                name: 'name',
                description: 'description',
                price: 10.00,
                dateTime: '2021-06-01 12:00:00',
                maxAmountOfParticipants: 10
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message } = res.body;
                status.should.equal(400);
                message.should.be.a('string').that.equal('ImageUrl is required');

                done();
            });
    });
    it('TC-301-2 Niet ingelogd', done => {
        chai
            .request(app)
            .post('/api/meal')
            .send({
                name: 'name',
                description: 'description',
                price: 10.00,
                dateTime: '2021-06-01 12:00:00',
                maxAmountOfParticipants: 10,
                imageUrl: 'imageUrl'
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message } = res.body;
                status.should.equal(401);
                message.should.be.a('string').that.equal('Unauthorized');

                done();
            });
    });
    it('TC-301-3 Maaltijd succesvol toegevoegd', done => {
        chai
            .request(app)
            .post('/api/meal')
            .set('Authorization', 'Bearer ' + getValidToken(1))
            .send({
                name: 'name',
                description: 'description',
                price: 10.00,
                dateTime: '2021-06-01 12:00:00',
                maxAmountOfParticipants: 10,
                imageUrl: 'imageUrl',
                allergens: ['gluten','lactose','noten']
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal(201);
                message.should.be.a('string').that.equal('Meal created');
                data.should.be.a('object');
                data.should.have.property('id');
                data.should.have.property('name').equal('name');
                data.should.have.property('description').equal('description');
                data.should.have.property('price').equal(10.00);
                data.should.have.property('dateTime').equal('2021-06-01 12:00:00');
                data.should.have.property('maxAmountOfParticipants').equal(10);
                data.should.have.property('imageUrl').equal('imageUrl');
                data.should.have.property('cook');
                data.cook.should.be.a('object');
                data.cook.should.have.property('id').equal(1);
                data.cook.should.have.property('firstName').equal('first');
                data.cook.should.have.property('lastName').equal('last');
                data.cook.should.have.property('emailAdress').equal('t.test@test.tst');
                data.cook.should.have.property('street').equal('street');
                data.cook.should.have.property('city').equal('city');

                done();
            });
    });
});
describe('UC-303 Opvragen van alle maaltijden', () => {
    beforeEach(done => {
        db.query(CLEAR_DB, [], (err) => {
            assert(err === null);
            db.query(INSERT_USER, [], (err) => {
                assert(err === null);
                db.query(INSERT_MEAL, [], (err) => {
                    assert(err === null);
                    done();
                });
            });
        });
    })
    it('TC-303-1 Lijst van maaltijden geretourneerd', done => {
        chai
            .request(app)
            .get('/api/meal')
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, data } = res.body;
                status.should.equal(200);
                data.meals.should.be.a('array');
                data.meals.length.should.equal(2);
                data.meals[0].should.be.a('object');
                data.meals[0].should.have.property('id');
                data.meals[0].should.have.property('name').equal('name');
                data.meals[0].should.have.property('description').equal('description');
                data.meals[0].should.have.property('price').equal("10.00");
                data.meals[0].should.have.property('dateTime')// geen equal aangezien db dit met een offset teruggeeft
                data.meals[0].should.have.property('maxAmountOfParticipants').equal(10);
                data.meals[0].should.have.property('imageUrl').equal('imageUrl');
                data.meals[0].should.have.property('cook');
                data.meals[0].cook.should.be.a('object');
                data.meals[0].cook.should.have.property('id').equal(1);
                data.meals[0].cook.should.have.property('firstName').equal('first');
                data.meals[0].cook.should.have.property('lastName').equal('last');
                data.meals[0].cook.should.have.property('emailAdress').equal('t.test@test.tst');
                data.meals[0].cook.should.have.property('street').equal('street');
                data.meals[0].cook.should.have.property('city').equal('city');
                data.meals[1].should.be.a('object');
                data.meals[1].should.have.property('id');
                data.meals[1].should.have.property('name').equal('name');
                data.meals[1].should.have.property('description').equal('description');
                data.meals[1].should.have.property('price').equal("10.00");
                data.meals[1].should.have.property('dateTime')// geen equal aangezien db dit met een offset teruggeeft
                data.meals[1].should.have.property('maxAmountOfParticipants').equal(10);
                data.meals[1].should.have.property('imageUrl').equal('imageUrl');
                data.meals[1].should.have.property('cook');
                data.meals[1].cook.should.be.a('object');
                data.meals[1].cook.should.have.property('id').equal(1);
                data.meals[1].cook.should.have.property('firstName').equal('first');
                data.meals[1].cook.should.have.property('lastName').equal('last');
                data.meals[1].cook.should.have.property('emailAdress').equal('t.test@test.tst');
                data.meals[1].cook.should.have.property('street').equal('street');
                data.meals[1].cook.should.have.property('city').equal('city');

                done();
            });
    });
});
