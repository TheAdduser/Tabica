/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "listRule": "assignee ~ @request.auth.id  ",
    "viewRule": "assignee ~ @request.auth.id  "
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id ~ assignee.id",
    "viewRule": "@request.auth.id ~ assignee.id"
  }, collection)

  return app.save(collection)
})