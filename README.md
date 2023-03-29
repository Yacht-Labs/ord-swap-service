# Prisma PostgreSQL with Docker

This project uses Prisma with a PostgreSQL database running in a Docker container for local development. It is a Node.js TypeScript server with Express.

## Getting Started

### Prerequisites

Before setting up the project, make sure you have the following software installed on your computer:

- [Docker](https://www.docker.com/) - for running a PostgreSQL container
- [Node.js](https://nodejs.org/) - to run the server
- [Yarn](https://yarnpkg.com/) - for managing project dependencies

### Setup

1. **Clone the repository** and navigate to the project directory.

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

Replace your-username and your-repo with the actual GitHub username and repository name.

Install the project dependencies.

```bash
yarn install
```

3. Start the PostgreSQL Docker container.

```bash
docker-compose up -d
```

This command will read the docker-compose.yml file and create a Docker container running PostgreSQL. The container will be named ord-swap-db, and the database will have the following settings:

Database name: ord_swap
Username: ord_swap_user
Password: ord_swap_password
The PostgreSQL container will be accessible on port 5432. A named volume called ord-swap-data is created for data persistence.

4. Apply the Prisma schema to your PostgreSQL database and generate the Prisma Client.

```bash
npx prisma migrate dev --name init
```

This command will create a migration to apply the Prisma schema (defined in prisma/schema.prisma) to your PostgreSQL database. It will also generate the Prisma Client, which you can use in your Node.js TypeScript server to interact with the database.

5. Start the development server.

```bash
yarn start
```

This command will start the Node.js TypeScript server using ts-node. By default, the server listens on port 3000.

You can now access the server at http://localhost:3000/ and test the available API routes.

## Development Workflow

The project is set up with the following scripts for a smooth development experience:

Format your code: yarn format
Check your code with ESLint: yarn lint
Automatically fix issues with ESLint: yarn lint:fix
Run tests: yarn test
These scripts help enforce code standards and run tests for the project.

## Testing

To run our tests, you will need to have bitcoin core installed as well as the ord wallet implementation.

For instructions on installing bitcoin core as well as the `bitcoind` and `bitcoin-cli` commands, see here: https://github.com/bitcoin/bitcoin/tree/master/doc#building

For instructions on installing the ord wallet, please consult the ord documentation: https://github.com/casey/ord#installation

Make sure that bitcoind, bitcoin-cli and ord are in your PATH

## Troubleshooting

If you encounter any issues, try running the following command to recreate the PostgreSQL Docker container:

```bash
docker-compose down && docker-compose up -d
```

This command will stop and remove the Docker container and then create a new one.

If you still experience issues, you can delete the named volume to remove all data from the PostgreSQL container:

```bash
docker-compose down
docker volume rm your-repo_ord-swap-data
docker-compose up -d
```

**Caution: This will delete all data from the container.**

## Documentation

Once you are running the server, navigate to http://localhost:3000/docs/
