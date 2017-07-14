const carData = require ('../../../data.json')
const Helper = require('../../../helper')

let helper = new Helper()

const importTrims = (knex, trim, year) =>{
  return knex('trims').insert({
    year_id: year[0],
    trim_id: parseInt(trim.trim_id, 10),
    fuel_type: trim.fuel_type,
    horsepower: parseInt(trim.horsepower, 10),
    cylinders: trim.cylinders,
    transmission: trim.transmission,
    drive: trim.drive,
    doors: parseInt(trim.doors, 10),
    market: trim.market,
    size: trim.size,
    style: trim.style,
    highway_mpg: parseInt(trim.highway_mpg, 10),
    city_mpg: parseInt(trim.city_mpg, 10),
    msrp: parseInt(trim.msrp, 10)
  })
}

const importYears = (knex, year, model) =>{
  let trims = year.trim
  return knex('years').insert({
    year: parseInt(year.year, 10),
    model_id: model[0]
  }, 'id')
    .then((year) =>{
      let trimsPromise = [];
      trims.forEach((trim) =>{
        trimsPromise.push(importTrims(knex, trim, year))
      })
      return Promise.all(trimsPromise)
      .then(()=> console.log('Seeding Complete at Trims'))
      .catch((error) => console.log(`Error seeding at Trims Promise: ${error}`))
    })
}

const importModels = (knex, model, make) =>{
  let years = model.years
  return knex('models').insert({
    model_name: model.name,
    make_id: make[0],
  }, 'id')
  .then((model) =>{
    let yearsPromise = [];
    years.forEach((year)=>{
      yearsPromise.push(importYears(knex, year, model))
    })
    return Promise.all(yearsPromise)
    .then(() => console.log('Seeding Complete at Years'))
    .catch((error) => console.log(`Error seeding at Years Promise: ${error}`))
  })
};

const importMakes = (knex, make, carsData) =>{
  let models = carsData[make].models;
  return knex('makes').insert({
    make_name: make
  }, 'id')
    .then((make) =>{
      let modelsPromise = [];
      models.forEach((model)=>{
        modelsPromise.push(importModels(knex, model, make))
      })
      return Promise.all(modelsPromise)
      .then(() => console.log('Seeding Complete at Models Promise'))
      .catch((error) => console.log(`Error seeding data at Models Promise: ${error}`))
    })
};


exports.seed = (knex, Promise) => {
  let carsData = helper.reduceMakes(carData);
  let makesArray = Object.keys(carsData);
  console.log(carsData)
  return knex('models').del()
    .then(() => knex('makes').del())
    .then(() =>{
      let makesPromise = [];
      makesArray.forEach((make) =>{
        makesPromise.push(importMakes(knex, make, carsData))
      })
      return Promise.all(makesPromise)
      .then(() => console.log('Seeding Complete at Makes Promise'))
      .catch((error) => console.log(`Error seeding data at makesPromise: ${error}`))
    })
    .catch( error => console.log(`Error seeding data: ${error}`))
};
