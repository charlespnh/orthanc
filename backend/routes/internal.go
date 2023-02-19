
package main

import (
	"github.com/gin-gonic/gin"
	"orthanc-go/services"
)

func main() {
	// Creates a gin router with default middleware:
	// logger and recovery (crash-free) middleware
	router := gin.Default()

	router.GET("/tsp/solve", services.SolveTSP)
	router.GET("/constraint/solve", services.SolveConstraint)

	// By default it serves on :8080 unless a
	// PORT environment variable was defined.
	// router.Run(":3000") for a hard coded port
	router.Run()
}