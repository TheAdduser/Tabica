/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id ~ assignee || @request.auth.id ~ owner",
    "viewRule": "@request.auth.id ~ assignee || @request.auth.id ~ owner"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id ~ assignee",
    "viewRule": "@request.auth.id ~ assignee"
  }, collection)

  return app.save(collection)
})
