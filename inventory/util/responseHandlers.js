let responseHandle = async (req,res) => {
	res.status(res.status_code).json({message:res.message,token:res.token,data:res.data})
	
};

module.exports = { responseHandle };
