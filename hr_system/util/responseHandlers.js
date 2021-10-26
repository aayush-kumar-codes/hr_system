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
		message: res.message,
		data:{ 
      inventory_id:res.inventory_id
	  },
	});
  };

  let responseForInventory = async (req, res) => {
    console.log(res.status_code)
    console.log(res.data)
    res.status(res.status_code).json({
      error: res.error,
      message: res.message,
      Data: {
       data: res.data,
      },
      // console.log(Data)
    });
  };

module.exports = { responseHandle ,responseForData,responseForInventory};
