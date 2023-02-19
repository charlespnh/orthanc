
const express = require('express')
const axios = require('axios')
const db = require('../services/queries')
const { solveTSPRequest, solveConstraintRequest, validate } = require('../utils/validation')
const config = require('../utils/config')
const httpStatus = require('http-status')

let router = express.Router()

function tspHandler(request, response, next) {
  // Delegate workload to /solve/tsp route
  console.log(request.body)
  return axios({
    method: 'get',
    url: `http://localhost:${config.PRIVATE_PORT}/tsp/solve`,
    headers: {
      'Content-Type': 'application/json'
    },
    data: request.body
  })
  .then(res => res.data)
  .then(computedRoute => {
    response.status(httpStatus.OK).json(computedRoute)
  })
  .catch(err => {
    response.status(err.code).send(err.message)
  })
}

function constraintHandler(request, response, next) {
  // Delegate workload to /solve/constraint route
  console.log(request.body)
  return axios({
    method: 'get',
    url: `http://localhost:${config.PRIVATE_PORT}/constraint/solve`,
    headers: {
      'Content-Type': 'application/json'
    },
    data: request.body
  })
  .then(res => {
    computedRoute = res.data
    response.status(httpStatus.OK).json(computedRoute)
  })
  .catch(err => {
    response.status(err.code).send(err.message)
  })

}

// Serve front page
router
  .route('/')
  .get(
    (req, res) => {
      db.init()
      res.send('Hello World!')
    })

// Serve the TSP tour from the database or recompute
router
  .route('/tsp')
  .get(
    validate(solveTSPRequest.body),
    db.getTSPRoute,
    tspHandler
  )

// Serve k characteristic locations nearest to the tour and recompute
router
  .route('/constraint')
  .get(
    validate(solveConstraintRequest.body),
    db.getNearestLocations,
    constraintHandler
  )

// Add location to database
router
  .route('/db')
  .post(
    (req, res) => {

    })

// Update location in database
router
  .route('/db')
  .put(
    (req, res) => {

    })


module.exports = router
