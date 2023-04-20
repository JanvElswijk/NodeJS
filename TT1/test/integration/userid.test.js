const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../../app');

chai.use(chaiHttp);

chai.should();

describe('Userid', () => {
    it('TC-204-1 Ongeldig token', done => {
        chai
            .request(app)
            .get('/api/user/1')
            .set({"Authorization": `Bearer a`})
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('401');
                res.body.should.have.property('message').eql('Unauthorized, invalid token');
                res.body.should.have.property('data');
                res.body.data.should.be.empty;
                done();
            });

    });
    it('TC-204-2 Gebruiker-ID bestaat niet', done => {
        chai
            .request(app)
            .get('/api/user/999999999999999999999999')
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('404');
                res.body.should.have.property('message').eql('User not found, no user with that id');
                res.body.should.have.property('data');
                res.body.data.should.be.empty;
                done();
            });
    });
    it('TC-204-3 Gebruiker-ID bestaat', done => {
        chai
            .request(app)
            .get('/api/user/1')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('200');
                res.body.should.have.property('message').eql('Success, user with that id found');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.not.have.property('password');
                res.body.data.should.not.have.property('token');
                done();
            });
    });
    it('TC-205-1 Verplicht veld “emailAddress” ontbreekt', done => {
        chai
            .request(app)
            .put('/api/user/1')
            .set({"Authorization": `Bearer testtoken1`})
            .send({
                "firstName": "Test",
                "lastName": "Test",
                "password": "Test",
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('400');
                res.body.should.have.property('message').eql('Missing required field, email, edit failed');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.be.empty;
                done();
            });
    });
    it('TC-205-2 De gebruiker is niet de eigenaar van de data', done => {
        chai
            .request(app)
            .put('/api/user/1')
            .set({"Authorization": `Bearer testtoken2`})
            .send({
                "firstName": "Test",
                "lastName": "Test",
                "password": "Test",
                "email": "test@test.test",
                "phoneNumber": "0612345678"
            })
            .end((err, res) => {
                res.should.have.status(403);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('403');
                res.body.should.have.property('message').eql('Forbidden');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.be.empty;
                done();
            });
    });
    it('TC-205-3 Niet-valide telefoonnummer', done => {
        chai
            .request(app)
            .put('/api/user/1')
            .set({"Authorization": `Bearer testtoken1`})
            .send({
                "firstName": "Test",
                "lastName": "Test",
                "password": "Test",
                "email": "test@test.test",
                "phoneNumber": "061234567"
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('400');
                res.body.should.have.property('message').eql('Phone number is not valid, edit failed');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.be.empty;
                done();
            });
    });
    it('TC-205-4 Gebruiker bestaat niet', done => {
        chai
            .request(app)
            .put('/api/user/999999999999999999999999')
            .send({
                "firstName": "Test",
                "lastName": "Test",
                "password": "Test",
                "email": "test@test.test",
                "phoneNumber": "0612345678"
            })
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('404');
                res.body.should.have.property('message').eql('User not found, edit failed');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.be.empty;
                done();
            });
    });
    it('TC-205-5 Niet ingelogd', done => {
        chai
            .request(app)
            .put('/api/user/1')
            .send({
                "firstName": "Test",
                "lastName": "Test",
                "password": "Test",
                "email": "test@test.test",
                "phoneNumber": "0612345678"
            })
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('401');
                res.body.should.have.property('message').eql('Unauthorized');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.be.empty;
                done();
            });
    });
    it('TC-205-6 Gebruiker succesvol gewijzigd', done => {
        chai
            .request(app)
            .put('/api/user/1')
            .set({"Authorization": `Bearer testtoken1`})
            .send({
                "firstName": "Test",
                "lastName": "Test",
                "password": "Test",
                "email": "test@test.test",
                "phoneNumber": "0612345678"
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('200');
                res.body.should.have.property('message').eql('User successfully edited');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.have.property('firstName').eql('Test');
                res.body.data.should.have.property('lastName').eql('Test');
                res.body.data.should.have.property('email').eql('test@test.test');
                res.body.data.should.have.property('phoneNumber').eql('0612345678');
                done();
            });
    });
    it('TC-206-1 Gebruiker bestaat niet', done => {
        chai
            .request(app)
            .delete('/api/user/999999999999999999999999')
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('404');
                res.body.should.have.property('message').eql('User not found, delete failed');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.be.empty;
                done();
            });
    });
    it('TC-206-2 Gebruiker is niet ingelogd', done => {
        chai
            .request(app)
            .delete('/api/user/1')
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('401');
                res.body.should.have.property('message').eql('Unauthorized');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.be.empty;
                done();
            });
    });
    it('TC-206-3 Gebruiker is niet de eigenaar van de data', done => {
        chai
            .request(app)
            .delete('/api/user/1')
            .set({"Authorization": `Bearer testtoken2`})
            .end((err, res) => {
                res.should.have.status(403);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('403');
                res.body.should.have.property('message').eql('Forbidden');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.be.empty;
                done();
            });
    });
    it('TC-206-4 Gebruiker succesvol verwijderd', done => {
        chai
            .request(app)
            .delete('/api/user/1')
            .set({"Authorization": `Bearer testtoken1`})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('200');
                res.body.should.have.property('message').eql('User successfully deleted');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.have.property('id').eql(1);
                done();
            });
    });
});