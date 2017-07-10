const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
import carData from 'data.json'

const environment = process.env.NODE_ENV || 'development'
const configuration = require('./knexfile')[environment]
const database = require('knex')(configuration)

app.set('port', process.env.PORT || 3000)

app.use(express.static('public'))

app.get('/api/v1/models', (request, response) =>{
  database('models').select()
  .then((models)=>{
    if(models.length){
        response.status(200).json(models)
      } else {
        response.status(404).json({
          error: ' 404: No Models Found'
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

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`)
})

module.exports = app;
