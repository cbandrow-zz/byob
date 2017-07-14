/*jshint expr:true*/
process.env.NODE_ENV = 'test';


var knex = require('../db/knex');
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server.js');

const token = process.env.TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcm5lcmQiLCJwYXNzd29yZCI6InRoZWFuc3dlcmlzYWx3YXlzbWlhdGEiLCJpYXQiOjE0OTk5ODA3MjUsImV4cCI6MTUwMDU4NTUyNX0.xuxNJbRx-StC1NML6rQU_kyewvk3peGN5CRfO27Uj_w';

chai.use(chaiHttp);

describe('API GET Routes', function() {

  before((done)=> {
    knex.migrate.rollback()
    .then(() =>{
      knex.migrate.latest()
      .then(() => {
        return knex.seed.run()
        .then(()=> {
          done();
        });
      });
    });
  });

  beforeEach(done => {
    knex.seed.run()
    .then(() => done());
  });

  it('should GET all makes.', (done) =>{
      chai.request(server)
      .get('/api/v1/makes')
      .end((err, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.equal(5);
        response.body[0].should.have.property('id');
        response.body[0].should.have.property('make_name');
        response.body[0].should.have.property('created_at');
        response.body[0].should.have.property('updated_at');
        done();
      });
    });
  it('should GET all models by a specific make_name', (done) =>{
    chai.request(server)
    .get('/api/v1/makes/Audi')
    .end((err, response) => {
      response.should.have.status(200);
      response.should.be.json;
      response.body.should.be.a('array');
      response.body.length.should.equal(1);
      response.body[0].should.have.property('id');
      response.body[0].should.have.property('make_name');
      response.body[0].should.have.property('created_at');
      response.body[0].should.have.property('updated_at');
      done();
    });
  });

  it('(sad path) should GET a status code 404 model is not found', (done) =>{
    chai.request(server)
    .get('/api/v1/makes/randomCarMake')
    .end((err, response) => {
      response.should.have.status(404);
      response.should.be.json;
      done();
    });
  });

  it('should GET all models by a specific make_name', (done) =>{
    chai.request(server)
    .get('/api/v1/makes/Audi/models')
    .end((err, response) => {
      response.should.have.status(200);
      response.should.be.json;
      response.body.should.be.a('array');
      response.body.length.should.equal(2);
      response.body[0].should.have.property('id');
      response.body[0].should.have.property('model_name');
      response.body[0].should.have.property('make_id');
      response.body[0].should.have.property('created_at');
      response.body[0].should.have.property('updated_at');
      done();
    });
  });

  it('(sad path) should return a 500 if no the make is invalid', (done) =>{
    chai.request(server)
    .get('/api/v1/makes/randomCarBrand/models')
    .end((err, response) => {
      response.should.have.status(500);
      response.should.be.json;
      done();
    });
  });

  it('(sad path) should return a 404 if no models found', (done) =>{
    chai.request(server)
    .get('/api/v1/makes/Volkswagen/models')
    .end((err, response) => {
      response.should.have.status(404);
      response.body.should.be.a('object');
      response.should.be.json;
      done();
    });
  });

  it('should make a GET query to get models by a specific query', (done) =>{
    chai.request(server)
    .get('/api/v1/search/models/?q=Audi')
    .end((err, response) => {
      response.should.have.status(200);
      response.should.be.json;
      response.body.should.be.a('array');
      response.body.length.should.equal(2);
      response.body[0].should.have.property('id');
      response.body[0].should.have.property('model_name');
      response.body[0].should.have.property('make_id');
      response.body[0].should.have.property('created_at');
      response.body[0].should.have.property('updated_at');
      done();
    });
  });

  it('(sadpath) should make return a 500 if the query is not valid', (done) =>{
    chai.request(server)
    .get('/api/v1/search/models/?q=randomCar')
    .end((err, response) => {
      response.should.have.status(500);
      response.should.be.json;
      done();
    });
  });

  it('(sadpath) should make return a 404 if the query doesnt return an array', (done) =>{
    chai.request(server)
    .get('/api/v1/search/models/?q=volkswagen')
    .end((err, response) => {
      response.should.have.status(404);
      response.should.be.json;
      done();
    });
  });

  it('should make a GET request to get year data by model', (done) =>{
    chai.request(server)
    .get('/api/v1/makes/mazda/models/miata')
    .end((err, response) => {
      response.should.have.status(200);
      response.should.be.json;
      response.body.should.be.a('array');
      response.body.length.should.equal(2);
      response.body[0].should.have.property('id');
      response.body[0].should.have.property('year');
      response.body[0].should.have.property('model_id');
      response.body[0].should.have.property('created_at');
      response.body[0].should.have.property('updated_at');
      done();
    });
  });

  it('(sad path) should return a 404 if no model is found', (done) =>{
    chai.request(server)
    .get('/api/v1/makes/Audi/models/A100')
    .end((err, response) => {
      response.should.have.status(404);
      response.should.be.json;
      done();
    });
  });

  it('should make a GET query to get years by a specific query', (done) =>{
    chai.request(server)
    .get('/api/v1/search/years/?q=124 Spider')
    .end((err, response) => {
      response.should.have.status(200);
      response.should.be.json;
      response.body.should.be.a('array');
      response.body[0].should.have.property('year');
      response.body[0].should.have.property('model_id');
      response.body[0].should.have.property('created_at');
      response.body[0].should.have.property('updated_at');
      done();
    });
  });

  it('should make a GET request to get Trim data by year', (done) =>{
    chai.request(server)
    .get('/api/v1/makes/Audi/models/Q7/2014/1')
    .end((err, response) => {
      response.should.have.status(200);
      response.should.be.json;
      response.body.should.be.a('array');
      response.body.length.should.equal(1);
      response.body[0].should.have.property('id');
      response.body[0].should.have.property('year_id');
      response.body[0].should.have.property('transmission');
      response.body[0].should.have.property('fuel_type');
      response.body[0].should.have.property('horsepower');
      response.body[0].should.have.property('cylinders');
      response.body[0].should.have.property('drive');
      response.body[0].should.have.property('doors');
      response.body[0].should.have.property('market');
      response.body[0].should.have.property('size');
      response.body[0].should.have.property('style');
      response.body[0].should.have.property('highway_mpg');
      response.body[0].should.have.property('city_mpg');
      response.body[0].should.have.property('msrp');
      done();
    });
  });

  it('should make a GET request to get Trim data', (done) =>{
    chai.request(server)
    .get('/api/v1/makes/Audi/models/Q7/2014/1')
    .end((err, response) => {
      response.should.have.status(200);
      response.should.be.json;
      response.body.should.be.a('array');
      response.body.length.should.equal(1);
      response.body[0].should.have.property('id');
      response.body[0].should.have.property('year_id');
      response.body[0].should.have.property('transmission');
      response.body[0].should.have.property('fuel_type');
      response.body[0].should.have.property('horsepower');
      response.body[0].should.have.property('cylinders');
      response.body[0].should.have.property('drive');
      response.body[0].should.have.property('doors');
      response.body[0].should.have.property('market');
      response.body[0].should.have.property('size');
      response.body[0].should.have.property('style');
      response.body[0].should.have.property('highway_mpg');
      response.body[0].should.have.property('city_mpg');
      response.body[0].should.have.property('msrp');
      done();
    });
  });
});

