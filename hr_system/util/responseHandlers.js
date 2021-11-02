let responseHandle = async (req, res) => {
  res.status(res.status_code).json({
    error: res.error,
    data: {
      message: res.message,
      token: res.token,
      userid: res.data,
    },
  });
};

let responseForData = async (req, res) => {
  res.status(res.status_code).json({
    error: res.error,
    data: {
      message: res.message,
      token: res.token,
      data: res.data,
    },
  });
};

let addNewEmployeeResponseHandle = async (req, res) => {
  res.status(res.status_code).json({
    error: res.error,
    message: res.message,
  });
};

module.exports = {
  responseHandle,
  responseForData,
  addNewEmployeeResponseHandle,
};
