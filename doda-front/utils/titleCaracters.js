let titleCaracters = (title) => {
    if (title.length > 20) {
      return title.slice(0,20) + '...'
    }
    else {
      return title
    }
  }

  export default titleCaracters