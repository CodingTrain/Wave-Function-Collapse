let ui_div = undefined
let ui_line_div = undefined

let current_loader = undefined

let tileFileInput = undefined
let tileFileLabel = undefined
let tileSizeInput = undefined
let tileStepInput = undefined
let tileOverlapInput = undefined
let progressLabel = undefined

function start_ui() {
    ui_div = createDiv()
    ui_div.position(width + 20, 20)
    ui_div.style('background:white')
    ui_div.style('width:350pt')
    ui_div.style('height:400pt')
    ui_div.style('padding:8pt')
}

function start_ui_line() {
    ui_line_div = createDiv()
    ui_line_div.parent(ui_div)
    ui_line_div.style('padding:3pt')
}

function add_ui_to_line(elem) {
    elem.parent(ui_line_div)
    return elem
}

function add_separator_to_line() {
    let sep = add_ui_to_line(createSpan(' '))
    sep.style('width:12pt;padding:4pt')
}

function _update_loader_with_ui() {
    // TODO: updating a file input with its value does not work/
    // tileFileInput.value(current_loader.url)

    if (current_loader instanceof SingleImageTileLoader) {
        current_loader.tile_size = max(1, int(tileSizeInput.value()))
        current_loader.tile_step = max(1, int(tileStepInput.value()))
        current_loader.edge_depth = max(1, int(tileOverlapInput.value()) + 1)
        return true
    }
    return false
}

function _update_file_label(url) {
    let fileName
    if (url != undefined)
        fileName = url.match('([^/.]+)+/?(\.[a-zA-Z0-9]+)?$')[1]
    else
        fileName = '(No file selected)'
    tileFileLabel.html(fileName)
}

function _update_ui_with_loader() {
    //tileFileInput.value(current_loader.url)
    if (current_loader instanceof SingleImageTileLoader) {
        tileSizeInput.value(current_loader.tile_size)
        tileStepInput.value(current_loader.tile_step)
        tileOverlapInput.value(current_loader.edge_depth - 1)
    }
}

function _reload() {
    stop_all_algorithms()
    queue_algorithm(current_loader)
}

function _load_from_file(selected_file) {
    if (selected_file == undefined)
        return
    
    if (selected_file.type !== 'image') {
        console.log(`File ${file} is not an image but a ${selected_file.type}`)
        return
    }

    current_loader = new SingleImageTileLoader(selected_file.data)
    _update_loader_with_ui()
    _reload()
}

function update_progress_ui(progress) {
    if (progress == undefined)
        progress = ''
    else
        progress = `: <span style="font-size:11pt">${progress}</span>`

    progressLabel.html(`<h3 style="font-size:14pt">Image Generation${progress}</h3>`)
}

