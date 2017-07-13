const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser')

const environment = process.env.NODE_ENV || 'development'
const configuration = require('./knexfile')[environment]
const database = require('knex')(configuration)

const host = process.env.DOMAIN || 'localhost:3000/'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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

app.post('/api/v1/makes/:make_name/models/:model_name/:year/', (request, response) =>{
  let trimData = request.body
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
          let yearId = year[0].id
          database('trims').where({
            year_id: year[0].id,
          }).select()
            .then((trims) =>{
              let incrementedTrim = trims[0].id + 1
              database('trims').insert({
                year_id: yearId,
                trim_id: incrementedTrim,
                fuel_type: trimData.fuel_type,
                horsepower: trimData.horsepower,
                cylinders: trimData.cylinders,
                transmission: trimData.transmission,
                drive: trimData.drive,
                doors: trimData.doors,
                market: trimData.market,
                size: trimData.size,
                style: trimData.style,
                highway_mpg: trimData.highway_mpg,
                city_mpg: trimData.city_mpg,
                msrp: trimData.msrp
              })
              .then(()=>{
                response.status(201).json(trims)
              })
              .catch(() =>{
                response.status(402).json({
                  error: 'Error posting a new trim'
                })
              })
          })
        })
      })
    })
    .catch(() => {
      response.status(500).send({
        'Error': '500: Internal error posting specific trim data.'
      })
    })
})

//add completely new model with year and trim data.
app.post('/api/v1/makes/:make_name', (request, response) =>{
  let newModelData = request.body
  database('makes').where({
    make_name: request.params.make_name
    }).select()
    .then((make) => {
      database('models').insert({
        model_name: newModelData.model_name,
        make_id: make[0].id,
      }, 'id')
      .then((model)=>{
        database('years').insert({
          year: newModelData.year,
          model_id: model[0]
        }, 'id')
        .then((year) =>{
          database('trims').insert({
            year_id: year[0],
            trim_id: newModelData.trim_id,
            fuel_type: newModelData.fuel_type,
            horsepower: newModelData.horsepower,
            cylinders: newModelData.cylinders,
            transmission: newModelData.transmission,
            drive: newModelData.drive,
            doors: newModelData.doors,
            market: newModelData.market,
            size: newModelData.size,
            style: newModelData.style,
            highway_mpg: newModelData.highway_mpg,
            city_mpg: newModelData.city_mpg,
            msrp: newModelData.msrp
          }).select()
              .then((trims)=>{
                response.status(201).json(trims)
              })
              .catch(() =>{
                response.status(402).json({
                  error: 'Error posting a new trim'
              })
          })
        })
      })
    })
    .catch(() => {
      response.status(500).send({
        'Error': '500: Internal error posting detailed model data.'
      })
    })
})

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`)
})

module.exports = app;
