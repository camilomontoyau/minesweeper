const request = require('supertest');
const app = require('../server/server');
const { expect } = require('chai');

let game = {};

describe('POST /games', function() {
  it('should create a new game', function(done) {
    request(app)
      .post('/games')
      .send({ owner: 'john doe' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(res => {
        const { status, body } = res;
        expect(status).to.equal(200);
        expect(body).to.be.an('object');
        expect(body.width).to.equal(3);
        expect(body.height).to.equal(3);
        expect(body.mines).to.equal(2);
        expect(body.state).to.equal('started');
        expect(body.owner).to.equal('john doe');
        expect(body.time).to.equal(0);
        expect(body.board).to.be.an('array');
        expect(body.board.length).to.equal(3);
        expect(body.board[0].length).to.equal(3);
        expect(body.board[0][0].state).to.equal('closed');
        game = body;
      })
      .end(err => {
        if (err) return done(err);
        done();
      });
  });
});

describe('PUT /games/:id/cell/:x/:y', function() {
  it('should show an error when payload is not sent', function(done) {
    request(app)
      .put(`/games/${game._id}/cell/0/0`)
      .send()
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(res => {
        const { status, body } = res;
        expect(status).to.equal(400);
        expect(body.error).to.equal('body.state is required');
      })
      .end(err => {
        if (err) return done(err);
        done();
      });
  });

  it('should show an error when payload state is invalid', function(done) {
    request(app)
      .put(`/games/${game._id}/cell/0/0`)
      .send({ state: '1' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(res => {
        const { status, body } = res;
        expect(status).to.equal(400);
        expect(body.error).to.equal('invalid body.state');
      })
      .end(err => {
        if (err) return done(err);
        done();
      });
  });

  it('should open the specified cell', function(done) {
    request(app)
      .put(`/games/${game._id}/cell/0/0`)
      .send({ state: 'opened' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(res => {
        const { status, body } = res;
        expect(status).to.equal(200);
        expect(body).to.be.an('object');
        expect(body.width).to.equal(3);
        expect(body.height).to.equal(3);
        expect(body.mines).to.equal(2);
        expect(body.state).to.satisfy(function(state) {
          return state === 'started' || state === 'lost' || state === 'won';
        });
        expect(body.owner).to.equal('john doe');
        expect(body.time).to.equal(0);
        expect(body.board).to.be.an('array');
        expect(body.board.length).to.equal(3);
        expect(body.board[0].length).to.equal(3);
        expect(body.board[0][0].state).to.equal('opened');
      })
      .end(err => {
        if (err) return done(err);
        done();
      });
  });
});

describe('GET /games', function() {
  it('respond with json containing a list of all games', function(done) {
    request(app)
      .get('/games')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(res => {
        const { status, body } = res;
        expect(status).to.equal(200);
        expect(body).to.be.an('array');
        expect(body.length).to.be.above(0);
      })
      .end(err => {
        if (err) return done(err);
        done();
      });
  });
});
