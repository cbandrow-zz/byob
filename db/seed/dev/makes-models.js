const carData = require ('../../../data.json')

const addTrims = (carData) =>{
  let holder = {};
  let count = 0;

  let addCount = carData.map((car, i) =>{
    car.trim = 1;
    return car
  })

  let newCarData = addCount.map((car, i) =>{
    if(parseInt(car.Year, 10) === parseInt(carData[i-count].Year) && car.Model === carData[i-count].Model){
      console.log('match year and model', car.Model, car.Year)
      car.trim = carData[i-count].trim + 1;
      count = 1;
    } else {
      console.log('no match')
      count = 0;
      car.trim = 1;
    }
    return car
  })
  return newCarData
}
addTrims(carData)

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
 }, {})
 return newCarData
}

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

const importModels = (knex, model, make) =>{
  return knex('models').insert({
    model_name: model,
    make_id: make[0]
  }, 'id')
};

exports.seed = (knex, Promise) => {
  let carsData = reduceMakes(carData);
  let makesArray = Object.keys(carsData);

  return knex('models').del()
    .then(() => knex('makes').del())
    .then(() =>{
      let makesPromise = [];
      makesArray.forEach((make, i) =>{
        makesPromise.push(importMakes(knex, make, carsData))
      })
      return Promise.all(makesPromise)
      .then(() => console.log('Seeding Complete at Makes Promise'))
      .catch((error) => console.log(`Error seeding data at makesPromise: ${error}`))
    })
    .catch( error => console.log(`Error seeding data: ${error}`))
};
