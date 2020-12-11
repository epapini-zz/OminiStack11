const connection = require("../database/connection");

module.exports = {
  async index(request, response) {
    const { page = 1 } = request.query;

    //para saber o total de casos registrados
    const [count] = await connection("incidents").count();

    response.header("X-Total-Count", count["count(*)"]);

    //listando apenas 5 por page ?page=2,3,4,5
    const incidents = await connection("incidents")
      .join("ongs", "ongs.id", "=", "incidents.ong_id")
      .limit(5)
      .offset((page - 1) * 5)
      .select([
        "incidents.*",
        "ongs.name",
        "ongs.email",
        "ongs.whatsapp",
        "ongs.city",
        "ongs.uf",
      ]);

    return response.json(incidents);
  },

  async create(request, response) {
    const { title, description, value } = request.body;
    const ong_id = request.headers.authorization;

    const [id] = await connection("incidents").insert({
      title,
      description,
      value,
      ong_id,
    });

    return response.json({ id });
  },

  async delete(request, response) {
    const { id } = request.params;
    const ong_id = request.headers.authorization;

    const incident = await connection("incidents")
      .where("id", id) //busca o id que esta igual ao parametro
      .select("ong_id") //seleciona a ong que tem esse ID
      .first(); // retorna o primeiro encontrado (1 resultado)

    //valida o retordo para exclusao
    if (incident.ong_id !== ong_id) {
      return response.status(401).json({ error: "Operação não permitida" });
    }

    await connection("incidents").where("id", id).delete();

    return response.status(204).send();
  },
};
