export default function (trip = null, action) {
  if(action.type === 'createTrip') {
    return {
      type: 'new',
      data: {
        title: 'My New Trip',
    budget: action.newTrip.total,
    date: action.newTrip.date,
    latitude: action.newTrip.latitude,
    longitude: action.newTrip.longitude,
    activities: action.newTrip.activities
      }
    };
  }
  else if (action.type === 'editTrip') {
    return {
      type: 'edit',
      data: action.trip
    };
  } 
  else if (action.type === 'deleteTrip') {
    return null;
  } 
  else {
    return trip
  }
}