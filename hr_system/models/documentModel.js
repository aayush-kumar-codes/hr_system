function Document(database, type) {
  const document = database.define(
    "documents",
    {
      title: type.STRING,
      filepath: type.STRING,
      uploaded_on: type.DATE,
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  document.getUserDocument = async () => {
    try {
      let UserDocument = await document.findAll({});
      return UserDocument;
    } catch (error) {
      throw new Error(error);
    }
  };

  document.uploadUserDocument = async (reqBody)=>{
    try {
      cloudinary.config({
        cloud_name: "imageupload6395",
        api_key: 878947817716679,
        api_secret: "8LA4bybX-ivPicOEubgzhYOasF8",
      });
      const user_id =reqBody.userData.user_id;
      const imageuploaded = await cloudinary.uploader.upload(
        reqBody.files.image.tempFilePath
      );
      console.log("imageuploaded")
      const data = {
        filepath: imageuploaded.secure_url,
        title: "abcd",
        uploaded_on:Date.now()
      };
      await document.create({data});
      return "uploaded"
    } catch (error) {
        throw new Error (error)
    }
  };


  return document;
}
module.exports = Document;
