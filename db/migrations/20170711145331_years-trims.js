
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('years', (table) => {
      table.increments('id').primary()
      table.integer('year')
      table.integer('model_id').unsigned()
      table.foreign('model_id').references('models.id')

      table.timestamps(true, true)
    }),

    knex.schema.createTable('trims', (table) => {
      table.increments('id').primary()
      table.integer('year_id').unsigned()
      table.foreign('year_id').references('years.id')
      table.integer('trim_id')
      table.string('fuel_type')
      table.string('horsepower')
      table.string('cylinders')
      table.string('transmission')
      table.string('drive')
      table.string('doors')
      table.string('market')
      table.string('size')
      table.string('style')
      table.string('highway_mpg')
      table.string('city_mpg')
      table.string('msrp')

      table.timestamps(true, true)
    })
  ])
};

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.dropTable('trims'),
    knex.schema.dropTable('years')
  ]);
};
