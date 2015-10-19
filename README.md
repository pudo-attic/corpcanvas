# Corporate Network Canvas

This application is intended to be an in-browser tool to manage data about the structure of corporate networks. It is intended as a prototype which focusses on small sets of data which are manually layouted.


* [DRC Sample Data](https://github.com/openc/WhoControlsIt/blob/master/db/seeds/drc_bo.yml)

## Existing work

* [d3 Collapsible Tree Layout](http://bl.ocks.org/mbostock/4339083)
* [jQuery OrgChart](https://dl.dropboxusercontent.com/u/4151695/html/jOrgChart/example/example.html) (Source code: [here](https://github.com/wesnolte/jOrgChart/blob/master/jquery.jOrgChart.js)), [example to usage](http://jvloenen.home.xs4all.nl/orgchart/).
* [yEd live demo](http://live.yworks.com/yfiles-for-html/1.1/demos/Complete/demo.yfiles.graph.orgchart/index.html)
* [lib_gg_orgchart](http://librerias.logicas.org/lib_gg_orgchart/examples/demo-example-2.html)
* [Google Charts: Orgchart](https://developers.google.com/chart/interactive/docs/gallery/orgchart)



Graph()
    getEntities()
        Entity()
            gridX
            gridY
            gridWidth
            gridHeight
            contains(point)
            overlaps(entity)

Canvas
    canvas
    zoom()
    pan()
    translate(x, y)
    render()
