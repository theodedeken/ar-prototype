console.log(data)
var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var markerRoot1, markerRoot2, markerRoot3;

var mesh1;

var languages;

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
        detectionMode: "mono_and_matrix",
        matrixCodeType: "3x3",
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
    markerRoot2 = new THREE.Group();
    scene.add(markerRoot2);
    markerRoot3 = new THREE.Group();
    scene.add(markerRoot3);

    let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
        type: 'barcode', barcodeValue: 0,
    })

    let markerControls2 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot2, {
        type: 'barcode', barcodeValue: 1,
    })

    let markerControls3 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot3, {
        type: 'barcode', barcodeValue: 2,
    })
    /*
    let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
        type: 'pattern', patternUrl: "hiro.patt",
    })*/
    languages = {};
    createTranslation(markerRoot1, lang["nl"], "nl", languages);
    createTranslation(markerRoot1, lang["en"], "en", languages);
    createTranslation(markerRoot1, lang["fr"], "fr", languages);
    createTranslation(markerRoot1, lang["gr"], "gr", languages);
    createTranslation(markerRoot1, lang["du"], "du", languages);
    createTranslation(markerRoot1, lang["wv"], "wv", languages);

    var geometry = new THREE.PlaneGeometry(3, 1.75, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    var plane = new THREE.Mesh(geometry, material);

    plane.rotation.x = -1.56;
    plane.position.x = 1.0;
    plane.position.z = 0.375;

    markerRoot1.add(plane)
    //createItem(markerRoot1, lang["nl"]);
    //createItem(markerRoot2, data[1]);
    //createItem(markerRoot3, data[2]);

}

function createTranslation(markerRoot, text, key, dictionary) {
    var text_mesh;
    var loader = new THREE.FontLoader();

    loader.load('font.json', function (font) {

        text_mesh = new TextWrapper().Wrap({
            string: text,
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


        text_mesh.position.y = 0.05;
        text_mesh.rotation.x = -1.56;
        text_mesh.position.z = -0.25;
        text_mesh.position.x = -0.25;

        markerRoot.add(text_mesh);
        text_mesh.visible = false;
        if (key === "nl") {
            curLanguageTxt = text_mesh;
            curLanguageTxt.visible = true;
        }
        dictionary[key] = text_mesh;
    });
}

function createItem(markerRoot, item) {
    var title_geom;
    var loader = new THREE.FontLoader();

    loader.load('font.json', function (font) {

        title_geom = new THREE.TextGeometry(item.title, {
            font: font,
            size: .2,
            height: .025,
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
        center.z = (title_geom.boundingBox.max.z - title_geom.boundingBox.min.z) / 2

        var x_max = title_geom.boundingBox.max.x;
        var z_max = title_geom.boundingBox.max.z;

        title_geom = new THREE.BufferGeometry().fromGeometry(title_geom);

        // create a mesh with it
        title_mesh = new THREE.Mesh(title_geom, material1)
        title_mesh.position.y = 0.05;
        title_mesh.position.x = -x_max;
        title_mesh.rotation.x = -1.56;
        title_mesh.position.z = -z_max;

        body_mesh = new TextWrapper().Wrap({
            string: item.description,
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


        body_mesh.position.y = 0.05;
        body_mesh.rotation.x = -1.56;
        body_mesh.position.z = 10 * center.z;



        markerRoot.add(title_mesh);
        markerRoot.add(body_mesh);


        var geometry = new THREE.PlaneGeometry(6, 2, 32);
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        var plane = new THREE.Mesh(geometry, material);



        plane.rotation.x = -1.56;
        plane.position.x = 2.5;
        plane.position.z = 0.5;

        markerRoot.add(plane)
    });
}

var curLanguageTxt;

function changeLanguage(selected) {
    curLanguageTxt.visible = false;
    curLanguageTxt = languages[selected];
    curLanguageTxt.visible = true;
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
    languages["nl"].visible = !languages["nl"].visible;
}
window.onkeydown = function (e) {
    if (e.key == "ArrowDown") {
        scaleDown()
    }
}