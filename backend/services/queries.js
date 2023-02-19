
const Pool = require('pg').Pool
const h3 = require("h3-js");
const httpStatus = require('http-status');
const config = require("../utils/config");
const { locationSchema } = require('../utils/validation');

const H3_RESOLUTION = 6

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'orthancdb',
  password: 'postgres',
  port: config.DB_PORT,
})

// Get TSP tour from PostgreSQL database, if tour is cached - TODO
const getTSPRoute = (request, response, next) => {
  next() // TO BE DELETED
  return // TO BE DELETED
  const locations = request.locations
  const query = `
    SELECT address
    FROM demo
  `
  pool
    .query(query)
    .then(storedRoute => {
      if (storedRoute.length === locationSchema.length)
        response.status(httpStatus.OK).json(storedRoute)
      else {
        console.log("Route Not Found in Database... Process to Hard Calculation")
        next()
      }
    })
    .catch(err => {
      response.status(err.code).send(err.message)
    })
}

// Get k nearest characteristic places to a given list of locations from PostgreSQL database
const getNearestLocations = async (request, response, next) => {
  const buckets = []
  const locations = request.body.locations;
  console.log(locations)
  
  const query = 
  `WITH locations AS (SELECT * FROM demo WHERE address = ANY($1::text[]))
   SELECT t.address, t.h3
   FROM locations
   LEFT JOIN demo AS t 
    ON locations.h3 = t.h3
   WHERE TRIM(t.type) = 'characteristic'` 
  pool
    .query(query, [locations])
    .then(res => {
      // console.log(res.rows);
      nearestLocations = []
      res.rows.forEach(record => {
        if (!nearestLocations.includes(record.address))
          nearestLocations.push(record.address)
      })
      request.body.nearestLocations = nearestLocations
      response.status(httpStatus.OK).json({"locations": nearestLocations})
      // next() TODO - uncomment
    })
    .catch(err => {
      response.status(500).send(err.message)
    })
}

// Add location to PostgreSQL database
const hexagonalize = (lat, lng) => {
  return h3.latLngToCell(lat, lng, H3_RESOLUTION);
} 

const createLocation = (request, response) => {
  const addr = request.body.address;
  const lat = request.body.latitude;
  const lng = request.body.longitude;
  const type = request.body.type;
  const h = hexagonalize(lat, lng);

  const query = `
    INSERT INTO demo (address, longitude, latitude, type, tsp, h3)
    VALUES ($1, $2, $3, $4, NUll, $5);`
  pool
    .query(query, [addr, lat, lng, type, h3])
    .then(res => {
      console.log('Table is successfully inserted');
      response.status(httpStatus.OK).json(res)
    })
    .catch(err => {
      response.status(err.code).send(err.message)
    })
}

// Update location in PostgreSQL database
const updateLocation = (request, response) => {

}

const init = () => {
  const query = 
  ` DROP TABLE IF EXISTS demo;
    CREATE TABLE demo (
      address text,
      longitude double precision,
      latitude double precision,
      type text,
      tsp text,
      h3 text
    );
    COPY demo FROM '/home/charles/project/dev/transport-hack/backend/demo.csv' 
    WITH (FORMAT csv, DELIMITER ',');
    CREATE INDEX hex_idx ON demo (h3); `
  pool
    .query(query)
    .then(res => {
        console.log('Table is successfully loaded ' + JSON.stringify(res));
    })
    .catch(err => {
        console.error(err.stack);
    })
}


module.exports = {
    getTSPRoute,
    getNearestLocations,
    createLocation,
    updateLocation,
    init,
  }
