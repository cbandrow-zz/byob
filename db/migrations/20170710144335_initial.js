
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('makes', (table) => {
      table.increments('id').primary();
      table.string('make_name');

      table.timestamps(true, true);
    }),

    knex.schema.createTable('models', (table) => {
      table.increments('id').primary();
      table.string('model_name');
      table.integer('make_id').unsigned();
      table.foreign('make_id').references('makes.id');

      table.timestamps(true, true);
    })
  ]);
};

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.dropTable('models'),
    knex.schema.dropTable('makes')
  ]);
};
