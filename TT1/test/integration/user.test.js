const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../../app');
const assert = require('assert');

chai.use(chaiHttp);

chai.should();

describe('User', () => {
    it('TC-202-1 Toon alle gebruikers (minimaal 2)', done => {
        chai
            .request(app)
            .get('/api/user')
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('200');
                message.should.be.a('string').that.equal('Success, no filters applied');
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
                message.should.be.a('string').that.equal('Success, filters applied');
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
                message.should.be.a('string').that.equal('Success, filters applied');
                data.should.be.a('array');
                data[0].should.not.have.property('password');
                data[0].should.have.property('isActive').that.equal(false);

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
                message.should.be.a('string').that.equal('Success, filters applied');
                data.should.be.a('array');
                data[0].should.not.have.property('password');
                data[0].should.have.property('isActive').that.equal(true);

                done();
            });
    });
    it('TC-202-5 Toon gebruikers met zoektermen op bestaande velden (max op 2 velden filteren)', done => {
        chai
            .request(app)
            .get('/api/user?firstName=John&lastName=Doe')
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('200');
                message.should.be.a('string').that.equal('Success, filters applied');
                data.should.be.a('array');
                data[0].should.not.have.property('password');

                done();
            });
    });
});