describe('POST tests', () =>{

  before((done)=> {
    knex.migrate.rollback()
    .then(() =>{
      knex.migrate.latest()
      .then(() => {
        return knex.seed.run()
        .then(()=> {
          done();
        });
      });
    });
  });

  beforeEach(done => {
    knex.seed.run()
    .then(() => done());
  });

  it('should POST a new trim_id.', (done) =>{
      chai.request(server)
      .post('/api/v1/makes/Audi/models/Q7/2014/')
      .set('Authorization', token)
      .send({
	       'trim':{
           'fuel_type': 'gasoline',
           'horsepower': '900',
           'cylinders': '12',
           'transmission': 'Manual',
           'drive': 'All Wheel Drive',
           'doors': '2',
           'market': 'High Performance, luxury',
           'size': 'sports car',
           'style': 'sports car',
           'highway_mpg': '45',
           'city_mpg': '32',
           'msrp': '180000'
	        }
        })
      .end((err, response) => {
        response.should.have.status(201);
        response.should.be.json;
        done();
      });
    });

  it('should POST a new model based on make.', (done) =>{
      chai.request(server)
      .post('/api/v1/makes/Audi/')
      .set('Authorization', token)
      .send({
	       'model':{
           'model_name':'Sweet Model',
           'trim_id':1,
           'year': 2015,
           'fuel_type': 'gasoline',
           'horsepower': 900,
           'cylinders': '12',
           'transmission': 'Manual',
           'drive': 'All Wheel Drive',
           'doors': 2,
           'market': 'High Performance, luxury',
           'size': 'sports car',
           'style': 'sports car',
           'highway_mpg': 45,
           'city_mpg': 32,
           'msrp': 180000
	        }
        })
      .end((err, response) => {
        response.should.have.status(201);
        response.should.be.json;
        chai.request(server)
        .get('/api/v1/makes/Audi')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          done();
        });
      });
    });
});

