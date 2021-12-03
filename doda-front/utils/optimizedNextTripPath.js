import Graph from '../utils/graph';
import findShortestPath from '../utils/findShortestPath';
import getDistanceFromCurrentPositionInKm from '../utils/getDistanceFromCurrentPositionInKm';

function optimizedNextTripPath(nextTrip) {
  if (!nextTrip || !nextTrip?.activities) return [];

  const array = [{ id: 'tripPosition', latitude: nextTrip.latitude, longitude: nextTrip.longitude }]
  nextTrip.activities.forEach(item => array.push({ id: item._id, latitude: item.latitude, longitude: item.longitude }))
  console.log('array', array)
  var graph = new Graph(array.length);
  array.forEach((item, index) => {
    const others = array.filter(e => e !== item)
    others.forEach((ele) => {
      const eleIndex = array.indexOf(ele)
      const distance = getDistanceFromCurrentPositionInKm(item.latitude, item.longitude, ele.latitude, ele.longitude);
      graph.addEdge(index, eleIndex, distance)
    })
  })
  const sortPath = findShortestPath(graph, array);
  const newActivities = [...nextTrip.activities]
  newActivities.sort((a, b) => sortPath.indexOf(a.id) - sortPath.indexOf(b.id))
  const directionsArr = [{ latitude: nextTrip.latitude, longitude: nextTrip.longitude }]
  newActivities.forEach(item => directionsArr.push({ latitude: item.latitude, longitude: item.longitude }))
  directionsArr.push({ latitude: nextTrip.latitude, longitude: nextTrip.longitude })
  return directionsArr
}

export default optimizedNextTripPath