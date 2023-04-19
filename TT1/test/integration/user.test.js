const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../../app');

chai.use(chaiHttp);

chai.should();

describe('User', () => {
    it('TC-202-1 Toon alle gebruikers (minimaal 2)', done => {
        chai
            .request(app)
            .get('/api/user')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('200');
                res.body.should.have.property('message').eql('Success, no filters applied');
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data.length.should.be.greaterThan(1);
                res.body.data[0].should.not.have.property('password');
                // !res.body.data.user.should.have.property('token');
                done();
            });
    });
    it('TC-202-2 Toon gebruikers met zoekterm op niet-bestaande velden.', done => {
        chai
            .request(app)
            .get('/api/user?test=test')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('200');
                res.body.should.have.property('message').eql('Success, filters applied');
                res.body.should.have.property('data');
                res.body.data.should.be.empty;
                done();
            });
    });
    it('TC-202-3 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=false', done => {
        chai
            .request(app)
            .get('/api/user?isActive=false')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('200');
                res.body.should.have.property('message').eql('Success, filters applied');
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data[0].should.not.have.property('password');
                res.body.data[0].should.have.property('isActive').eql(false);
                // !res.body.data.user.should.have.property('token');
                done();
            });
    });
    it('TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=true', done => {
        chai
            .request(app)
            .get('/api/user?isActive=true')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('200');
                res.body.should.have.property('message').eql('Success, filters applied');
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data[0].should.not.have.property('password');
                res.body.data[0].should.have.property('isActive').eql(true);
                // !res.body.data.user.should.have.property('token');
                done();
            });
    });
    it('TC-202-5 Toon gebruikers met zoektermen op bestaande velden (max op 2 velden filteren)', done => {
        chai
            .request(app)
            .get('/api/user?firstName=John&lastName=Doe')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('200');
                res.body.should.have.property('message').eql('Success, filters applied');
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data[0].should.not.have.property('password');
                // !res.body.data.user.should.have.property('token');
                done();
            });
    });
});