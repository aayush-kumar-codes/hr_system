function roles(database, type) {
	const roles = database.define(
		'roles',
		{
			name: type.STRING,
            description: type.STRING,
            last_update:type.DATE
		}
	);

    roles.AddUserRole = async (reqBody) => {
        try {
          let creation = await roles.create({
            name: reqBody.name,
            description: reqBody.description
          });
          return creation.id;
        } catch (error) {
          throw new Error(error); 
        }
      };


      roles.getUserRoles = async (limit, offset) => {
        try {
          let all_machine = await roles.findAll({ limit, offset });
          return all_machine;
        } catch (error) {
          throw new Error("Unable to locate all users");
        }
      };

    return roles;
}



module.exports = roles;
