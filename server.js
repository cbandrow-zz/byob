const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

const environment = process.env.NODE_ENV || 'development'
const configuration = require('./knexfile')[environment]
const database = require('knex')(configuration)

const host = process.env.DOMAIN || 'localhost:3000/'

app.set('port', process.env.PORT || 3000)
app.locals.title = "BYOB"

app.use(express.static('public'))

//get all makes
app.get('/api/v1/makes', (request, response) =>{
  database('makes').select()
  .then((makes)=>{
    if(makes.length){
        response.status(200).json(makes)
      } else {
        response.status(404).json({
          error: ' 404: No Makes Found'
        })
      }
    })
    .catch(() => {
      response.status(500).send(
        {
          'Error':'500: Internal error retrieving specific all models.'
        }
      )
    })
  })

//get specific make
app.get('/api/v1/makes/:make_name/', (request, response) => {
  database('makes').where('make_name', request.params.make_name).select()
    .then((make) => {
      if(make.length){
        response.status(200).json(make)
      } else {
        response.status(404).json({
          error: '404: No Makes Found'
        })
      }
    })
    .catch(() => {
      response.status(500).send({
        'Error': '500: Internal error retrieving specific make by make_name.'
      })
    })
})

//get models from make
app.get('/api/v1/makes/:make_name/models', (request, response) => {
  database('makes').where('make_name', request.params.make_name).select()
    .then((make) => {
      database('models').where('make_id', make[0].id).select()
      .then((model)=>{
        if(model.length){
          response.status(200).json(model)
        } else {
          response.status(404).json({
            error: '404: No Models Found'
          })
        }
      })
    })
    .catch(() => {
      response.status(500).send({
        'Error': '500: Internal error retrieving specific make by make_name.'
      })
    })
})

//get years from make -> model
app.get('/api/v1/makes/:make_name/models/:model_name', (request, response) =>{
  database('makes').where('make_name', request.params.make_name).select()
    .then((make) => {
      database('models').where('model_name', request.params.model_name).select()
      .then((model)=>{
        database('years').where('model_id', model[0].id).select()
        .then((years) =>{
          if(model.length){
            response.status(200).json(years)
          } else {
            response.status(404).json({
              error: '404: No Years Found permodel'
            })
          }
        })
      })
    })
    .catch(() => {
      response.status(500).send({
        'Error': '500: Internal error retrieving specific make by make_name.'
      })
    })
})

//get all trims from make -> model -> year
app.get('/api/v1/makes/:make_name/models/:model_name/:year', (request, response) =>{
  database('makes').where({
    make_name: request.params.make_name
    }).select()
    .then((make) => {
      database('models').where({
        model_name: request.params.model_name,
        make_id: make[0].id
      }).select()
      .then((model)=>{
        database('years').where({
          year: request.params.year,
          model_id: model[0].id
        }).select()
        .then((year) =>{
          database('trims').where({
            year_id: year[0].id
          }).select()
            .then((trims) =>{
              if(trims.length){
                response.status(200).json(trims)
              } else {
                response.status(404).json({
                  error: '404: No Trims Found Per Year Per Model'
                })
              }
          })
        })
      })
    })
    .catch(() => {
      response.status(500).send({
        'Error': '500: Internal error retrieving specific trim data.'
      })
    })
})

//get specific trim by trim id
app.get('/api/v1/makes/:make_name/models/:model_name/:year/:id', (request, response) =>{
  database('makes').where({
    make_name: request.params.make_name
    }).select()
    .then((make) => {
      database('models').where({
        model_name: request.params.model_name,
        make_id: make[0].id
      }).select()
      .then((model)=>{
        database('years').where({
          year: request.params.year,
          model_id: model[0].id
        }).select()
        .then((year) =>{
          database('trims').where({
            year_id: year[0].id,
            trim_id: request.params.id
          }).select()
            .then((trims) =>{
              if(trims.length){
                response.status(200).json(trims)
              } else {
                response.status(404).json({
                  error: '404: No Trims Found Per Year Per Model'
                })
              }
          })
        })
      })
    })
    .catch(() => {
      response.status(500).send({
        'Error': '500: Internal error retrieving specific trim data.'
      })
    })
})

//post: add a new model to makes
app.post('/api/v1/makes/:make_name/', (request, response) => {
  console.log(request.body)
  database('makes').where({
    make_name: request.params.make_name
  })
  .then((make) =>{
    response.status(201).json(make)
  })
})

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`)
})

module.exports = app;
