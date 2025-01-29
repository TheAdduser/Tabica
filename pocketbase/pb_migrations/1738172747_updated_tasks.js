/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2602490748")

  // update collection data
  unmarshal({
    "createRule": "",
    "listRule": "",
    "updateRule": "",
    "viewRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2602490748")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id ?~ assignee.id",
    "listRule": "@request.auth.id ?~ assignee.id",
    "updateRule": "@request.auth.id ?~ assignee.id",
    "viewRule": "@request.auth.id ?~ assignee.id"
  }, collection)

  return app.save(collection)
})
