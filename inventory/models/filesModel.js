function files(database, type) {
	const files = database.define(
		'files',
		{
			id: {
				type: type.INTEGER,
				primaryKey: true
			},
			updated_by_user_id: type.INTEGER,
            file_name: type.STRING,
            google_drive_path:type.STRING,
            updated_at:type.DATE,
		},
		{
			timestamps: true,
			freezeTableName: true
		}
	);
	files.associate = (models) => {
		models.FilesModel.hasOne(models.User, { foreignKey: 'updated_by_user_id',as:"updated_by_user"});
	}
	return files;
}

module.exports = files;
