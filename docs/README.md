# WPS in Lizmap

For a given project `project.qgs`, you need to create a `project.qgs.json`

```json
{
  "model:nomOfTheModel": {
    "input": [
      "name of the layer"
    ],
    "__job_label": "native:centroids_1:OUTPUT"
  },
  "model:Modèle": {
  }
}
```

In QGIS Desktop, to get :

* the name of the model, wait for the tooltip in the Processing toolbox when hovering your model
