# Northcoders News API
<p align="center"><img src="https://img.shields.io/badge/NorthCoders-EB1C24?style=for-the-badge&logo=javascript&logoColor=white" alt="nothcoders"><img src="https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node"><img src="https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white" alt="express"><img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="postgres"><img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="jest"></p>

## Live Demo
A demo version of the API is hosted at https://htpncnews.onrender.com/api.
> [!WARNING]
> The first request you make to the API may take up to a minute to resolve as the demo server spins up. The server will spin down if there haven't been any requests to the API in the last 15 minutes. After the server starts, there shouldn't be any more delays.
 
## About the Project
NC News is a RESTful API for a news website backend, able to fetch topics, articles, and their relevant comments. Written in Node.js utilising Express.js and Node-Postgres, it utilises TDD & MVC in the functional programming paradigm to create various endpoints for GET, POST, DELETE, and PATCH requests to perform CRUD operations on a database.

## Setup

### Prerequisites:
Ensure you have Postgres 16.6+ and Node.js v23.3.0+ installed on your machine. Instructions for installing PSQL on your machine [here](https://www.postgresql.org/download/), and for Node.js can be found [here](https://nodejs.org/en/download).
### Instructions:
1. Clone the repository to your local machine using `git pull https://github.com/captainharrie/NC-news.git`
2. Create your .env files.
> [!IMPORTANT]
> - You will need to set up two files in the root directory, `.env.development` and `.env.test`, pointing the `PGDATABASE` variable to your development and test databases respectively. View the `.env-example` file for an example of what these files should look like, and the `./db/setup.sql` file for the expected database names.
> - If you have a production database set up, you can also create a `.env.production` file, pointing the `DATABASE_URL` variable to your remote database.
> - Ensure that these new files are all ignored in `.gitignore`!
3. Open the repository directory in your terminal and enter the following command: `npm install`. This will install all the project dependencies.
4. Once complete, run the following commands in order: `npm run setup-dbs`, `npm run seed`, `npm run test`. If everything has been set up correctly, you should see all the tests run and pass successfully.

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
