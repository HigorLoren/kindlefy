const handleError = (res, error) => {
  console.error(error);

  if (error.response) { //out of the range of 2xx
    if (error.response.status == 422) {
      res.status(422).json({
        status: 'fail',
        message: 'Invalid parameters. Check for errors in the request.',
        detail: error.response.data
      });
    } else {
      res.status(400).json({
        status: 'fail',
        message: 'Something went wrong with the API.',
        detail: error.response.data
      });
    }
  } else if (error.request) {
    res.status(504).json({
        status: 'error',
        message: 'No response was received from the other API.',
        detail: error.response.data
      });
  } else {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Error. A error happened in setting up the request.',
      detail: error.response
    });
  }

  return res;
}

module.exports = handleError;
