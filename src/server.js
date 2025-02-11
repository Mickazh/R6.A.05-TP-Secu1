import Fastify from "fastify";
import fastifyBasicAuth from "@fastify/basic-auth";
import { readFileSync } from "fs";

const port = 3000;
const authenticate = { realm: "Westeros" };

const fastify = Fastify({
  http2: true,
  https: {
    key: readFileSync("./server.key"),
    cert: readFileSync("./server.crt"),
  },
  logger: true,
});

fastify.register(fastifyBasicAuth, {
  validate,
  authenticate,
});

async function validate(username, password, req, reply) {
  if (username !== "Tyrion" || password !== "wine") {
    return new Error("Winter is coming");
  }
}

fastify.get("/dmz", {}, (req, res) => {
  res.send({ replique: "Ca pourrait être mieux protégé..." });
});

// after sert à garantir que ce qui est définies dans le callback sera enregistre apres les plugins (validate, authenticate)
fastify.after(() => {
  fastify.route({
    method: "GET",
    url: "/secu",
    onRequest: fastify.basicAuth,
    handler: async (req, reply) => {
      return {
        replique: "Un Lannister paye toujours ses dettes !",
      };
    },
  });
  fastify.route({
    method: "GET",
    url: "/autre",
    // onRequest: fastify.basicAuth,
    handler: async (req, reply) => {
      return {
        replique: "Un Lannister paye toujours ses dettes !",
      };
    },
  });
});

fastify.setErrorHandler(function (err, req, reply) {
  if (err.statusCode === 401) {
    console.log(err);
    reply.code(401).send({ replique: "Tu ne sais rien, John Snow.." });
  }
  reply.send(err);
});

fastify.listen({ port }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  fastify.log.info(`Fastify is listening on port: ${address}`);
});
