const knex = require("knex");
const configuration = require("../../knexfile");

//criando a conexao
const connection = knex(configuration.development);

module.exports = connection;