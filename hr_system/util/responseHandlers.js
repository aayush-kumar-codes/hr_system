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
    res.status(res.status_code).json({
      error: res.error,
      message: res.message,
       data: res.data,
    });
  };


  let responseForEmployee = async (req, res) => {
    res.status(res.status_code).json({
      error: res.error,
      message: res.message,
      Data: {
       data: res.data,
      },
    });
  };
let responseForAddMachine=async(req,res)=>{
  res.status(res.status_code).json({
    error:res.error,
    Data:{
    message:res.message,
    }
  })
}
let addNewEmployeeResponseHandle = async (req, res) => {
  res.status(res.status_code).json(res.data);
};
module.exports = { responseHandle ,responseForData,responseForInventory,responseForEmployee,addNewEmployeeResponseHandle,responseForAddMachine};