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

describe('UC-302 Wijzigen van maaltijd', () => {
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
    });
    it('TC-302-1 Verplicht velden “name” en/of “price”en/of “maxAmountOfParticipants” ontbreken', done => {
       chai
            .request(app)
            .put('/api/meal/1')
            .set('Authorization', 'Bearer ' + getValidToken(1))
            .send({
                name: 'name',
                price: 10.00
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message } = res.body;
                status.should.equal('400');
                message.should.be.a('string').that.equal('MaxAmountOfParticipants is required');

                done();
            });
    });
    it('TC-302-2 Niet ingelogd', done => {
        chai
            .request(app)
            .put('/api/meal/1')
            .send({
                name: 'name',
                price: 10.00,
                maxAmountOfParticipants: 10
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message } = res.body;
                status.should.equal('401');
                message.should.be.a('string').that.equal('Unauthorized');

                done();
            });
    });
    it('TC-302-3 Niet de eigenaar van de data', done => {
        chai
            .request(app)
            .put('/api/meal/1')
            .set('Authorization', 'Bearer ' + getValidToken(2))
            .send({
                name: 'name',
                price: 10.00,
                maxAmountOfParticipants: 10
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message } = res.body;
                status.should.equal('403');
                message.should.be.a('string').that.equal('Forbidden');

                done();
            });
    });
    it('TC-302-4 Maaltijd bestaat niet', done => {
        chai
            .request(app)
            .put('/api/meal/3')
            .set('Authorization', 'Bearer ' + getValidToken(1))
            .send({
                name: 'name',
                price: 10.00,
                maxAmountOfParticipants: 10
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message } = res.body;
                status.should.equal('404');
                message.should.be.a('string').that.equal('Meal not found');

                done();
            });
    });
    it('TC-302-5 Maaltijd succesvol gewijzigd', done => {
        chai
            .request(app)
            .put('/api/meal/1')
            .set('Authorization', 'Bearer ' + getValidToken(1))
            .send({
                name: 'name',
                price: 10.00,
                maxAmountOfParticipants: 10
            })
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('200');
                message.should.be.a('string').that.equal('Meal updated');
                data.meal.should.be.a('object');
                data.meal.should.have.property('mealId').that.equal(1);
                data.meal.should.have.property('name').that.equal('name');
                data.meal.should.have.property('price').that.equal(10.00);
                data.meal.should.have.property('maxAmountOfParticipants').that.equal(10);

                done();
            });
    });
});

describe('UC-304 Opvragen van maaltijd bij ID', () => {
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
    });
    it('TC-304-1 Maaltijd bestaat niet', done => {
        chai
            .request(app)
            .get('/api/meal/3')
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message } = res.body;
                status.should.equal('404');
                message.should.be.a('string').that.equal('Meal not found');

                done();
            });
    });
    it('TC-304-2 Details van maaltijd geretourneerd', done => {
        chai
            .request(app)
            .get('/api/meal/1')
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, data } = res.body;
                status.should.equal('200');
                data.meal.should.be.a('object');
                data.meal.should.have.property('mealId').equal(1);
                data.meal.should.have.property('name').equal('name');
                data.meal.should.have.property('description').equal('description');
                data.meal.should.have.property('price').equal("10.00");
                data.meal.should.have.property('dateTime').equal('2021-06-01T12:00:00.000Z');
                data.meal.should.have.property('maxAmountOfParticipants').equal(10);
                data.meal.should.have.property('imageUrl').equal('imageUrl');
                data.meal.should.have.property('cook');
                data.meal.cook.should.be.a('object');
                data.meal.cook.should.have.property('id').equal(1);
                data.meal.cook.should.have.property('firstName').equal('first');
                data.meal.cook.should.have.property('lastName').equal('last');
                data.meal.cook.should.have.property('emailAdress').equal('t.test@test.tst');
                data.meal.cook.should.have.property('street').equal('street');
                data.meal.cook.should.have.property('city').equal('city');
                done();
            });
    });
});

describe('UC-305 Verwijderen van maaltijden', () => {
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
    });
    it('TC-305-1 Niet ingelogd', done => {
        chai
            .request(app)
            .delete('/api/meal/1')
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message } = res.body;
                status.should.equal('401');
                message.should.be.a('string').that.equal('Unauthorized');

                done();
            });
    });
    it('TC-305-2 Niet de eigenaar van de data', done => {
        chai
            .request(app)
            .delete('/api/meal/1')
            .set('Authorization', 'Bearer ' + getValidToken(2))
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message } = res.body;
                status.should.equal('403');
                message.should.be.a('string').that.equal('Forbidden');

                done();
            });
    });
    it('TC-305-3 Maaltijd bestaat niet', done => {
        chai
            .request(app)
            .delete('/api/meal/3')
            .set('Authorization', 'Bearer ' + getValidToken(1))
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message } = res.body;
                status.should.equal('404');
                message.should.be.a('string').that.equal('Meal not found');

                done();
            });
    });
    it('TC-305-4 Maaltijd succesvol verwijderd', done => {
        chai
            .request(app)
            .delete('/api/meal/1')
            .set('Authorization', 'Bearer ' + getValidToken(1))
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('200');
                message.should.be.a('string').that.equal('Meal with id 1 deleted');
                data.should.be.a('object').that.is.empty;
                done();
            });
    });
});
