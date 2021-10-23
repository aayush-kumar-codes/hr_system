function Document (database,type) {
    const document = database.define(
        'documents',
        {
            title:type.STRING,
            filepath:type.STRING,
            uploaded_on:type.DATE

        }
           

    )

}