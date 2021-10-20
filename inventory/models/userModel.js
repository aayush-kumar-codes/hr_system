function user(database, type) {
	const User = database.define(
		'detail',
		{
			id: {
				type: type.UUID,
				defaultValue: type.UUIDV4,
				primaryKey: true
			},
			first_name: type.STRING,
			username: type.STRING,
			last_name: type.STRING,
			email: {
				type: type.STRING,
				unique: true
			},
			password: type.STRING
		},
		{
			hooks: {
				beforeCreate: (user, options) => {
					return new Promise((resolve, reject) => {
						User.findOne({ where: { email: user.email } }).then((found) => {
							if (found) {
								reject(new Error('Email already exist'));
							} else {
								resolve();
							}
						});
					});

				}
			},
			timestamps: true,
			freezeTableName: true
		}
	);


	User.getMine = async (reqBody) => {
		try {
			let user = await User.findOne({ where: { email: reqBody.email } });
			return user;
		} catch (error) {
			throw new Error('Unable to find your profile');
		}
	};


	User.getAll = async (limit, offset) => {
		try {
			let users_all = await User.findAll({ limit, offset });
			return users_all;
		} catch (error) {
			throw new Error('Unable to locate all users');
		}
	};

    
	User.createUser = async (reqBody) => {
		try {
			let creation = await User.create({
				first_name: reqBody.first_name,
				last_name: reqBody.last_name,
				email: reqBody.email,
				password: reqBody.password,
				username: reqBody.username
			});
			return creation.id;
		} catch (error) {
			throw new Error(error);
		}
	};
	return User;
}

module.exports = user;
