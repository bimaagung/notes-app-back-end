require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');
const Inert = require('@hapi/inert');

// notes
const notes = require('./api/notes');
// const NotesSevice = require('./services/inMemory/NoteService');
const NotesSevice = require('./services/postgres/NoteService');
const NotesValidator = require('./validator/notes');

// users
const users = require('./api/users');
const UsersSevice = require('./services/postgres/UserService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// uploads
const uploads = require('./api/uploads');
// local
const StorageService = require('./services/storage/StorageService');
// aws S3
// const StorageService = require('./services/S3/StorageService');
const UploadsValidator = require('./validator/uploads');

// cache
const CacheService = require('./services/redis/CacheService');

const init = async () => {
  const cacheService = new CacheService();
  const usersService = new UsersSevice();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService(cacheService);
  const notesService = new NotesSevice(collaborationsService, cacheService);
  // local
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));
  // aws S3
  // const storageService = new StorageService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // mendefinisikan strategy authentifikasi jwt
  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register(
    [
      {
        plugin: notes,
        options: {
          service: notesService,
          validator: NotesValidator,
        },
      },
      {
        plugin: users,
        options:
        {
          service: usersService,
          validator: UsersValidator,
        },
      },
      {
        plugin: authentications,
        options:
        {
          authenticationsService,
          usersService,
          tokenManager: TokenManager,
          validator: AuthenticationsValidator,
        },
      },
      {
        plugin: collaborations,
        options:
        {
          collaborationsService,
          notesService,
          validator: CollaborationsValidator,
        },
      },
      {
        plugin: _exports,
        options:
        {
          service: ProducerService,
          validator: ExportsValidator,
        },
      },
      {
        plugin: uploads,
        options:
        {
          service: storageService,
          validator: UploadsValidator,
        },
      },
    ],
  );

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
