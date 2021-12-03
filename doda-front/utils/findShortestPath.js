const findShortestPath = (graph, array) => {
  var result = [array[0].id];
  var resultIndex = [0];
  for (let i = 0; i < graph.matrix.length; i++) {
    const copyMatrix = [...graph.matrix[i]];
    var shortest = Math.max(...copyMatrix),
      shortIndex = copyMatrix.indexOf(shortest);
    copyMatrix.forEach((ele, index) => {
      if (index !== i && !resultIndex.includes(index) && ele < shortest) {
        shortest = ele
        shortIndex = index
        result.push(array[shortIndex].id)
        resultIndex.push(shortIndex)
      }
    })
  }
  return result
}
export default findShortestPath