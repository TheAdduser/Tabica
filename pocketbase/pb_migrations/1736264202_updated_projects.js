/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id ~ owner.id ",
    "deleteRule": "@request.auth.id ~ owner.id",
    "updateRule": "@request.auth.id ~ owner.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id ~ owner ",
    "deleteRule": "@request.auth.id ~ owner",
    "updateRule": "@request.auth.id ~ owner"
  }, collection)

  return app.save(collection)
})
