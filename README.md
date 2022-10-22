To run MongoDB locally we use a docker image with replica sets. To start, run

```
docker run -d -p 27017:27017 -p 27018:27018 -p 27019:27019 candis/mongo-replica-set
```
