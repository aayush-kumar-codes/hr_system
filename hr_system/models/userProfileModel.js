function user_profile(database, type) {
	const user_profile = database.define(
		'user_profile',
		{
			name: type.STRING,
            jobtitle: type.STRING,
            dateofjoining: type.DATE,
            user_Id: type.INTEGER,
            dob: type.DATE,
            gender: type.STRING,
            marital_status: type.STRING,
            address1: type.STRING,
            address2: type.STRING,
            city: type.STRING,
            state: type.STRING,
            zip_postal: type.INTEGER,
            country: type.STRING,
            home_ph: type.STRING,
            mobile_ph: type.STRING,
            work_email: type.STRING,
            other_email: type.STRING,
            image: type.STRING,
            bank_account_num: type.INTEGER,
            special_instructions: type.STRING,
            pan_card_num: type.STRING,
            permanent_address: type.STRING,
            current_address: type.STRING,
            emergency_ph1: type.STRING,
            emergency_ph2: type.STRING,
            blood_group: type.STRING,
            medical_condition: type.STRING,
            updated_on: type.STRING,
            slack_id: type.STRING,
            policy_document: type.STRING,
            team: type.STRING,
            training_completion_date: type.DATE,
            termination_date: type.DATE,
            holding_comments: type.STRING,
            training_month: type.INTEGER,
            slack_msg: type.INTEGER,
            signature: type.STRING,
            meta_data: type.STRING
		}
	);

    user_profile.createProfile = async (reqBody,user_id) => {
        try {
          let creation = await user_profile.create({
            name: reqBody.name,
            jobtitle: reqBody.jobtitle,
            dateofjoining: reqBody.dateofjoining,
            user_Id: user_id,
            dob: reqBody.dateofjoining,
            gender: reqBody.gender,
            marital_status:reqBody.marital_status,
          });
          return creation.id;
        } catch (error) {
          throw new Error(error); 
        }
      };

    return user_profile;
}



module.exports = user_profile;
