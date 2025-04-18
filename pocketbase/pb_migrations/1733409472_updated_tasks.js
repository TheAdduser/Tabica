/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2602490748")

  // update collection data
  unmarshal({
    "createRule": "project.assignee.id ~ @request.auth.id  ",
    "deleteRule": "project.assignee.id ~ @request.auth.id  ",
    "listRule": "project.assignee.id ~ @request.auth.id  ",
    "updateRule": "project.assignee.id ~ @request.auth.id  ",
    "viewRule": "project.assignee.id ~ @request.auth.id  "
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2602490748")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": "",
    "updateRule": null,
    "viewRule": ""
  }, collection)

  return app.save(collection)
})
