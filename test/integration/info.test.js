const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../../app');
const assert = require('assert');

chai.use(chaiHttp);

chai.should();
describe('1.1 Server-info', () => {
    it('TC-102-1 Info message bevat alle correcte info', done => {
        chai
            .request(app)
            .get('/api/info')
            .end((err, res) => {
                assert(err === null);

                res.body.should.be.a('object');
                let { status, message, data } = res.body;
                status.should.equal('200');
                message.should.equal('Server info endpoint');
                data.should.be.a('object');
                data.studentName.should.equal('Jan van Elswijk');
                data.studentNumber.should.equal('2200971');
                data.description.should.equal('Dit is een express server voor het vak Programmeren 4');

                done();
            });
    });
});