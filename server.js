const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser')
const config = require('dotenv').config()

const environment = process.env.NODE_ENV || 'development'
const configuration = require('./knexfile')[environment]
const database = require('knex')(configuration)

app.set('username', process.env.USERNAME);
app.set('password', process.env.PASSWORD);
app.set('secretKey', process.env.CLIENT_SECRET);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('port', process.env.PORT || 3000)
app.locals.title = 'BYOB'

app.use(express.static('public'))

if (!process.env.CLIENT_SECRET || !process.env.USERNAME || !process.env.PASSWORD) {
  throw 'Make sure you have a CLIENT_SECRET, USERNAME, and PASSWORD in your .env file'
}

/////Endpoints/////

//Authentication

app.post('/api/v1/authenticate', (request, response) =>{
  const user = request.body
  if (user.username !== config.USERNAME || user.password !== config.PASSWORD) {
    response.status(403).send({
      success: false,
      message: 'Invalid Credentials'
    });

    } else {
      let token = jwt.sign(user, app.get('secretKey'), {
        expiresIn: 604800 // expires in 48 hours
      });

      response.json({
        success: true,
        username: user.username,
        token: token
      });
    }
})

const checkAuth  = (request, response, next) =>{

  const token = request.body.token ||
                request.params.token ||
                request.headers.authorization;
  if (token) {
    jwt.verify(token, app.get('secretKey'), (error, decoded) => {
    if (error) {
      return response.status(403).send({
        success: false,
        message: 'Invalid authorization token.'
      });
    } else {
      request.decoded = decoded;
      next();
      }
    });
  } else {
    return response.status(403).send({
      success: false,
      message: 'You must be authorized to hit this endpoint'
    });
  }
}


//GET ENDPOINTS ----------//
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
  const make_name = request.params.make_name

  if (!make_name) {
    return response.status(422).send({
      error: `Missing make_name parameter in api request. `
    })
  }
  database('makes').where(database.raw(`lower(make_name)`), make_name.toLowerCase()).select()
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
  const make_name = request.params.make_name

  if (!make_name) {
    return response.status(422).send({
      error: `Missing make_name parameter in api request.`
    })
  }

  database('makes').where(database.raw(`lower(make_name)`), make_name.toLowerCase()).select()
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

