import Fastify from 'fastify';
import { AppDataSource } from './data-source';
import { User } from './entity/User'; // Tu entidad de usuario
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fastifyWebsocket } from '@fastify/websocket';

const fastify = Fastify({ logger: true });

// Conexión a la base de datos
AppDataSource.initialize()
  .then(async () => {
    console.log('Conexión a la base de datos establecida');

    fastify.register(fastifyWebsocket);

    fastify.get('/', async (request, reply) => {
      return '¡Hola, mundo desde Fastify!';
    });

    fastify.ready(() => {
      const httpServer = fastify.server;
      const io = new Server(httpServer);

      io.on('connection', (socket) => {
        console.log('Un usuario se ha conectado');

        // Manejador de eventos de Socket.IO
        socket.on('message', (data) => {
          console.log(data);
          // Emitir la notificación a otros usuarios
          io.emit('notification', data);
        });
      });

      fastify.listen({ port: 3000 }, (err, address) => {
        if (err) {
          fastify.log.error(err);
          process.exit(1);
        }
        fastify.log.info(`Servidor escuchando en ${address}`);
      });
    });
  })
  .catch(error => console.log(error));