function createUI() {
    start_ui()

    start_ui_line()

    progressLabel = add_ui_to_line(createSpan())
    update_progress_ui()

    add_ui_to_line(createSpan('Available tiles '))
    let imageSelect = add_ui_to_line(createSelect())
    imageSelect.option('Choose a tile set')
    for (key of loaders.keys()) {
        imageSelect.option(key)
    }
    imageSelect.input(function() {
        let key = imageSelect.selected()
        current_loader = loaders.get(key)
        if (current_loader != undefined)
            _update_file_label(current_loader.url)
        _update_ui_with_loader()
        _reload()
    })

    start_ui_line()

    add_ui_to_line(createSpan('Loaded tiles: '))
    tileFileLabel = add_ui_to_line(createSpan('(No file selected)'))
    add_separator_to_line()
    tileFileButton = add_ui_to_line(createButton('Select...'))
    tileFileButton.mouseClicked(function() {
        tileFileInput.elt.click()
    })
    tileFileInput = add_ui_to_line(createFileInput(function(file) {
        imageSelect.selected('Choose a tile set')
        if (file != undefined)
            _update_file_label(file.name)
        _load_from_file(file)
    }))
    tileFileInput.style('display:none')

    start_ui_line()

    add_ui_to_line(createSpan('Tile size '))
    tileSizeInput = add_ui_to_line(createInput('3', 'number'))
    tileSizeInput.style('width:30pt')
    tileSizeInput.input(function() {
        if (_update_loader_with_ui())
            _reload()
    })

    add_separator_to_line()

    add_ui_to_line(createSpan('Tile step '))
    tileStepInput = add_ui_to_line(createInput('3', 'number'))
    tileStepInput.style('width:30pt')
    tileStepInput.input(function() {
        if (_update_loader_with_ui())
            _reload()
    })

    add_separator_to_line()

    add_ui_to_line(createSpan('Tile overlap '))
    tileOverlapInput = add_ui_to_line(createInput('0', 'number'))
    tileOverlapInput.style('width:30pt')
    tileOverlapInput.input(function() {
        if (_update_loader_with_ui())
            _reload()
    })

    start_ui_line()

    let allowTileRotationsCheck = add_ui_to_line(createCheckbox('Generate tile rotations', false))
    allowTileRotationsCheck.mouseClicked(function(){
        enableTileRotations(allowTileRotationsCheck.checked())
        _reload()
    })
    start_ui_line()

    let allowTileFlipsCheck = add_ui_to_line(createCheckbox('Generate tile flips', false))
    allowTileFlipsCheck.mouseClicked(function(){
        enableTileFlips(allowTileFlipsCheck.checked())
        _reload()
    })

    start_ui_line()

    let useTileFrequenciesCheck = add_ui_to_line(createCheckbox('Use tile frequencies', true))
    useTileFrequenciesCheck.mouseClicked(function(){
        enableTileFrequencies(useTileFrequenciesCheck.checked())
    })

    start_ui_line()

    let drawSmoothCheck = add_ui_to_line(createCheckbox('Smooth scale tile images', false))
    drawSmoothCheck.mouseClicked(function(){
        enableDrawSmooth(drawSmoothCheck.checked())
    })

    start_ui_line()

    let restartButton = add_ui_to_line(createButton('Restart'))
    restartButton.mouseClicked(start)

    add_separator_to_line()

    let playButton = add_ui_to_line(createButton('Run'))
    playButton.mouseClicked(function() {
        loop()
    })

    add_separator_to_line()

    let pauseButton = add_ui_to_line(createButton('Pause'))
    pauseButton.mouseClicked(function() {
        noLoop()
    })

    add_separator_to_line()

    let cancelButton = add_ui_to_line(createButton('Cancel'))
    cancelButton.mouseClicked(function() {
        imageSelect.selected('Choose a tile set')
        _update_file_label()
        stop_all_algorithms()
    })

    start_ui_line()

    add_ui_to_line(createSpan('<h3 style="font-size:14pt">Debug Helpers</h3>'))

    let showNeighborsCheck = add_ui_to_line(createCheckbox('Show tile neighbors'))
    showNeighborsCheck.mouseClicked(function(){
        enableDrawTileOptions(showNeighborsCheck.checked())
        triggerFullRedraw()
        loop()
    })

    let showNeighborsLabel = add_ui_to_line(createSpan('Showing tile #1   '))
    let prevDrawTileButton = add_ui_to_line(createButton('<'))
    prevDrawTileButton.mouseClicked(function() {
        changeDrawnTileOptions(-1)
        showNeighborsLabel.html(`Showing tile #${drawnTileIndex+1}   `)
    })

    let nextDrawTileButton = add_ui_to_line(createButton('>'))
    nextDrawTileButton.mouseClicked(function() {
        changeDrawnTileOptions(1)
        showNeighborsLabel.html(`Showing tile #${drawnTileIndex+1}   `)
    })

    start_ui_line()

    let showEdgesCheck = add_ui_to_line(createCheckbox('Show unique tile edges'))
    showEdgesCheck.mouseClicked(function(){
        enableDrawEdges(showEdgesCheck.checked())
        triggerFullRedraw()
        loop()
    })

    start_ui_line()

    let logCellOptionsCheck = add_ui_to_line(createCheckbox('Log the options of a clicked cell'))
    logCellOptionsCheck.mouseClicked(function(){
        enableLogCellOptions(logCellOptionsCheck.checked())
    })

    start_ui_line()

    let showContradictionsCheck = add_ui_to_line(createCheckbox('Show contradictions'))
    showContradictionsCheck.mouseClicked(function(){
        enableShowContradictions(showContradictionsCheck.checked())
        loop()
    })

}
