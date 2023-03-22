
# Orthanc

https://devpost.com/software/orthanc - TransportHacks 2023

**Orthanc** is one of the *palantíri* stones in The Lord of The Rings, leveraged by its keeper to see other parts of the word and thus gain valuable intelligence. The project, named after the stone, is developed to share similar purpose of providing intelligence on routing and navigation. The project also serves as a sequel to https://github.com/charlespnh/Recreational-Algorithmic-Project-II, but with completely different architecture design as well as new programming languages, frameworks and database.

## Queries
$1.$ Given a list of $n$ 2D-coordinated points $p_1, p_2, \ldots, p_n$ with weight function $dist(p_i, p_j)$ satisfying Euclidean metric, find the optimal cycle through all $n$ points such that its total length is $min \sum_{i=1}^{n} \sum_{j \neq i,j=1}^{n} dist(p_i, p_j)$

$2.$ Given a point $p$, find all *neighbour* $q$ such that $dist(p,q) \leq K$ for some const. $K$

First query asks for the Euclidean Traveling Salesman tour that minimizes the total cost. The second query is simply a Nearest Neighbour problem, asking to find nearest points within some radius $k$. Both problems are solvable, although how to answer those queries efficiently in the real world can start to get a lot more interesting

## Query the World
<p align=center>
<img src="https://d1a3f4spazzrp4.cloudfront.net/kepler.gl/documentation/layers-h3.png" width=300 height=300>
</p>

Query $2$ looks easy enough: Given the fixed point $p$ of interest with longitude and latitude, then simply do a linear scan of all $n$ points that satisfy the distance condition. A geospatial database query would look like so:

```sql
SELECT *
FROM geo_table AS gt
WHERE ST_DISTANCE(p, ST_POINT(gt.lon, gt.lat)) < K
```

In the context of database, this gets quite expensive as you have to go though potentially millions of all entries in the table, whereas the idea of having database in the first place is having these entries indexed to avoid scanning and thus fast look-up. 

But with **H3** geospatial index system, by 'hexagonifying' Earth's surface and thus bucketing points into hexagons, the query above can be improved much more. Assuming the database schema is changed to introduce an <code>h3</code> column as additional index column, we can now refine the SQL query like so:
```sql
SELECT *
FROM geo_table AS gt
WHERE gt.h3 = hex 
    AND ST_DISTANCE(p, ST_POINT(gt.lon, gt.lat)) < 10
```

Note: A lot have been simplified... The devil is in the details, and <code>services/queries.js</code> and https://www.uber.com/en-CA/blog/h3/ has them details


## Query the Stars
<p align=center>
<img src="https://storage.googleapis.com/gweb-cloudblog-publish/images/celestial_coordinate_system.max-600x600.png" width=300 height=300>
</p>


## TSP