//query makes to get models
app.get('/api/v1/models/', (request, response) => {
  let query = request.query.q
  database('makes').where(database.raw(`lower(make_name)`), query.toLowerCase())
    .then((make) => {
      database('models').where('make_id', make[0].id).select()
      .then((model)=>{
        if(model.length && model[0].model_name !== null){
          response.status(200).json(model)
        } else if (model[0].model_name === null) {
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

//get years per model
app.get('/api/v1/makes/:make_name/models/:model_name', (request, response) =>{

  const model_name = request.params.model_name
  const make_name = request.params.make_name

  if (!make_name) {
    return response.status(422).send({
      error: `Missing make_name parameter in api request.`
    })
  }

  database('makes').where(database.raw(`lower(make_name)`), make_name.toLowerCase()).select()
    .then((make) => {
      database('models').where(database.raw(`lower(model_name)`), model_name.toLowerCase()).select()
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

//query models to get year data.
app.get('/api/v1/years/', (request, response) =>{
  let query = request.query.q
    database('models').where(database.raw(`lower(model_name)`), query.toLowerCase())
    .then((model)=>{
      database('years').where('model_id', model[0].id).select()
      .then((year) =>{
        if(year.length){
          response.status(200).json(year)
        } else {
          response.status(404).json({
            error: '404: No Years Found per model'
          })
        }
      })
    })
  .catch(() => {
    response.status(500).send({
      'Error': '500: Internal error retrieving specific year info by make_name.'
    })
  })
})

//get all trims from make -> model -> year
app.get('/api/v1/makes/:make_name/models/:model_name/:year', (request, response) =>{

  const expectedReq = ['make_name', 'model_name', 'year'];
  const data = request.params;
  for(let requiredParameter of expectedReq){
    if(!data[requiredParameter]){
      return response.status(422).json({
        error: `Expected format requires a Make Name, a Model Name, and a Year.
        You are missing a ${requiredParameter} property`
      })
    }
  }
  const make_name = request.params.make_name
  const model_name = request.params.model_name
  const year = request.params.year

  database('makes').where(database.raw(`lower(make_name)`), make_name.toLowerCase()).select()
    .then((make) => {
      database('models').where({
        "lower(model_name)": model_name.toLowerCase(),
        make_id: make[0].id
      }).select()
      .then((model)=>{
        database('years').where({
          year: year,
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

  const expectedReq = ['make_name', 'model_name', 'year', 'id'];
  const data = request.params;
  for(let requiredParameter of expectedReq){
    if(!data[requiredParameter]){
      return response.status(422).json({
        error: `Expected format requires a Make Name, a Model Name, a Year, and Trim Id.
        You are missing a ${requiredParameter} property`
      })
    }
  }
  const make_name = request.params.make_name
  const model_name = request.params.model_name
  const year = request.params.year
  const trim_id = request.params.trim_id

  database('makes').where(database.raw(`lower(make_name)`), make_name.toLowerCase()).select()
    .then((make) => {
      database('models').where(database.raw({
        "lower(model_name)": model_name.toLowerCase(),
        make_id: make[0].id
      })).select()
      .then((model)=>{
        database('years').where({
          year: year,
          model_id: model[0].id
        }).select()
        .then((year) =>{
          database('trims').where({
            year_id: year[0].id,
            trim_id: trim_id
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

//POST ENDPOINTS----------------//

//post a new trim to a specific model by year.
app.post('/api/v1/makes/:make_name/models/:model_name/:year/', checkAuth, (request, response) =>{

  const expectedReq = ['make_name', 'model_name', 'year'];
  const data = request.params;
  for(let requiredParameter of expectedReq){
    if(!data[requiredParameter]){
      return response.status(422).json({
        error: `Expected format requires a Make Name, a Model Name, and a Year.
        You are missing a ${requiredParameter} property`
      })
    }
  }
  const trimData = request.body.trim
  const { make_name, model_name, year } = request.params

  database('makes').where(database.raw(`lower(make_name)`), make_name.toLowerCase()).select()
    .then((make) => {
      database('models').where(database.raw({
        "lower(model_name)": model_name.toLowerCase(),
        make_id: make[0].id
      })).select()
      .then((model)=>{
        database('years').where({
          year: year,
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

//post completely new model with year and trim data.
app.post('/api/v1/makes/:make_name', checkAuth, (request, response) =>{
  let make_name = request.params.make_name
    if(!make_name){
      return response.status(422).json({
        error: `Expected format requires a Make Name, a Model Name, and a Year.
        You are missing a ${make_name} property`
      })
    }

  let newModelData = request.body.model

  database('makes').where(database.raw(`lower(make_name)`), make_name.toLowerCase()).select()
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

//PUT ENDPOINTS ------------//

//put trim data and update the specific trim data
app.put('/api/v1/makes/:make_name/models/:model_name/:year/:trim_id', checkAuth, (request, response) =>{

  const expectedReq = ['make_name', 'model_name', 'year', 'trim_id'];
  const data = request.params;
  for(let requiredParameter of expectedReq){
    if(!data[requiredParameter]){
      return response.status(422).json({
        error: `Expected format requires a Make Name, a Model Name, a Year, and Trim ID.
        You are missing a ${requiredParameter} property`
      })
    }
  }

  let trimUpdate = request.body.trim
  const { make_name, model_name, year, trim_id } = request.params

  database('makes').where(database.raw(`lower(make_name)`), make_name.toLowerCase()).select()
    .then((make) => {
      database('models').where(database.raw({
        "lower(model_name)": model_name.toLowerCase(),
        make_id: make[0].id
      })).select()
      .then((model)=>{
        database('years').where({
          year: year,
          model_id: model[0].id
        }).select()
        .then((year) =>{
          database('trims').where({
            year_id: year[0].id,
            trim_id: trim_id
          })
          .update(trimUpdate, 'id')
              .then((id)=>{
                response.status(202).json({
                  id,
                  'message': `${id} was updated`
                })
              })
              .catch((error) =>{
                response.status(404).json({
                  error,
                  'message': 'Error updating trim data'
                })
              })
          })
        })
      })
    .catch(() => {
      response.status(500).send({
        'Error': '500: Internal error updating specific trim data.'
      })
    })
})

//update year data by model
app.put('/api/v1/makes/:make_name/models/:model_name/:year', checkAuth, (request, response) =>{

  const expectedReq = ['make_name', 'model_name', 'year'];
  const data = request.params;
  for(let requiredParameter of expectedReq){
    if(!data[requiredParameter]){
      return response.status(422).json({
        error: `Expected format requires a Make Name, a Model Name, and a Year.
        You are missing a ${requiredParameter} property`
      })
    }
  }

  let yearUpdate = request.body.year

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
        }).update(yearUpdate, 'year')
          .then((year)=>{
              response.status(202).json({
                'message': `year was updated`
              })
            })
            .catch((error) =>{
              response.status(404).json({
                'error': 'Error updating year data'
              })
            })
          })
        })
        .catch(() => {
          response.status(500).send({
            'Error': '500: Internal error updating specific trim data.'
          })
        })
      })

//put update model name
app.put('/api/v1/makes/:make_name/models/:model_name', checkAuth, (request, response) =>{

  const expectedReq = ['make_name', 'model_name'];
  const data = request.params;
  for(let requiredParameter of expectedReq){
    if(!data[requiredParameter]){
      return response.status(422).json({
        error: `Expected format requires a Make Name and Model Name.
        You are missing a ${requiredParameter} property`
      })
    }
  }

  let updateModelName = request.body.model_name

  database('makes').where('make_name', request.params.make_name).select()
    .then((make) => {
      database('models').where('model_name', request.params.model_name).update(updateModelName, 'model_name')
      .then((model_name) =>{
        response.status(201).json({
          model_name
        })
      })
      .catch(() => {
        response.status(404).send({
          'Error': 'Error, couldn\'t update model name.'
        })
      })
    })
    .catch(() => {
      response.status(500).send({
        'Error': '500: Internal error retrieving specific make by make_name.'
      })
    })
})

//DELETE ENDPOINTS ----------//

//delete a model and it's affiliated data.
app.delete('/api/v1/makes/:make_name/models/:model_name', checkAuth, (request, response) =>{

  const expectedReq = ['make_name', 'model_name'];
  const data = request.params;
  for(let requiredParameter of expectedReq){
    if(!data[requiredParameter]){
      return response.status(422).json({
        error: `Expected format requires a Make Name and Model Name.
        You are missing a ${requiredParameter} property`
      })
    }
  }

  database('makes').where('make_name', request.params.make_name).select()
    .then((make) => {
      database('models').where('model_name', request.params.model_name).select()
      .then((model) =>{
        let model_id = model[0].id
        database('years').where({model_id: model[0].id}).select()
        .then((years) =>{
          let year_id = years[0].id
          database('trims').where({year_id: years[0].id}).select()
          .then(() => database('trims').where({year_id: year_id}).del())
          .then(() => database('years').where({model_id: model_id}).del())
          .then(() => database('models').where({model_name: request.params.model_name}).del())
        .then((data) =>{
          response.status(200).json({
            message: 'Model data and affiliated were deleted.'
          })
        })
        .catch((error) =>{
          response.status(500).json({
            message: 'Internal error deleting entries associated with model selected.'
          })
        })
      })
    })
  })
  .catch((error) => response.status(500).json({error: 'error deleting content'}))
})

//delete a models's year and it's affiliated data
app.delete('/api/v1/makes/:make_name/models/:model_name/:year', checkAuth, (request, response) =>{

  const expectedReq = ['make_name', 'model_name', 'year'];
  const data = request.params;
  for(let requiredParameter of expectedReq){
    if(!data[requiredParameter]){
      return response.status(422).json({
        error: `Expected format requires a Make Name, a Model Name, and a Year.
        You are missing a ${requiredParameter} property`
      })
    }
  }

  database('makes').where('make_name', request.params.make_name).select()
    .then((make) => {
      database('models').where('model_name', request.params.model_name).select()
      .then((model) =>{
        let model_id = model[0].id
        database('years').where({model_id: model[0].id}).select()
        .then((years) =>{
          let year_id = years[0].id
          database('trims').where({year_id: years[0].id}).select()
          .then(() => database('trims').where({year_id: year_id}).del())
          .then(() => database('years').where({model_id: model_id}).del())
        .then((data) =>{
          response.status(200).json({
            message: 'Year data and affiliated trims were deleted.'
          })
        })
        .catch((error) =>{
          response.status(500).json({
            message: 'Internal error deleting entries associated with model and year selected.'
          })
        })
      })
    })
  })
  .catch((error) => response.status(500).json({error: 'error deleting content'}))
})



app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`)
})

module.exports = app;
