function machineuser(database, type) {
	const machines_user = database.define(
		'machines_user',
		{
			id: {
				type: type.INTEGER,
				primaryKey: true
			},
			machine_id: type.INTEGER,
            user_Id: type.INTEGER,
            assign_date: type.DATE,
            updated_at: type.DATE,
			updated_by_userid: type.INTEGER,
		},
		{
			timestamps: true,
			freezeTableName: true
		}
	);
	machineuser.associate = (models) => {
        models.machineuser.hasOne(models.User, { foreignKey: 'updated_by_userid',as:"updated_by_user"});
	}
	return machines_user;
}

module.exports = machineuser;
