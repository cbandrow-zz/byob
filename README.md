# Build Your Own Backend - Car Data
#### BYOB - Car Data includes a large set of data that allows developers to navigate and discover more information about makes and models of vehicles. Vehicles included are for the past 20 years, and include 3 unique sets of year data per.

[Original Assignment](http://frontend.turing.io/projects/build-your-own-backend.html)

## End Points

### GET
* '/api/v1/makes : returns all makes
* '/api/v1/makes/:make_name : returns brief make data where :make_name is the name of the make entered.
* '/api/v1/makes/:make_name/models : returns all models where :make_name is the selecting parent table.
* '/api/v1/models/?q=[make_name] : returns all models where the query is the name of the make.
* '/api/v1/makes/:make_name/models/:model_name : returns years associated with a model, based on a model_name and a make_name
* '/api/v1/years/?q=[model_name] : returns all years associated where the data equals the model_name
* '/api/v1/makes/:make_name/models/:model_name/:year : returns all trims where make_name, model_name, and year match.
* '/api/v1/makes/:make_name/models/:model_name/:year/:id : returns the one trim where make_name, model_name, and year match.

### DELETE - JWT authorization required
* '/api/v1/makes/:make_name/models/:model_name' : deletes all model data and associated data (years, trims) where make_name and mode_name match.
* '/api/v1/makes/:make_name/models/:model_name/:year' : deletes a single year and it's nested trims where make_name, model_name, and year match.

### PUT - JWT authorization required
* '/api/v1/makes/:make_name/models/:model_name/:year/:trim_id : updates specific trim data where make_name, model_name, year, and trim_id match. Requests should include one or more of the trim specific data, including fuel_type, horsepower, cylinders, transmission, drive, doors, market, size, style, highway_mpg, city_mpg, and msrp.
Authentication is required for this endpoint and can be found at '/api/v1/authentication'.
* '/api/v1/makes/:make_name/models/:model_name/:year : updates year data where make_name, model_name, and year match. Requires a year object to update the selected year.
* '/api/v1/makes/:make_name/models/:model_name/:year : updates year data where make_name, and model_name match. Requires a model_name object to update the model_name.

### POST - JWT authorization required
* '/api/v1/makes/:make_name/models/:model_name/:year/' : adds a new trim where make_name, model_name, and year match. Requests should include all sets of data for trims, including the fuel_type, horsepower, cylinders, transmission, drive, doors, market, size, style, highway_mpg, city_mpg, and msrp. Authentication is required for this endpoint and can be found at '/api/v1/authentication'.
* '/api/v1/makes/:make_name : adds a new model to a make database, where make_name is the selected make. Requests should include the desire posting Year and Trim_Id. Requests also should include all sets of data for trims, including the fuel_type, horsepower, cylinders, transmission, drive, doors, market, size, style, highway_mpg, city_mpg, and msrp.  Authentication is required for this endpoint and can be found
