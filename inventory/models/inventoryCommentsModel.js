function inventorycomments(database, type) {
  const inventory_comments = database.define(
    "inventory_comments",
    {
      inventory_id: type.INTEGER,
      updated_by_user_id: type.INTEGER,
      assign_unassign_user_id: type.INTEGER,
      comment: type.STRING,
      updated_at: type.DATE,
      comment_type: type.STRING,
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  inventorycomments.associate = (models) => {
    models.inventorycomments.hasOne(models.MachineList, {
      foreignKey: "inventory_id",
      as: "inventory",
    });
    models.inventorycomments.hasOne(models.User, {
      foreignKey: "updated_by_user_id",
      as: "updated_by_user",
    });
    models.inventorycomments.hasOne(models.User, {
      foreignKey: "assign_unassign_user_id",
      as: "assign_unassign_user",
    });
  };
  inventory_comments.createAudit = async (reqBody) => {
    try {
      let creation = await inventory_comments.create({
        inventory_id: reqBody.inventory_id,
        comment: reqBody.comment,
        comment_type: reqBody.comment_type,
      });
      return creation.id;
    } catch (error) {
      throw new Error(error);
    }
  };
  return inventory_comments;
}

module.exports = inventorycomments;
