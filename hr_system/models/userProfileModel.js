function user_profile(database, type) {
  const user_profile = database.define("user_profile", {
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
    meta_data: type.STRING,
  });

  user_profile.createProfile = async (reqBody, user_id) => {
    try {
      let creation = await user_profile.create({
        name: reqBody.name,
        jobtitle: reqBody.jobtitle,
        dateofjoining: reqBody.dateofjoining,
        user_Id: user_id,
        dob: reqBody.dateofjoining,
        gender: reqBody.gender,
        marital_status: reqBody.marital_status,
        address1: reqBody.address1,
        address2: reqBody.address2,
        city: reqBody.city,
        state: reqBody.state,
        zip_postal: reqBody.zip_postal,
        country: reqBody.country,
        home_ph: reqBody.home_ph,
        mobile_ph: reqBody.mobile_ph,
        work_email: reqBody.workemail,
        other_email: reqBody.email,
        image: reqBody.image,
        bank_account_num: reqBody.bank_account_num,
        special_instructions: reqBody.special_instructions,
        pan_card_num: reqBody.pan_card_num,
        permanent_address: reqBody.permanent_address,
        current_address: reqBody.current_address,
        emergency_ph1: reqBody.emergency_ph1,
        emergency_ph2: reqBody.emergency_ph2,
        blood_group: reqBody.blood_group,
        medical_condition: reqBody.medical_condition,
        updated_on: reqBody.updated_on,
        slack_id: reqBody.slack_id,
        policy_document: reqBody.policy_document,
        team: reqBody.team,
        training_completion_date: reqBody.training_completion_date,
        termination_date: reqBody.termination_date,
        holding_comments: reqBody.holding_comments,
        training_month: reqBody.training_month,
        slack_msg: reqBody.slack_msg,
        signature: reqBody.signature,
        meta_data: reqBody.meta_data,
      });
      return creation.id;
    } catch (error) {
      throw new Error(error);
    }
  };

  user_profile.getUserProfile = async () => {
    try {
      let UserProfile = await user_profile.findAll({});
      return UserProfile;
    } catch (error) {
      throw new Error("Unable to find User profile");
    }
  };

  user_profile.getUserProfileDetailsById = async (reqBody) => {
    try {
      let userProfileById = await user_profile.findAll({
        where: { user_Id: reqBody.user_id },
      });
      return userProfileById;
    } catch (error) {
      throw new Error(error);
    }
  };

  user_profile.getUserPolicyDocument = async (req) => {
    try {
      const user_id = req.userData.user_id;
      let userPolicyDocument = await user_profile.findAll({
        where: { user_Id: user_id },
      });
      return userPolicyDocument;
    } catch (error) {
      throw new Error(error);
    }
  };

  user_profile.updateUserPolicyDocument = async (req) => {
    try {
      let userPolicyDocument = await user_profile.update(
        { policy_document: req.body.policy_document },
        { where: { user_Id: user_id },
        });
      return userPolicyDocument;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  user_profile.updateUserById = async (reqBody) => {
    try {
      let userToUpdate = await user_profile.update(
        {
          name: reqBody.name,
          jobtitle: reqBody.jobtitle,
          dateofjoining: reqBody.dateofjoining,
          dob: reqBody.dateofjoining,
          gender: reqBody.gender,
          marital_status: reqBody.marital_status,
          address1: reqBody.address1,
          address2: reqBody.address2,
          city: reqBody.city,
          state: reqBody.state,
          zip_postal: reqBody.zip_postal,
          country: reqBody.country,
          home_ph: reqBody.home_ph,
          mobile_ph: reqBody.mobile_ph,
          work_email: reqBody.workemail,
          other_email: reqBody.email,
          image: reqBody.image,
          bank_account_num: reqBody.bank_account_num,
          special_instructions: reqBody.special_instructions,
          pan_card_num: reqBody.pan_card_num,
          permanent_address: reqBody.permanent_address,
          current_address: reqBody.current_address,
          emergency_ph1: reqBody.emergency_ph1,
          emergency_ph2: reqBody.emergency_ph2,
          blood_group: reqBody.blood_group,
          medical_condition: reqBody.medical_condition,
          updated_on: reqBody.updated_on,
          slack_id: reqBody.slack_id,
          policy_document: reqBody.policy_document,
          team: reqBody.team,
          training_completion_date: reqBody.training_completion_date,
          termination_date: reqBody.termination_date,
          holding_comments: reqBody.holding_comments,
          training_month: reqBody.training_month,
          slack_msg: reqBody.slack_msg,
          signature: reqBody.signature,
          meta_data: reqBody.meta_data,
        },
        { where: { user_Id: reqBody.user_id } }
      );
      console.log(userToUpdate[0] !== 0);
      if (userToUpdate[0] !== 0) {
        return "updated";
      } else {
        return "not updated";
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  return user_profile;
}

module.exports = user_profile;
