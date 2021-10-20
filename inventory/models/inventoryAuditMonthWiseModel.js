async function inventoryauditmonthwise(database, type) {
  const inventory_audit_month_wise = database.define(
    "inventory_audit_month_wise",
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
      },
      inventory_id: type.INTEGER,
      month: type.INTEGER,
      year: type.INTEGER,
      audit_done_by_user_id: type.INTEGER,
      inventory_comment_id: type.INTEGER,
      updated_at: type.DATE,
    },
    {
      timestamps: true,
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

//   inventory_audit_month_wise.createAudit = async (reqBody) => {
//     try {
//       let creation = await inventory_audit_month_wise.create({
//         inventory_id: reqBody.inventory_id,
//         month: reqBody.month,
//         year: reqBody.year,
//         audit_done_by_user_id: reqBody.audit_done_by_user_id,
//         inventory_comment_id: reqBody.inventory_comment_id,
//         updated_at: reqBody.updated_at,
//       });
//       return creation.id;
//     } catch (error) {
//     //   console.log(error);
//       throw new Error(error);
//     }
//   };
//   console.log(inventory_audit_month_wise);
  return inventory_audit_month_wise;
}

module.exports = inventoryauditmonthwise;
