const carData = require ('../../../data.json')

const reduceMakes = (carData) =>{
   let newCarData = carData.reduce((acc, car)=>{
    if(!acc[car.Make]){
      acc[car.Make] = {
        name: car.Make,
        models: [car.Model]
      }
    } else if (acc[car.Make]){
      if(!acc[car.Make].models.includes(car.Model)){
        acc[car.Make].models.push(car.Model)
      }
    }
    return acc
  }, [])
  return newCarData
}

const importMakes = (knex, make) =>{
  let models = make.models

  return knex('models').insert({
   name: make.name
  }, 'id')
  .then((make) =>{
    let modelsPromise = []
    models.forEach((model)=>{
      modelsPromise.push(importModels(knex, model, make))
    })
    return Promise.all(modelsPromise)
    .then(() => console.log('Seeding Complete at Models Promise'))
    .catch((error) => console.log(`Error seeding data at Models Promise: ${error}`))
  })
}

const importModels = (knex, model, make) =>{
  return knex('makes').insert({
   name: model,
   make_id: make[0]
  }, 'id')
}

exports.seed = (knex, Promise) => {
  let makesData = reduceMakes(carData)
  return knex('models').del()
    .then(() => knex('makes').del())
    .then(() =>{
      let makesPromise = []
      makesData.forEach((make) =>{
        makesPromise.push(importMakes(knex, make))
      })
      return Promise.all(makesPromise)
      .then(() => console.log('Seeding Complete at Makes Promise'))
      .catch((error) => console.log(`Error seeding data at makesPromise: ${error}`))
    })
    .catch( error => console.log(`Error seeding data: ${error}`))
};
