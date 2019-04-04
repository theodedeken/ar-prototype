console.log(data)
var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var markerRoot1, markerRoot2;

var mesh1;

initialize();
animate();

function initialize() {
    scene = new THREE.Scene();

    let ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
    scene.add(ambientLight);

    camera = new THREE.Camera();
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    renderer.setSize(640, 480);
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    document.body.appendChild(renderer.domElement);

    clock = new THREE.Clock();
    deltaTime = 0;
    totalTime = 0;

    ////////////////////////////////////////////////////////////
    // setup arToolkitSource
    ////////////////////////////////////////////////////////////

    arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam',
    });

    function onResize() {
        arToolkitSource.onResize()
        arToolkitSource.copySizeTo(renderer.domElement)
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
        }
    }

    arToolkitSource.init(function onReady() {
        onResize()
    });

    // handle resize event
    window.addEventListener('resize', function () {
        onResize()
    });

    ////////////////////////////////////////////////////////////
    // setup arToolkitContext
    ////////////////////////////////////////////////////////////	

    // create atToolkitContext
    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'camera_para.dat',
        detectionMode: 'mono'
    });

    // copy projection matrix to camera when initialization complete
    arToolkitContext.init(function onCompleted() {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

    ////////////////////////////////////////////////////////////
    // setup markerRoots
    ////////////////////////////////////////////////////////////

    // build markerControls


    markerRoot1 = new THREE.Group();
    scene.add(markerRoot1);

    /*let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
        type: 'barcode', barcodeValue: 0,
    })
    */
    let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
        type: 'pattern', patternUrl: "hiro.patt",
    })

    var title_geom;
    var loader = new THREE.FontLoader();

    loader.load('font.json', function (font) {

        title_geom = new THREE.TextGeometry(data[0].title, {
            font: font,
            size: .4,
            height: .05,
            curveSegments: 12,
            bevelEnabled: false
        });

        let material1 = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide
        });

        title_geom.computeBoundingBox();
        title_geom.computeVertexNormals();



        var center = new THREE.Vector3();
        center.x = (title_geom.boundingBox.max.x - title_geom.boundingBox.min.x) / 2
        // center.y	= (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2
        center.z = (title_geom.boundingBox.max.z - title_geom.boundingBox.min.z) / 2

        title_geom = new THREE.BufferGeometry().fromGeometry(title_geom);

        // create a mesh with it
        title_mesh = new THREE.Mesh(title_geom, material1)
        title_mesh.position.y = 0.5;
        title_mesh.rotation.x = -1.56;
        title_mesh.position.z = center.z;

        body_mesh = new TextWrapper().Wrap({
            string: data[1].description,
            size: .08,
            font: font,
            color: 0x000000,
            lineLength: 50,
            height: .01,
            coords: {
                x: 0,
                y: 0,
                z: 0
            }
        });


        body_mesh.position.y = 0.5;
        body_mesh.rotation.x = -1.56;
        body_mesh.position.z = 10 * center.z;



        markerRoot1.add(title_mesh);
        markerRoot1.add(body_mesh);

        var geometry = new THREE.PlaneGeometry(5, 5, 32);
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        var plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -1.56;
        plane.position.x = 2;
        plane.position.z = 2;

        markerRoot1.add(plane)
    });

}


function update() {
    // update artoolkit on every frame
    if (arToolkitSource.ready !== false)
        arToolkitContext.update(arToolkitSource.domElement);
}


function render() {
    renderer.render(scene, camera);
}


function animate() {
    requestAnimationFrame(animate);
    deltaTime = clock.getDelta();
    totalTime += deltaTime;
    update();
    render();
}
var title_mesh, body_mesh;
var curscale = 1
function scaleDown() {
    console.log(title_mesh.rotation)
    curscale -= 0.001
    title_mesh.scale.set(curscale, curscale, curscale)
}
window.onkeydown = function (e) {
    if (e.key == "ArrowDown") {
        scaleDown()
    }
}