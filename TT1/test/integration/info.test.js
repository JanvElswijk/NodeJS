const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../../app');

chai.use(chaiHttp);

chai.should();
describe('Server-info', () => {
    it('TC-102-1 Info message bevat alle correcte info', done => {
        chai
            .request(app)
            .get('/api/info')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('200');
                res.body.should.have.property('message').eql('Server info endpoint');
                res.body.should.have.property('data');
                res.body.data.should.have.property('studentName').eql('Jan van Elswijk');
                res.body.data.should.have.property('studentNumber').eql('2200971');
                res.body.data.should.have.property('description').eql('Dit is een express server voor het vak Programmeren 4');
                done();
            });
    });
});