function inventoryauditmonthwise(database, type) {
  const inventory_audit_month_wise = database.define(
    "inventory_audit_month_wise",
    {
      inventory_id: type.INTEGER,
      month: type.INTEGER,
      year: type.INTEGER,
      audit_done_by_user_id: type.INTEGER,
      inventory_comment_id: type.INTEGER,
      updated_at: type.DATE,
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  inventoryauditmonthwise.associate = (models) => {
    models.inventoryauditmonthwise.hasOne(models.MachineList, {
      foreignKey: "inventory_id",
      as: "inventory",
    });
    models.inventoryauditmonthwise.hasOne(models.User, {
      foreignKey: "audit_done_by_user_id",
      as: "audit_done_by_user",
    });
    models.inventoryauditmonthwise.hasOne(models.InventoryCommentsModel, {
      foreignKey: "inventory_comment_id",
      as: "inventory_comment",
    });
  };
  // inventory_audit_month_wise.getStatus = async (reqBody) => {
  //   try {
  //     let auditMonthwiseStatus = await inventory_audit_month_wise.findAll({
  //       where: { month: reqBody.month, year: reqBody.year },
  //     });
  //   return auditMonthwiseStatus;
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // };

  return inventory_audit_month_wise;
}

module.exports = inventoryauditmonthwise;
