function BankDetail(database, type) {
  const bankDetails = database.define("user_bank_details", {
    user_Id: type.INTEGER,
    bank_name: type.STRING,
    bank_address: type.STRING,
    bank_account_no: type.STRING,
    ifsc: type.STRING,
  });
  bankDetails.updateBankDetails = async (reqBody) => {
    try {
      let updated_data = await bankDetails.update(
        {
          bank_name: reqBody.bank_name,
          bank_address: reqBody.bank_address,
          bank_account_no: reqBody.bank_account_no,
          ifsc: reqBody.ifsc,
        },
        { where: { user_Id: reqBody.user_Id } }
      );
      if (updated_data[0] !== 0) {
        return "updated";
      } else {
        return "not updated";
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  return bankDetails;
}

module.exports = BankDetail;
