const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../../app');

chai.use(chaiHttp);

chai.should();

describe('Profile', () => {
    it('TC-203-1 Ongeldig token', done => {
        //TODO: implement
        done();
    });
    it('TC-203-2 Gebruiker is ingelogd met geldig token.', done => {
        //TODO: implement
        done();
    });
});