
package services

import (
	"fmt"
	"net/http"
	"io/ioutil"
	// "strings"
	// "math"
	"context"
	"github.com/gin-gonic/gin"
	"github.com/buger/jsonparser"
	"googlemaps.github.io/maps"
	// "orthanc-go/utils"
)

func toStringArray(data []byte) (tour []string) {
	jsonparser.ArrayEach(data, func(value []byte, dataType jsonparser.ValueType, offset int, err error) {
		tour = append(tour, string(value))
	})

	return
}

func aggregateDist(arr []*maps.Leg) int {
	dist := 0 // meters
	for _, distance := range arr {
		dist += distance.Meters
	} 
	return dist
}

func aggregateDur(arr []*maps.Leg) int64 {
	var dur int64 = 0 // seconds
	for _, duration := range arr {
		dur += int64(duration.Duration)
	}
	return dur
}


func SolveTSP(c *gin.Context) {
	// Parse for request body content
	rawData, reqErr := ioutil.ReadAll(c.Request.Body)
	if (reqErr != nil) {
		c.JSON(http.StatusBadRequest, gin.H{"error": reqErr.Error()})
		return
	}

	mode, err1 := jsonparser.GetString(rawData, "mode")
	if err1 != nil { mode = "driving" }
	metric, err2 := jsonparser.GetString(rawData, "metric")
	if err2 != nil { metric = "time" }
	real_time, err3 := jsonparser.GetBoolean(rawData, "real_time")
	if err3 != nil { real_time = false }
	locations_bytes, data_type, _, err4 := jsonparser.Get(rawData, "locations")
	if (err4 != nil) { 
		c.JSON(http.StatusInternalServerError, gin.H{"error": err4.Error()})
		return
	} else if (data_type != jsonparser.Array) {
		c.JSON(http.StatusInternalServerError, 
			gin.H{"error": "List of locations is parsed as " + data_type.String() + "instead of Array"})
		return
	}
	// var json requestTSP
	// if reqErr := c.BindJSON(&json); reqErr != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": reqErr.Error()})
	// 	return
	// }

	locations := toStringArray(locations_bytes)
	var N int = len(locations)
	fmt.Println("LOGGING\t\t", locations, mode, metric, real_time)

	gmap, err := maps.NewClient(maps.WithAPIKey(""))
	if err != nil {
		fmt.Printf("gmap api error: %s\n", err)
	}
	r := &maps.DirectionsRequest{
		Origin:      string(locations[0]),
		Destination: string(locations[0]),
		Mode: 		 maps.Mode(mode),
		Waypoints:	 locations[1 : N],
		Optimize:	 true,
		Units:		 "metric",
	}
	route, _, err := gmap.Directions(context.Background(), r)
	if err != nil {
		fmt.Printf("map api error: %s\n", err)
	}
	
	tour := []string{locations[0]}
	for _, index := range route[0].WaypointOrder {
		tour = append(tour, locations[index + 1])
	}
	tour = append(tour, locations[0])

	c.JSON(http.StatusOK, gin.H{
		"tour": tour,
		"distance:": aggregateDist(route[0].Legs),
		"duration:": aggregateDur(route[0].Legs),
	})
}

func SolveConstraint(c *gin.Context) {
	c.String(http.StatusOK, "Feature is on the road map")
}
