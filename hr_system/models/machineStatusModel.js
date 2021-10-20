function machine_status(database, type) {
	const MachineStatus = database.define(
		'machine_status',
		{
			status: type.STRING,
			color: type.STRING,
			is_default: type.INTEGER,
		},
	);


    MachineStatus.AddMachineStatus = async (reqBody) => {
        try {
          let creation = await MachineStatus.create({
            status: reqBody.status,
            color: reqBody.color,
            is_default: reqBody.is_default,
          });
          return creation.id;
        } catch (error) {
          throw new Error(error); 
        }
      };


    MachineStatus.getAllStatus = async (limit, offset) => {
		try {
			let all_status = await MachineStatus.findAll({ limit, offset });
			return all_status;
		} catch (error) {
			throw new Error('Unable to locate all status');
		}
	};


    MachineStatus.DeleteStatus = async (reqBody) => {
		try {
			let delete_status = await MachineStatus.destroy({
                where : {
                  id : reqBody.id
                }});
			return delete_status;
		} catch (error) {
			throw new Error('Unable to locate status');
		}
	};

	return MachineStatus;
}

module.exports = machine_status;