describe('PUT tests', () =>{

  before((done)=> {
    knex.migrate.rollback()
    .then(() =>{
      knex.migrate.latest()
      .then(() => {
        return knex.seed.run()
        .then(()=> {
          done();
        });
      });
    });
  });

  beforeEach(done => {
    knex.seed.run()
    .then(() => done());
  });

  it('should PUT a new trim_id.', (done) =>{
      chai.request(server)
      .put('/api/v1/makes/Audi/models/Q7/2014/1')
      .set('Authorization', token)
      .send({
	       'trim':{
           'msrp': 99999999,
	        }
        })
      .end((err, response) => {
        response.should.have.status(202);
        response.should.be.json;
        chai.request(server)
        .get('/api/v1/makes/Audi/models/Q7/2014/1')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body[0].should.have.property('msrp');
          response.body[0].msrp.should.equal('99999999');
          done();
        });
      });
    });

  it('should PUT a new trim_id.', (done) =>{
      chai.request(server)
      .put('/api/v1/makes/Audi/models/Q7')
      .set('Authorization', token)
      .send({
	       'model_name':{
           'model_name': 'RSQ7',
	        }
        })
      .end((err, response) => {
        response.should.have.status(201);
        response.should.be.json;
        chai.request(server)
        .get('/api/v1/makes/Audi/models/')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body[1].model_name.should.equal('RSQ7');
          done();
        });
      });
    });
});

describe('DELETE endpoint tests', () =>{

  before((done)=> {
    knex.migrate.rollback()
    .then(() =>{
      knex.migrate.latest()
      .then(() => {
        return knex.seed.run()
        .then(()=> {
          done();
        });
      });
    });
  });

  beforeEach(done => {
    knex.seed.run()
    .then(() => done());
  });

  it('should DELETE a model.', (done) =>{
      chai.request(server)
      .post('/api/v1/makes/Audi/')
      .set('Authorization', token)
      .send({
	       'model':{
           'model_name':'shiny',
           'trim_id':1,
           'year': 2015,
           'fuel_type': 'gasoline',
           'horsepower': 900,
           'cylinders': '12',
           'transmission': 'Manual',
           'drive': 'All Wheel Drive',
           'doors': 2,
           'market': 'High Performance, luxury',
           'size': 'sports car',
           'style': 'sports car',
           'highway_mpg': 45,
           'city_mpg': 32,
           'msrp': 180000
	        }
        })
      .end((err, response) => {
        response.should.have.status(201);
        response.should.be.json;
        chai.request(server)
        .get('/api/v1/makes/Audi/models')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body.length.should.equal(3);
          chai.request(server)
          .delete('/api/v1/makes/Audi/models/shiny')
            .set('Authorization', token)
            .end((err, response) =>{
              response.should.have.status(200);
              chai.request(server)
              .get('/api/v1/makes/Audi/models')
              .end((err, response) => {
                response.should.have.status(200);
                response.should.be.json;
                response.body.should.be.a('array');
                response.body.length.should.equal(2);
                done();
            });
          });
        });
      });
    });

    // it('should DELETE a models year information.', (done) =>{
    //   chai.request(server)
    //   .get('/api/v1/makes/Mazda/models/Miata')
    //   .end((err, response) => {
    //     response.should.have.status(200);
    //     response.should.be.json;
    //     response.body.should.be.a('array');
    //     response.body[1].year.should.equal(2012);
    //     response.body.length.should.equal(2)
    //     chai.request(server)
    //     .delete('/api/v1/makes/Mazda/models/Miata/2012')
    //       .set('Authorization', token)
    //       .end((err, response) =>{
    //         response.should.have.status(204);
    //         chai.request(server)
    //         .get('/api/v1/makes/Mazda/models/Miata')
    //         .end((err, response) => {
    //           response.should.have.status(200);
    //           response.should.be.json;
    //           response.body.should.be.a('array');
    //           response.body.length.should.equal(1)
    //           done();
    //       })
    //     })
    //   })
    // })
});
