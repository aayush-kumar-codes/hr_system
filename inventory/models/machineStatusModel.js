function machine_status(database, type) {
	const MachineStatus = database.define(
		'machine_status',
		{
			status: type.STRING,
			color: type.STRING,
			is_default: type.INTEGER,
		},
	);

	return MachineStatus;
}

module.exports = machine_status;
