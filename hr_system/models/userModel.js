function user(database, type) {
	const User = database.define(
		'detail',
		{
			username: {
				type: type.STRING,
				unique: true
			},
			type: type.STRING,
			password: type.STRING,
			status: type.STRING,
		},
		{
			hooks: {
				beforeCreate: (user, options) => {
					return new Promise((resolve, reject) => {
						User.findOne({ where: { username: user.username } }).then((found) => {
							if (found) {
								reject(new Error('username already exist'));
							} else {
								resolve();
							}
						});
					});

				}
			},
		}
	);


	User.getMine = async (reqBody) => {
		try {
			let user = await User.findOne({ where: { username: reqBody.username } });
			if(user){
				return user.id;
			}else{
				return "login unsuccessful";
			}
			
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
				status: reqBody.status,
				type: reqBody.type,
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
