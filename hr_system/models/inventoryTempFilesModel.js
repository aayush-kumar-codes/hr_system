function inventoryTempFiles(database, type) {
  const InventoryTempFiles = database.define("inventory_temp_files", {
    file_id: type.INTEGER,
  });
  InventoryTempFiles.associate = (models) => {
    models.InventoryTempFiles.hasOne(models.FilesModel, {
      foreignKey: "file_id",
      as: "file",
    });
  };

  return InventoryTempFiles;
}

module.exports = inventoryTempFiles;
