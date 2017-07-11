class Helper{

  addTrims(carData){
    let holder = {};
    let count = 0;

    let addCount = carData.map((car, i) =>{
      car.trim = 1;
      return car
    })

    let newCarData = addCount.map((car, i) =>{
      if(parseInt(car.Year, 10) === parseInt(carData[i-count].Year) && car.Model === carData[i-count].Model){
        car.trim = carData[i-count].trim + 1;
        count = 1;
      } else {
        count = 0;
        car.trim = 1;
      }
      return car
    })
    return newCarData
  }

  reduceMakes(carData){
    let trimData = this.addTrims(carData)

    let newCarData = trimData.reduce((acc, car)=>{
      if(!acc[car.Make]){
        acc[car.Make] = {
          name: car.Make,
          models: [{
            name: car.Model,
            years: [{
              year: car.Year,
              trim: [{
                trim_id: car.trim,
                fuel_type: car['Engine Fuel Type'],
                horsepower: car['Engine HP'],
                cylinders: car['Engine Cylinders'],
                transmission: car['Transmission Type'],
                drive: car['Driven_Wheels'],
                doors: car['Number of Doors'],
                market: car['Market Category'],
                size: car['Vehicle Size'],
                style: car['Vehicle Style'],
                highway_mpg: parseInt(car['highway MPG'],10),
                city_mpg: parseInt(car['city mpg'],10),
                msrp: parseInt(car['MSRP'], 10)
              }]
            }]
          }]
        }
      } else if (acc[car.Make]){

        let modelExists = acc[car.Make].models.find((model) =>{
          return model.name === car.Model
        })

        let indexOfModel = acc[car.Make].models.indexOf(modelExists)

        let yearExists

        acc[car.Make].models.forEach(model =>{
         yearExists = model.years.find((year)=>{
           return year.year === car.Year
         })
        })

        if(modelExists && yearExists){
          let modelIndex = acc[car.Make].models.indexOf(modelExists)
          let yearIndex = acc[car.Make].models[modelIndex].years.indexOf(yearExists)
          acc[car.Make].models[modelIndex].years[yearIndex].trim.push({
                trim_id: car.trim,
                fuel_type: car['Engine Fuel Type'],
                horsepower: car['Engine HP'],
                cylinders: car['Engine Cylinders'],
                transmission: car['Transmission Type'],
                drive: car['Driven_Wheels'],
                doors: car['Number of Doors'],
                market: car['Market Category'],
                size: car['Vehicle Size'],
                style: car['Vehicle Style'],
                highway_mpg: parseInt(car['highway MPG'],10),
                city_mpg: parseInt(car['city mpg'],10),
                combo_mpg: (parseInt(car['city mpg'], 10) + parseInt(car['highway MPG'], 10))/2,
                msrp: parseInt(car['MSRP'], 10)
              })
        } else if (modelExists && !yearExists){
          let index = acc[car.Make].models.indexOf(modelExists)
          acc[car.Make].models[index].years.push({
              year: car.Year,
              trim: [{
                trim_id: car.trim,
                fuel_type: car['Engine Fuel Type'],
                horsepower: car['Engine HP'],
                cylinders: car['Engine Cylinders'],
                transmission: car['Transmission Type'],
                drive: car['Driven_Wheels'],
                doors: car['Number of Doors'],
                market: car['Market Category'],
                size: car['Vehicle Size'],
                style: car['Vehicle Style'],
                highway_mpg: parseInt(car['highway MPG'],10),
                city_mpg: parseInt(car['city mpg'],10),
                combo_mpg: (parseInt(car['city mpg'], 10) + parseInt(car['highway MPG'], 10))/2,
                msrp: parseInt(car['MSRP'], 10)
              }]
            })
        } else if(!modelExists){
          acc[car.Make].models.push({
            name: car.Model,
            years: [{
              year: car.Year,
              trim: [{
                trim_id: car.trim,
                fuel_type: car['Engine Fuel Type'],
                horsepower: car['Engine HP'],
                cylinders: car['Engine Cylinders'],
                transmission: car['Transmission Type'],
                drive: car['Driven_Wheels'],
                doors: car['Number of Doors'],
                market: car['Market Category'],
                size: car['Vehicle Size'],
                style: car['Vehicle Style'],
                highway_mpg: parseInt(car['highway MPG'],10),
                city_mpg: parseInt(car['city mpg'],10),
                combo_mpg: (parseInt(car['city mpg'], 10) + parseInt(car['highway MPG'], 10))/2,
                msrp: parseInt(car['MSRP'], 10)
              }]
            }]
          })
        }
      }
      return acc
    }, {})
    return newCarData
  }

}

module.exports = Helper
