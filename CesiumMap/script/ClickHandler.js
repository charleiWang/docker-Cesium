var collapsed = false
var collapsedware = false
function checkCollapsed() {
    if (collapsed) {
        collapsed = false
    }
    else {
        collapsed = true
    }
}

function checkCollapsedWarehouse() {
    if (collapsedware) {
        collapsedware = false
    }
    else {
        collapsedware = true
    }
}
var selector;
var rectangleSelector = new Cesium.Rectangle();
var screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
var cartesian = new Cesium.Cartesian3();
var tempCartographic = new Cesium.Cartographic();
var center = new Cesium.Cartographic();
var firstPoint = new Cesium.Cartographic();
var firstPointSet = false;
var mouseDown = false;
var camera = viewer.camera;
var coords = []

function viewerEventListener() {
    viewerEventRemoveListener()


    //Draw the selector while the user drags the mouse while holding ALT
    screenSpaceEventHandler.setInputAction(function drawSelector(movement) {
        if (!mouseDown) {
            return;
        }

        cartesian = camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid, cartesian);

        if (cartesian) {
            //mouse cartographic
            tempCartographic = Cesium.Cartographic.fromCartesian(cartesian, Cesium.Ellipsoid.WGS84, tempCartographic);

            if (!firstPointSet) {
                Cesium.Cartographic.clone(tempCartographic, firstPoint);
                firstPointSet = true;
            }
            else {
                rectangleSelector.east = Math.max(tempCartographic.longitude, firstPoint.longitude);
                rectangleSelector.west = Math.min(tempCartographic.longitude, firstPoint.longitude);
                rectangleSelector.north = Math.max(tempCartographic.latitude, firstPoint.latitude);
                rectangleSelector.south = Math.min(tempCartographic.latitude, firstPoint.latitude);
                selector.show = true;

            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE, Cesium.KeyboardEventModifier.ALT);

    screenSpaceEventHandler.setInputAction(function startClickALT() {
        mouseDown = true;
        coords = []
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN, Cesium.KeyboardEventModifier.ALT);

    screenSpaceEventHandler.setInputAction(function endClickALT() {
        mouseDown = false;
        firstPointSet = false;

        var longitudeString2 = Cesium.Math.toDegrees(rectangleSelector.east).toFixed(2);
        var latitudeString2 = Cesium.Math.toDegrees(rectangleSelector.north).toFixed(2);
        var longitudeString = Cesium.Math.toDegrees(rectangleSelector.west).toFixed(2);
        var latitudeString = Cesium.Math.toDegrees(rectangleSelector.south).toFixed(2);

        coords.push([parseFloat(longitudeString), parseFloat(latitudeString)], [parseFloat(longitudeString2), parseFloat(latitudeString2)])
        deleteDashboardWarehouseChild()
        SelectAreaLocation(coords, addToList)
        collapse()


    }, Cesium.ScreenSpaceEventType.LEFT_UP, Cesium.KeyboardEventModifier.ALT);

    //Hide the selector by clicking anywhere
    //  screenSpaceEventHandler.setInputAction(function hideSelector() {
    //      selector.show = false;
    //  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);


    var getSelectorLocation = new Cesium.CallbackProperty(function getSelectorLocation(time, result) {
        return Cesium.Rectangle.clone(rectangleSelector, result);
    }, false);


    selector = viewer.entities.add({
        id: 'rectangleAreaSelect',
        name: 'Selected Area',
        selectable: false,
        show: false,
        rectangle: {
            coordinates: getSelectorLocation,
            material: Cesium.Color.PURPLE.withAlpha(0.5),
            height:50
        },
         description: 'Area Selected'
    });


}
function collapse() {
    if (!collapsed) {
        document.getElementById('dash').click();
        collapsed = true;

    }
    if (!collapsedware) {
        document.getElementById('ware').click();
        collapsedware = true;
    }
}

function viewerEventRemoveListener() {
    deleteDashboardChild()
    deleteDashboardWarehouseChild()
    viewer.entities.removeById('rectangleAreaSelect')
    screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP, Cesium.KeyboardEventModifier.ALT)
    screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.ALT)
    screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN, Cesium.KeyboardEventModifier.ALT)
    screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE, Cesium.KeyboardEventModifier.ALT)

}
